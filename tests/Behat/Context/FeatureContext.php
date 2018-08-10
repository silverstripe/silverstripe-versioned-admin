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
        $this->getVersions();
    }

    /**
     * @Then I should see a list of versions in descending order
     */
    public function iShouldSeeAListOfVersionsInDescendingOrder()
    {
        $versions = $this->getVersions();
        assertNotEmpty($versions, 'I see a list of versions');

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
    }

    /**
     * @When I click on version :versionNo
     */
    public function iClickOnVersion($versionNo)
    {
        $versions = $this->getVersions(' .history-viewer__version-anchor .history-viewer__version-no');
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
     * @Given I open the history viewer actions menu
     */
    public function iOpenTheHistoryViewerActionsMenu()
    {
        $button = $this->getSession()->getPage()->find('css', '.history-viewer__heading .history-viewer__actions .btn');
        assertNotNull($button, 'History viewer actions menu not found in the page.');

        $button->click();
    }

    /**
     * @Then the text :text should be deleted
     */
    public function theTextShouldBeDeleted($text)
    {
        $result = $this->getSession()->getPage()->find(
            'xpath',
            sprintf('//del[contains(normalize-space(string(.)), \'%s\')]', $text)
        );
        assertNotNull($result, $text . ' was not shown as deleted');
    }

    /**
     * @Then the text :text should be added
     */
    public function theTextShouldBeAdded($text)
    {
        $result = $this->getSession()->getPage()->find(
            'xpath',
            sprintf('//ins[contains(normalize-space(string(.)), \'%s\')]', $text)
        );
        assertNotNull($result, $text . ' was not shown as added');
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
        // Wait for the list to be visible
        $this->getSession()->wait(3000, 'window.jQuery(".history-viewer .table").length > 0');

        $versions = $this->getSession()
            ->getPage()
            ->findAll('css', '.history-viewer__list .history-viewer__table .history-viewer__row' . $modifier);
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
        $authorColumn = $version->find('css', '.history-viewer__version-anchor .history-viewer__author');

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
        $recordColumn = $version->find('css', '.history-viewer__version-anchor .history-viewer__version-state');

        $exists = strpos($recordColumn->getText(), $text) !== false;
        assertTrue($exists, 'Record column contains ' . $text);
    }

    /**
     * @Then I should see :text in the version column in version :versionNumber
     */
    public function iShouldSeeInTheVersionColumn($text, $versionNumber)
    {
        $version = $this->getSpecificVersion($versionNumber);
        $versionColumn = $version->find('css', '.history-viewer__version-anchor .history-viewer__version-no');

        $exists = strpos($versionColumn->getText(), $text) !== false;
        assertTrue($exists, 'Version column contains ' . $text);
    }

    /**
     * Returns the table row that holds information on the most recent version
     */
    protected function getLatestVersion()
    {
        $versions = $this->getVersions();
        return current($versions);
    }

    /**
     * Returns the table row that holds information on the selected version.
     *
     * @param int $versionNumber
     * @return NodeElement
     */
    protected function getSpecificVersion($versionNumber)
    {
        $versions = $this->getVersions();
        foreach ($versions as $version) {
            /** @var NodeElement $version */
            if (strpos($version->getText(), $versionNumber) !== false) {
                return $version;
            }
        }
    }
}
