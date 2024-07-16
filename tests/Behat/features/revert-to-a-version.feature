@javascript @retry @job2
Feature: Revert to a version
  As a CMS author
  I want to revert to an older version
  So that I can easily switch back to older content

  Background:
    Given a "page" "Home" with "Content"="Initial version"
    And I have a config file "enable-historyviewer.yml"

    Given the "group" "EDITOR" has permissions "Access to 'Pages' section"
    And I am logged in as a member of "EDITOR" group
    And I go to "/admin/pages"
    And I wait 3 seconds
    And I click on "Home" in the tree
    And I wait 3 seconds
    And I fill in the "Content" HTML field with "<p>Second version</p>"
    And I press the "Save" button
    And I wait 3 seconds
    And I click on the ".toast__close" element
    And I click on "History" in the header tabs
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
