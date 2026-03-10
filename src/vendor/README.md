# Vendor Directory

This directory contains **vendored third-party source code** used by the framework runtime.

Vendoring dependencies ensures the runtime:

- works **without external CDNs**
- behaves consistently across environments
- works **offline**
- avoids runtime network requests
- prevents version drift

Only the **files required by the runtime** are included.

---

# Included Software

## Preact

Parts of **Preact** are vendored for the framework runtime.

Preact is a small, fast UI library compatible with JSX.

License: **MIT**

The relevant **ES Module builds** from the Preact package are copied into this directory.

Only the module builds required by the runtime are included.

---

## Glob

The **Glob** library and its required files are vendored.

Glob is a utility used to match filesystem paths using glob patterns (similar to wildcard matching).

It allows patterns such as:

```
src/**/*.ts
```

to match files recursively.

License: **Blue Oak Model License**

License text:

All packages under `src/` are licensed according to the terms in
their respective `LICENSE` or `LICENSE.md` files.

The remainder of this project is licensed under the Blue Oak Model License.

_(license text unchanged below)_

---

# Blue Oak Model License

Version 1.0.0

## Purpose

This license gives everyone as much permission to work with
this software as possible, while protecting contributors
from liability.

## Acceptance

In order to receive this license, you must agree to its
rules. The rules of this license are both obligations
under that agreement and conditions to your license.
You must not do anything with this software that triggers
a rule that you cannot or will not follow.

## Copyright

Each contributor licenses you to do everything with this
software that would otherwise infringe that contributor's
copyright in it.

## Notices

You must ensure that everyone who gets a copy of
any part of this software from you, with or without
changes, also gets the text of this license or a link to
[https://blueoakcouncil.org/license/1.0.0](https://blueoakcouncil.org/license/1.0.0).

## Excuse

If anyone notifies you in writing that you have not
complied with Notices, you can keep your license by
taking all practical steps to comply within 30 days
after the notice. If you do not do so, your license
ends immediately.

## Patent

Each contributor licenses you to do everything with
this software that would otherwise infringe any
patent claims they can license or become able to
license.

## Reliability

No contributor can revoke this license.

## No Liability

**_As far as the law allows, this software comes as is,
without any warranty or condition, and no contributor
will be liable to anyone for any damages related to
this software or this license, under any kind of
legal claim._**

---

## Sass

The framework vendors parts of **Dart Sass**.

Sass is a CSS preprocessor that adds features such as:

- variables
- nesting
- mixins
- functions
- modular stylesheets

The vendored runtime allows the framework to compile `.scss` and `.sass` files without requiring users to install Sass separately.

Only the **Node runtime files required for compilation** are included.

License: **MIT**

The original license file is included in:

```
vendor/sass/LICENSE
```

---

# License Notice

The vendored **Preact** and **Sass** files remain licensed under the **MIT License**.

Their original license files are included in the corresponding directories:

```
vendor/preact/LICENSE
vendor/sass/LICENSE
```

Glob remains licensed under the **Blue Oak Model License**.

The main project is licensed under **GNU General Public License v3.0 (GPL-3.0)**.

MIT-licensed software is compatible with GPL-3.0 and can be redistributed alongside it.

---

# Updating Vendored Dependencies

To update vendored dependencies:

1. Install the dependency from **npm**.

2. Copy the **ES module builds** (`*.module.js` or `*.mjs`) from the package into the appropriate vendor directory.

3. Format the copied files for readability using either:

- Prettier
- [https://beautifier.io/](https://beautifier.io/)

4. Ensure the upstream **LICENSE file** is included.

Do not modify vendored source files unless absolutely necessary.
If changes are required, they should be documented clearly.
