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
        $versions = $this->getVersions();
        $this->clickVersion(current($versions));
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
     * @When I click on version :versionNo
     */
    public function iClickOnVersion($versionNo)
    {
        $versions = $this->getVersions(' td:first-child');
        $desiredVersion = null;
        foreach ($versions as $version) {
            /** @var NodeElement $version */
            if ($version->getText() == $versionNo) {
                $desiredVersion = $version;
                break;
            }
        }
        assertNotNull($desiredVersion, 'Desired version ' . $versionNo . ' was not found in the page.');
        $this->clickVersion($desiredVersion);
    }

    /**
     * Click on the given version
     *
     * @param NodeElement $version
     */
    protected function clickVersion(NodeElement $version)
    {
        $version->click();

        // Wait for the form builder to load
        $this->getSession()->wait(3000, 'window.jQuery("#Form_versionForm").length > 0');
    }

    /**
     * Returns the versions from the history viewer list (table rows)
     *
     * @param string $modifier Optional CSS selector modifier
     * @return NodeElement[]
     */
    protected function getVersions($modifier = '')
    {
        $versions = $this
            ->getSession()
            ->getPage()
            ->findAll('css', '.history-viewer .table tbody tr' . $modifier);

        assertNotEmpty($versions, 'I see a list of versions');
        return $versions;
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
