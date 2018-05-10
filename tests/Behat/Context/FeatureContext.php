<?php

namespace SilverStripe\VersionedAdmin\Tests\Behat\Context;

use Behat\Mink\Element\NodeElement;
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
     * @Then I should see a list of versions in descending order
     */
    public function iShouldSeeAListOfVersionsInDescendingOrder()
    {
        $page = $this->getSession()->getPage();
        $versions = $page->findAll('css', '.history-viewer .table tbody tr td:nth-of-type(1)');

        $previous = null;
        foreach ($versions as $version) {
            /** @var NodeElement $version */
            if ($previous) {
                assert($version->getValue() < $previous);
            }
            $previous = $version->getValue();
        }
    }

    /**
     * @When I click on the first version
     */
    public function iClickOnTheFirstVersion()
    {
        assertNotNull($this->getLatestVersion(), 'I should see a list of versions');
        $this->getLatestVersion()->click();

        // Wait for the form builder to load
        $this->getSession()->wait(3000);
    }

    /**
     * Example: I should see the "Live" badge
     * Example: I should not see the "Live" badge
     *
     * @Then /^I should (not |)see the "([\w\s]+)" badge$/
     * @param string $negative
     * @param string $text
     */
    public function iShouldSeeTheBadge($negative, $text)
    {
        if ($negative) {
            $this->assertElementNotOnPage('.history-viewer .badge');
        } else {
            $this->assertElementContains('.history-viewer .badge', $text);
        }
    }

    /**
     * Example: I should see "ADMIN User" in the author column in version 1
     *
     * @Then I should see :text in the author column in version :versionNumber
     */
    public function iShouldSeeInTheAuthorColumn($text, $versionNumber)
    {
        $version = $this->getSpecificVersion($versionNumber);
        $authorColumn = $version->find('css', 'td:nth-of-type(3)');

        $exists = strpos($authorColumn->getText(), $text) !== false;
        assertTrue($exists, 'Author column contains ' . $text);
    }

    /**
     * Example: I should see "Saved" in the record column in version 1
     *
     * @Then I should see :text in the record column in version :versionNumber
     */
    public function iShouldSeeInTheRecordColumn($text, $versionNumber)
    {
        $version = $this->getSpecificVersion($versionNumber);
        $recordColumn = $version->find('css', 'td:nth-of-type(2)');

        $exists = strpos($recordColumn->getText(), $text) !== false;
        assertTrue($exists, 'Record column contains ' . $text);
    }

    /**
     * @Then I should see :text in the version column in version :versionNumber
     */
    public function iShouldSeeInTheVersionColumn($text, $versionNumber)
    {
        $version = $this->getSpecificVersion($versionNumber);
        $versionColumn = $version->find('css', 'td');

        $exists = strpos($versionColumn->getText(), $text) !== false;
        assertTrue($exists, 'Version column contains ' . $text);
    }

    /**
     * Returns the table row that holds information on the most recent version
     */
    protected function getLatestVersion()
    {
        $page = $this->getSession()->getPage();
        return $page->find('css', '.history-viewer .table tbody tr');
    }

    /**
     * Returns the table row that holds information on the selected version.
     *
     * @param int $versionNumber
     */
    protected function getSpecificVersion($versionNumber)
    {
        $versionColumns = $this->getSession()->getPage()->findAll('css', '.history-viewer tbody tr');
        foreach ($versionColumns as $version) {
            if (strpos($version->getText(), $versionNumber) !== false) {
                return $version;
            }
        }
    }
}
