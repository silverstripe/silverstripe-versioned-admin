# SilverStripe Versioned Admin Module

[![Build Status](https://api.travis-ci.org/silverstripe/silverstripe-versioned-admin.svg?branch=master)](https://travis-ci.org/silverstripe/silverstripe-versioned-admin)
[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/silverstripe/silverstripe-versioned-admin/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/silverstripe/silverstripe-versioned-admin/?branch=master)
[![codecov](https://codecov.io/gh/silverstripe/silverstripe-versioned-admin/branch/master/graph/badge.svg)](https://codecov.io/gh/silverstripe/silverstripe-versioned-admin)
[![License](https://poser.pugx.org/silverstripe/versioned-admin/license.svg)](https://github.com/silverstripe/silverstripe-versioned-admin#license)

## Overview

Adds frontend admin interfaces for managing DataObjects that implement versioning
using [silverstripe/versioned](https://github.com/silverstripe/silverstripe-versioned).

## Installation

```
$ composer require silverstripe/versioned-admin
```

## Documentation

See [doc.silverstripe.org](https://docs.silverstripe.org)

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
