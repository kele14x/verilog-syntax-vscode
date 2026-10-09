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

Install [Verilog / SystemVerilog Syntax from the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=kele14x.verilog-syntax), or search for `kele14x.verilog-syntax` in the VS Code Extensions view.

From a terminal, run:

```sh
code --install-extension kele14x.verilog-syntax
```

### Install from a VSIX

Build a VSIX locally using the development instructions below, or download one from this repository's GitHub Releases when a release is available.

In VS Code, open the Command Palette, select **Extensions: Install from VSIX...**, and choose the `.vsix` file. Alternatively, install a locally built package from a terminal:

```sh
code --install-extension verilog-syntax-0.1.1.vsix
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

`npm run package` runs the tests through the `vscode:prepublish` hook and creates `verilog-syntax-<version>.vsix`. Development dependencies are not bundled into the extension.

The test suite checks the extension manifest, vendored grammar checksums, token scopes, comments and strings, line endings, SystemVerilog assertions, and the files in `examples/`.

### Preview in VS Code

Open the repository in VS Code and press **F5** to run the **Preview Syntax Extension** launch configuration. It opens an Extension Development Host with the example files and other extensions disabled.

### Preview in a browser

```sh
npm run preview
```

Open `http://localhost:9321` after the server starts. The command serves a VS Code web preview with this extension and the example workspace; it does not launch a browser automatically. The first run may download the VS Code web build. Stop the server with **Ctrl+C**.

## Releases

GitHub Actions runs tests for pushes to `main`, pull requests, and version tags. Pushing a tag of the form `v<version>` also builds a VSIX and publishes it as a GitHub Release after tests pass. The tag must match the `version` in `package.json` exactly; for example, version `0.1.1` requires tag `v0.1.1`.

The workflow does not publish to the VS Code Marketplace.

### Publish to the VS Code Marketplace

The extension ID is `kele14x.verilog-syntax`. The `publisher` in `package.json` must match a Marketplace publisher you own. Follow the [official publishing guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) to create the `kele14x` publisher if needed and obtain a Personal Access Token with the **Marketplace (Manage)** scope.

From the repository root, authenticate and publish the current source:

```sh
npx --no-install vsce login kele14x
npm run publish:marketplace
```

The publish command runs the tests before packaging and uploading. To upload the VSIX you already built and tested, use:

```sh
npx --no-install vsce publish --packagePath verilog-syntax-0.1.1.vsix
```

Alternatively, upload the VSIX through the [Marketplace publisher management page](https://marketplace.visualstudio.com/manage). Use a new version for each release and keep `package.json`, `package-lock.json`, and [CHANGELOG.md](CHANGELOG.md) in sync.

## Support

Report highlighting issues at [GitHub Issues](https://github.com/kele14x/verilog-syntax-vscode/issues). Include a small Verilog or SystemVerilog example, your VS Code version, and your active theme.

## License and grammar sources

Original project code is licensed under the [MIT License](LICENSE). Vendored grammars retain their respective licenses and copyright notices.

The grammars are vendored from [mshr-h/vscode-verilog-hdl-support](https://github.com/mshr-h/vscode-verilog-hdl-support) at commit `53484f7c5bc6313cf648955d050dbffcd3fe6855`. Their origins include [VSCode-SystemVerilog](https://github.com/eirikpre/VSCode-SystemVerilog) and the [TextMate Verilog Bundle](https://github.com/textmate/verilog.tmbundle).

[syntaxes/upstream.json](syntaxes/upstream.json) records the pinned revision, checksums, and local SystemVerilog assertion-highlighting change. See [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt) for the applicable licenses and attribution.
