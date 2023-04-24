# Silverstripe Versioned Admin Module

[![CI](https://github.com/silverstripe/silverstripe-versioned-admin/actions/workflows/ci.yml/badge.svg)](https://github.com/silverstripe/silverstripe-versioned-admin/actions/workflows/ci.yml)
[![Silverstripe supported module](https://img.shields.io/badge/silverstripe-supported-0071C4.svg)](https://www.silverstripe.org/software/addons/silverstripe-commercially-supported-module-list/)

## Overview

Adds frontend admin interfaces for managing DataObjects that implement versioning
using [silverstripe/versioned](https://github.com/silverstripe/silverstripe-versioned).

## Installation

```sh
composer require silverstripe/versioned-admin
```

## Documentation

For Developer documentation see ["Versioning" on docs.silverstripe.org](https://docs.silverstripe.org/en/developer_guides/model/versioning/)

For CMS User help see ["Using history" on userhelp.silverstripe.org](https://userhelp.silverstripe.org/en/optional_features/content_blocks/history/)

## Versioning

This library follows [Semver](http://semver.org). According to Semver,
you will be able to upgrade to any minor or patch version of this library
without any breaking changes to the public API. Semver also requires that
we clearly define the public API for this library.

All methods, with `public` visibility, are part of the public API. All
other methods are not part of the public API. Where possible, we'll try
to keep `protected` methods backwards-compatible in minor/patch versions,
but if you're overriding methods then please test your work before upgrading.

## Reporting Issues

Please [create an issue](https://github.com/silverstripe/silverstripe-versioned-admin/issues)
for any bugs you've found, or features you're missing.

## License

This module is released under the [BSD 3-Clause License](LICENSE)
