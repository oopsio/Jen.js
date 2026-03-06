# Vendor Directory

This directory contains **vendored third-party source code** used by the framework runtime.

Vendoring dependencies ensures the runtime:

* works **without external CDNs**
* behaves consistently across environments
* works **offline**
* avoids runtime network requests
* prevents version drift

Only the **files required by the runtime** are included.

---

## Included Software

### Preact

Parts of **Preact** are vendored for the framework runtime.

Preact is a small, fast UI library compatible with JSX.

License: MIT

The relevant **ES Module builds** from the Preact package are copied into this directory.

Only the module builds required by the runtime are included.

---

## License Notice

The vendored Preact files remain licensed under the **MIT License**.

The original license file is included in the corresponding directory:

```
vendor/preact/LICENSE
```

The main project is licensed under **GNU General Public License v3.0 (GPL-3.0)**.

MIT-licensed software is compatible with GPL-3.0 and can be redistributed alongside it.

---

## Updating Vendored Dependencies

To update vendored dependencies:

1. Install the dependency from **npm**.

2. Copy the **ES module builds** (`*.module.js` or `*.mjs`) from the package into the appropriate vendor directory.

3. Format the copied files for readability using either:

* Prettier
* https://beautifier.io/

4. Ensure the upstream **LICENSE file** is included.

Do not modify vendored source files unless absolutely necessary.
If changes are required, they should be documented clearly.

---

## Example Structure

```
vendor/
  preact/
    preact.module.js
    hooks.module.js
    jsx-runtime.module.js
    jsx-dev-runtime.module.js
    LICENSE
```

Only the minimal files required by the runtime should be included.
