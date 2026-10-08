const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { before, after, test } = require('node:test');
const { Registry, INITIAL, parseRawGrammar } = require('vscode-textmate');
const oniguruma = require('vscode-oniguruma');

const root = path.resolve(__dirname, '..');
const manifest = require('../package.json');
const upstream = require('../syntaxes/upstream.json');
let registry;

before(async () => {
  await oniguruma.loadWASM(fs.readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm')));
  registry = new Registry({
    onigLib: Promise.resolve({
      createOnigScanner: patterns => new oniguruma.OnigScanner(patterns),
      createOnigString: text => new oniguruma.OnigString(text),
    }),
    loadGrammar: async scope => {
      const entry = manifest.contributes.grammars.find(grammar => grammar.scopeName === scope);
      if (!entry) return null;
      const filename = path.join(root, entry.path);
      return parseRawGrammar(fs.readFileSync(filename, 'utf8'), filename);
    },
  });
});

after(() => registry?.dispose());

async function tokenize(language, source) {
  const grammar = await registry.loadGrammar(`source.${language}`);
  assert.ok(grammar);
  let stack = INITIAL;
  return source.split(/\r?\n/).map(line => {
    const result = grammar.tokenizeLine(line, stack, 1000);
    assert.equal(result.stoppedEarly, false, 'Tokenization exceeded the per-line budget');
    stack = result.ruleStack;
    return { line, tokens: result.tokens };
  });
}

function expectScope(lines, text, prefix, lineIndex = 0) {
  const { line, tokens } = lines[lineIndex];
  const index = line.indexOf(text);
  assert.notEqual(index, -1, `Missing test text: ${text}`);
  const token = tokens.find(token => token.startIndex <= index && token.endIndex > index);
  assert.ok(token?.scopes.some(scope => scope.startsWith(prefix)),
    `${text}: expected ${prefix}, got ${token?.scopes.join(', ')}`);
}

test('manifest contributes only languages and grammars, with no runtime', () => {
  assert.deepEqual(Object.keys(manifest.contributes).sort(), ['grammars', 'languages']);
  for (const field of ['main', 'browser', 'activationEvents', 'dependencies']) {
    assert.equal(manifest[field], undefined);
  }
  for (const [extension, id] of Object.entries({ '.v': 'verilog', '.vh': 'verilog', '.sv': 'systemverilog', '.svh': 'systemverilog' })) {
    assert.equal(manifest.contributes.languages.find(language => language.extensions.includes(extension))?.id, id);
  }
  for (const entry of manifest.contributes.grammars) {
    const grammar = JSON.parse(fs.readFileSync(path.join(root, entry.path), 'utf8'));
    assert.equal(grammar.scopeName, entry.scopeName);
    assert.ok(manifest.contributes.languages.some(language => language.id === entry.language));
  }
});

test('vendored grammars match recorded checksums and document local changes', () => {
  assert.match(upstream.commit, /^[a-f0-9]{40}$/);
  assert.equal(upstream.files.length, 2);
  for (const file of upstream.files) {
    assert.match(file.upstreamSha256, /^[a-f0-9]{64}$/);
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root, file.path))).digest('hex'), file.sha256);
    if (file.sha256 !== file.upstreamSha256) assert.ok(file.changes?.length);
  }
  const notices = fs.readFileSync(path.join(root, 'THIRD_PARTY_NOTICES.txt'), 'utf8');
  for (const required of ['Masahiro H', 'Eirik Prestegårdshus', 'Permission to copy, use, modify, sell and distribute']) {
    assert.ok(notices.includes(required));
  }
});

for (const language of ['verilog', 'systemverilog']) {
  const moduleScope = language === 'verilog' ? 'storage.type.module.' : 'keyword.control.';
  for (const [name, source, token, scope] of [
    ['module declarations', 'module demo; endmodule', 'module', moduleScope],
    ['line comments', '// module is a comment', 'module', 'comment.'],
    ['strings containing comment markers', '$display("hello // world");', '//', 'string.'],
    ['hex literals', "assign value = 8'hAF;", "8'hAF", 'constant.numeric.'],
    ['binary literals', "assign value = 4'b10xz;", "4'b10xz", 'constant.numeric.'],
    ['system tasks', '$display("hello");', '$display', 'support.function.'],
  ]) {
    test(`${language}: ${name}`, async () => {
      expectScope(await tokenize(language, source), token, scope);
    });
  }

  test(`${language}: multiline comments end without leaking into code`, async () => {
    const lines = await tokenize(language, '/* module\nstill a comment */\nmodule demo; endmodule');
    expectScope(lines, 'module', 'comment.', 0);
    expectScope(lines, 'still', 'comment.', 1);
    expectScope(lines, 'module', moduleScope, 2);
  });

  test(`${language}: escaped quotes do not terminate a string`, async () => {
    const lines = await tokenize(language, '$display("say \\"hello\\" // text");');
    expectScope(lines, '//', 'string.');
  });

  test(`${language}: unterminated block comment remains a comment`, async () => {
    const lines = await tokenize(language, '/* unfinished\nmodule unfinished;');
    expectScope(lines, 'module', 'comment.', 1);
  });

  test(`${language}: LF and CRLF tokenize identically`, async () => {
    const source = 'module demo;\n// comment\nendmodule';
    assert.deepEqual(await tokenize(language, source), await tokenize(language, source.replaceAll('\n', '\r\n')));
  });
}

test('SystemVerilog: vector types, classes, and time literals', async () => {
  expectScope(await tokenize('systemverilog', 'logic [7:0] data;'), 'logic', 'storage.type.');
  expectScope(await tokenize('systemverilog', 'class packet; endclass'), 'class', 'storage.type.');
  expectScope(await tokenize('systemverilog', '#5ns;'), '5ns', 'constant.numeric.');
});

for (const keyword of ['assert', 'assume', 'cover', 'restrict']) {
  for (const label of ['', 'check_ready: ']) {
    test(`SystemVerilog: ${label ? 'labelled' : 'unlabelled'} ${keyword} property`, async () => {
      const lines = await tokenize('systemverilog', `module demo;\n${label}${keyword} property (@(posedge clk) ready);\nendmodule`);
      expectScope(lines, keyword, 'keyword.', 1);
    });
  }
}

for (const filename of fs.readdirSync(path.join(root, 'examples'))) {
  test(`example tokenizes completely: ${filename}`, async () => {
    const language = /\.svh?$/.test(filename) ? 'systemverilog' : 'verilog';
    const source = fs.readFileSync(path.join(root, 'examples', filename), 'utf8');
    const lines = await tokenize(language, source);
    for (const { line, tokens } of lines) {
      assert.ok(tokens.length > 0);
      assert.equal(tokens[0].startIndex, 0);
      assert.ok(tokens.at(-1).endIndex >= line.length);
      for (let index = 1; index < tokens.length; index++) {
        assert.equal(tokens[index - 1].endIndex, tokens[index].startIndex);
      }
    }
  });
}
