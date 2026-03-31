@javascript @retry @job2
Feature: Reset state
  As a cms author
  I want the correct state to be used
  So that I don't see the wrong page data when viewing history

  Background:
    Given a "page" "Home" with "Content"="<p>Hello world</p>"
    And a "page" "About us" with "Content"="<p>Hello world</p>"
    And the "group" "EDITOR" has permissions "Access to 'Pages' section"
    And I am logged in as a member of "EDITOR" group
    # Add some history to the "Home" page
    And I go to "/admin/pages"
    And I click on "Home" in the tree
    And I fill in the "Content" HTML field with "<p>my new content</p>"
    And I press the "Save" button
    And I press the "Publish" button

  Scenario: Viewing a version gets reset
    Given I click on "History" in the header tabs
    Then I should see 4 in the version column at row 1
    When I click on the first version
    And I wait for 3 seconds until I see the "#Form_versionForm" element
    Then I should see an "#Form_versionForm_Title[readonly]" element
    When I click on "About us" in the tree
    And I click on "History" in the header tabs
    And I wait for 3 seconds
    Then I should see a list of versions in descending order
    And I should not see the "#Form_versionForm" element
    And I should see 1 in the version column at row 1
