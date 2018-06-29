@javascript
Feature: Revert to a version
  As a CMS author
  I want to revert to an older version
  So that I can easily switch back to older content

  Background:
    Given a "page" "Home" with "Content"="Initial version"
    And I have a config file "enable-historyviewer.yml"

    Given I am logged in with "ADMIN" permissions
    And I go to "/admin/pages"
    And I click on "Home" in the tree
    And I fill in the "Content" HTML field with "<p>Second version</p>"
    And I press the "Save" button
    And I go to "/admin/pages/history/show/1"
    And I wait for 3 seconds
    Then I should see a list of versions

  Scenario: I can revert to the initial version
    When I click on version "1"
    Then I should see "Initial version"
    And I should see "Revert to this version"

    Given I press the "Revert to this version" button
    Then I should see a list of versions
    And I should see "Successfully reverted to version 1"

  Scenario: The latest version cannot be reverted to
    When I click on the first version
    And I wait for 3 seconds
    Then I should see "Revert to this version"
    And the "Revert to this version" button should be disabled
