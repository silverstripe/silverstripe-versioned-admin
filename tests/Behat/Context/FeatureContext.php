<?php

namespace SilverStripe\VersionedAdmin\Tests\Behat\Context;

use SilverStripe\BehatExtension\Context\SilverStripeContext;

if (!class_exists(SilverStripeContext::class)) {
    return;
}

class FeatureContext extends SilverStripeContext
{
    /**
     * @Then I should see a list of versions
     */
    public function iShouldSeeAListOfVersions()
    {
        $page = $this->getSession()->getPage();
        $versionsTable = $page->find('css', '.history-viewer .table');
        assertNotNull($versionsTable, 'I should see a list of versions');
    }

    /**
     * @When I click on the first version
     */
    public function iClickOnTheFirstVersion()
    {
        $page = $this->getSession()->getPage();
        $firstVersion = $page->find('css', '.history-viewer .table tbody tr');
        assertNotNull($firstVersion, 'I should see a list of versions');

        $firstVersion->click();

        // Wait for the form builder to load
        $this->getSession()->wait(3000);
    }
}
