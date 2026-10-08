# Verilog / SystemVerilog Syntax

A lightweight VS Code extension that provides syntax highlighting for Verilog and SystemVerilog—without a language server, runtime code, or external HDL tools.

## Features

- TextMate-based highlighting for keywords, comments, strings, numeric literals, system tasks, and other language constructs.
- SystemVerilog highlighting for types, classes, time literals, and labelled or unlabelled `assert`, `assume`, `cover`, and `restrict` property statements.
- No linting, formatting, compilation, simulation, or language-server features.

| Language | File extensions |
| --- | --- |
| Verilog | `.v`, `.vh`, `.vl` |
| SystemVerilog | `.sv`, `.svh`, `.SV` |

Requires VS Code 1.75.0 or later. Highlighting colors depend on your active theme.

## Installation

Build a VSIX locally using the development instructions below, or download one from this repository's GitHub Releases when a release is available.

In VS Code, open the Command Palette, select **Extensions: Install from VSIX...**, and choose the `.vsix` file. Alternatively, install a locally built package from a terminal:

```sh
code --install-extension verilog-syntax-0.1.0.vsix
```

Replace the filename with the version you built or downloaded. Open a supported file to enable highlighting; if needed, select **Verilog** or **SystemVerilog** from the language mode picker in the status bar.

If another extension supplies highlighting for the same languages, disable it for the workspace when checking this extension's behavior.

## Development

Use Node.js 24, matching CI, and npm. From the repository root:

```sh
npm ci
npm test
npm run package
```

`npm run package` runs the tests and creates `verilog-syntax-<version>.vsix`. Development dependencies are not bundled into the extension.

The test suite checks the extension manifest, vendored grammar checksums, token scopes, comments and strings, line endings, SystemVerilog assertions, and the files in `examples/`.

### Preview in VS Code

Open the repository in VS Code and press **F5** to run the **Preview Syntax Extension** launch configuration. It opens an Extension Development Host with the example files and other extensions disabled.

### Preview in a browser

```sh
npm run preview
```

Open `http://localhost:9321` after the server starts. The command serves a VS Code web preview with this extension and the example workspace; it does not launch a browser automatically. The first run may download the VS Code web build. Stop the server with **Ctrl+C**.

## Releases

GitHub Actions runs tests for pushes to `main`, pull requests, and version tags. Pushing a tag of the form `v<version>` also builds a VSIX and publishes it as a GitHub Release after tests pass. The tag must match the `version` in `package.json` exactly; for example, version `0.1.0` requires tag `v0.1.0`.

The workflow does not publish to the VS Code Marketplace.

## Grammar sources and licenses

The grammars are vendored from [mshr-h/vscode-verilog-hdl-support](https://github.com/mshr-h/vscode-verilog-hdl-support) at commit `53484f7c5bc6313cf648955d050dbffcd3fe6855`. Their origins include [VSCode-SystemVerilog](https://github.com/eirikpre/VSCode-SystemVerilog) and the [TextMate Verilog Bundle](https://github.com/textmate/verilog.tmbundle).

[syntaxes/upstream.json](syntaxes/upstream.json) records the pinned revision, checksums, and local SystemVerilog assertion-highlighting change. See [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt) for the applicable licenses and attribution.
