<?php

namespace SilverStripe\VersionedAdmin\Tests\Behat\Context;

use Behat\Behat\Hook\Scope\AfterStepScope;
use Behat\Behat\Hook\Scope\BeforeStepScope;
use Behat\Mink\Element\NodeElement;
use Exception;
use PHPUnit\Framework\Assert;
use SilverStripe\BehatExtension\Context\SilverStripeContext;

if (!class_exists(SilverStripeContext::class)) {
    return;
}

class FeatureContext extends SilverStripeContext
{
    /**
     * Milliseconds to wait for parts of the CMS that are rendered asynchronously. Generous because
     * CI runners are a lot slower than a development machine.
     */
    private const WAIT_TIMEOUT = 10000;

    /**
     * Unsaved CMS changes trigger a browser "leave site?" dialog on navigation,
     * including during @AfterScenario cleanup. Chrome leaves the dialog message
     * empty, causing subsequent WebDriver commands to fail with "unexpected alert open".
     *
     * This context runs first in behat.yml to dismiss the dialog before cleanup or
     * subsequent steps are executed.
     *
     * @AfterStep
     */
    public function clearUnsavedChangesDialog(AfterStepScope $event)
    {
        $driver = $this->getSession()->getDriver();
        if (!method_exists($driver, 'getWebDriver') || !$driver->isStarted()) {
            return;
        }

        try {
            $driver->getWebDriver()->switchTo()->alert()->accept();
        } catch (Exception $e) {
            // No dialog was open, which is the normal case
        }

        try {
            $driver->executeScript('window.onbeforeunload = null;');
        } catch (Exception $e) {
            // The page may be mid-navigation - the next step re-runs this hook
        }
    }

    /**
     * @BeforeStep
     */
    public function waitForHtmlEditors(BeforeStepScope $event)
    {
        if (!str_contains($event->getStep()->getText(), 'HTML field')) {
            return;
        }

        $driver = $this->getSession()->getDriver();
        if (!method_exists($driver, 'getWebDriver') || !$driver->isStarted()) {
            return;
        }

        // Every htmleditor textarea on the page has to be registered with TinyMCE and finished
        // initialising. See clearUnsavedChangesDialog() for why the globals are guarded.
        $ready = $this->getSession()->wait(self::WAIT_TIMEOUT, <<<'JS'
            (function () {
                if (!window.tinymce) {
                    return false;
                }
                var textareas = document.querySelectorAll('textarea.htmleditor');
                if (!textareas.length) {
                    return false;
                }
                for (var i = 0; i < textareas.length; i++) {
                    var editor = window.tinymce.EditorManager.get(textareas[i].id);
                    if (!editor || !editor.initialized) {
                        return false;
                    }
                }
                return true;
            })()
            JS);

        Assert::assertTrue($ready, 'The HTML editors on the page did not finish initialising');
    }

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
        Assert::assertNotEmpty($versions, 'I see a list of versions');

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
        $version = $this->getLatestVersion();
        Assert::assertNotFalse($version, 'I should see a list of versions');

        $this->clickVersion($version);
    }

    /**
     * @When I click on version :versionNo
     */
    public function iClickOnVersion($versionNo)
    {
        $versions = $this->getVersions(' .history-viewer__version-no');
        $desiredVersion = null;
        foreach ($versions as $version) {
            /** @var NodeElement $version */
            if ($version->getText() == $versionNo) {
                $desiredVersion = $version;
                break;
            }
        }
        Assert::assertNotNull($desiredVersion, 'Desired version ' . $versionNo . ' was not found in the page.');
        $this->clickVersion($desiredVersion);
    }

    /**
     * @Given I open the history viewer actions menu
     */
    public function iOpenTheHistoryViewerActionsMenu()
    {
        $selector = '.history-viewer__heading .history-viewer__actions .btn';

        // The heading renders alongside the version list. See clearUnsavedChangesDialog() for why
        // jQuery is guarded.
        $this->getSession()->wait(
            self::WAIT_TIMEOUT,
            sprintf('window.jQuery && window.jQuery(%s).length > 0', json_encode($selector))
        );

        $button = $this->getSession()->getPage()->find('css', $selector);
        Assert::assertNotNull($button, 'History viewer actions menu not found in the page.');

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
        Assert::assertNotNull($result, $text . ' was not shown as deleted');
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
        Assert::assertNotNull($result, $text . ' was not shown as added');
    }

    /**
     * Click on the given version
     *
     * @param NodeElement $version
     */
    protected function clickVersion(NodeElement $version)
    {
        $version->click();

        // Wait for the form builder to load. In compare mode the form is only rendered once a second
        // version has been selected, so the compare notice counts as loaded there.
        // jQuery is guarded because the wait expression is evaluated immediately: while the CMS is
        // still loading, calling window.jQuery() throws "window.jQuery is not a function" and the
        // step errors instead of waiting.
        $this->getSession()->wait(
            self::WAIT_TIMEOUT,
            'window.jQuery && (window.jQuery("#Form_versionForm").length > 0'
                . ' || window.jQuery(".history-viewer__compare-notice").length > 0)'
        );
    }

    /**
     * Returns the versions from the history viewer list (table rows)
     *
     * @param string $modifier Optional CSS selector modifier
     * @return NodeElement[]
     */
    protected function getVersions($modifier = '')
    {
        $selector = '.history-viewer__list .history-viewer__table .history-viewer__row' . $modifier;

        // Wait for a row rather than the table, which renders before the versions are populated.
        // See clearUnsavedChangesDialog() for why jQuery is guarded.
        $this->getSession()->wait(
            self::WAIT_TIMEOUT,
            sprintf('window.jQuery && window.jQuery(%s).length > 0', json_encode($selector))
        );

        return $this->getSession()->getPage()->findAll('css', $selector);
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
        $authorColumn = $version->find('css', '.history-viewer__author');

        $authorText = $authorColumn->getText();
        $exists = strpos($authorText, $text ?? '') !== false;
        Assert::assertTrue($exists, 'Author column actually contains: ' . $authorText);
    }

    /**
     * Example: I should see "Saved" in the record column in version 1
     *
     * @Then I should see :text in the record column in version :versionNumber
     */
    public function iShouldSeeInTheRecordColumn($text, $versionNumber)
    {
        $version = $this->getSpecificVersion($versionNumber);
        $recordColumn = $version->find('css', '.history-viewer__version-state');

        $recordText = $recordColumn->getText();
        $exists = strpos($recordText, $text ?? '') !== false;
        Assert::assertTrue($exists, 'Record column actually contains: ' . $recordText);
    }

    /**
     * @Then I should see :text in the version column in version :versionNumber
     */
    public function iShouldSeeInTheVersionColumn($text, $versionNumber)
    {
        $version = $this->getSpecificVersion($versionNumber);
        $versionColumn = $version->find('css', '.history-viewer__version-no');

        $versionText = $versionColumn->getText();
        $exists = strpos($versionText, $text ?? '') !== false;
        Assert::assertTrue($exists, 'Version column actually contains: ' . $versionText);
    }

    /**
     * Returns the table row that holds information on the most recent version
     */
    protected function getLatestVersion()
    {
        $versions = $this->getVersions();
        return current($versions ?? []);
    }

    /**
     * Returns the table row that holds information on the selected version.
     *
     * @param int $versionNumber
     * @return NodeElement
     */
    protected function getSpecificVersion($versionNumber)
    {
        // Rows are added to the list as they render, so the version being looked for can arrive
        // after the first one does. Retry instead of returning null, which left callers to fail
        // with "Call to a member function find() on null".
        for ($attempt = 0; $attempt < 10; $attempt++) {
            foreach ($this->getVersions() as $version) {
                /** @var NodeElement $version */
                if (strpos($version->getText() ?? '', $versionNumber ?? '') !== false) {
                    return $version;
                }
            }

            usleep(500000);
        }

        Assert::fail(sprintf('No version matching "%s" was found in the version list', $versionNumber));
    }

    /**
     * @Then I should see :text in the version column at row :row
     */
    public function iShouldSeeInTheVersionColumnAtRow($text, $row)
    {
        $versions = $this->getVersions();
        $version = $versions[(int) $row - 1] ?? null;
        Assert::assertNotNull($version, 'No version found at row ' . $row);
        $versionColumn = $version->find('css', '.history-viewer__version-no');

        $versionText = $versionColumn->getText();
        $exists = strpos($versionText, $text ?? '') !== false;
        Assert::assertTrue($exists, 'Version column actually contains: ' . $versionText);
    }
}
