@javascript @retry @job2
Feature: View archived history
  As a CMS author
  I want to see the version history of an archived record

  Background:
    Given a "page" "MyPage"
    And the "group" "EDITOR" has permissions "Access to 'Pages' section"
    And I am logged in as a member of "EDITOR" group

  Scenario: I can see history for the archived page
    # Get to the page, publish it, and archive it
    When I go to "/admin/pages"
    Then I should see "MyPage"
    And I click on "MyPage" in the tree
    And I press the "Publish" button
    And I press the "More options" button
    And I press the "Unpublish and archive" button, confirming the dialog
    # Check the version history
    When I click on "History" in the header tabs
    Then I should see a list of versions
    And I should see "Archived" in the record column in version 4
