<?php

namespace SilverStripe\VersionedAdmin\Tests\Behat\Context;

use SilverStripe\BehatExtension\Context\FixtureContext as BaseFixtureContext;
use SilverStripe\BehatExtension\Utility\StepHelper;

if (!class_exists(BaseFixtureContext::class)) {
    return;
}

/**
 * Context used to create fixtures in the SilverStripe ORM.
 */
class FixtureContext extends BaseFixtureContext
{
    use StepHelper;
}
