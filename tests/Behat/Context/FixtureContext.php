<?php

namespace SilverStripe\VersionedAdmin\Tests\Behat\Context;

use Behat\Mink\Element\DocumentElement;
use Behat\Mink\Element\NodeElement;
use Page;
use SilverStripe\Assets\Image;
use SilverStripe\BehatExtension\Context\FixtureContext as BaseFixtureContext;
use SilverStripe\BehatExtension\Utility\StepHelper;

/**
 * Context used to create fixtures in the SilverStripe ORM.
 */
class FixtureContext extends BaseFixtureContext
{
    use StepHelper;
}
