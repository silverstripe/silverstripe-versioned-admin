@javascript
Feature: Compare mode
  As a cms author
  I want to enter compare mode
  So that I can compare changes between two versions

  Background:
    Given I have a config file "enable-historyviewer.yml"
    And a "page" "Home" with "Content"="<p>Hello world</p>"

    Given I am logged in with "ADMIN" permissions
    And I go to "/admin/pages"
    And I click on "Home" in the tree
    Then I click on "History" in the header tabs

  Scenario: The dropdown toggle can enable compare mode
    Given I open the history viewer actions menu
    Then I should see text matching "Compare two versions"

    When I check "Compare two versions"
    Then I should see text matching "Compare mode"

    When I press the "Exit" button
    Then I should not see text matching "Compare mode"

  Scenario: I can enter compare mode from the detail screen
    Given I click on the first version
    Then I should see a "Compare" button

    When I press the "Compare" button
    Then I should see text matching "Compare mode"
    And I should see text matching "Select two versions"

  Scenario: Changes between versions are highlighted
    Given I click on "Content" in the header tabs
    Then I fill in the "Content" HTML field with "<p>Hello universe</p>"
    And I press the "Save" button
    # This is a workaround @todo remove when https://github.com/silverstripe/silverstripe-cms/issues/2128 is resolved in framework
    And I go to "/admin/pages/history/show/1"
    And I wait for 3 seconds
    Then I should see a list of versions

    When I open the history viewer actions menu
    And I check "Compare two versions"
    And I click on the first version
    And I click on version 1
    Then the text "world" should be deleted
    And the text "universe" should be added
