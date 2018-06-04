@javascript
Feature: View a version
  As a cms author
  I want to view a version

  Background:
    Given a "page" "Home" with "Content"="Welcome to my website"
    And I have a config file "enable-historyviewer.yml"

    Given I am logged in with "ADMIN" permissions
    And I go to "/admin/pages"
    And I click on "Home" in the tree
    And I click on "History" in the header tabs
    Then I should see a list of versions

  Scenario: I can view a selected version of a record
    When I click on the first version
    And I wait for 3 seconds until I see the "#Form_versionForm" element
    Then I should see "Welcome to my website"

  Scenario: Shows readonly version of all core form fields
    Given I click on "History" in the header tabs
    Then I should see a list of versions

    When I click on the first version
    And I wait for 3 seconds until I see the "#Form_versionForm" element
    Then I should see an "#Form_versionForm_Title[readonly]" element
    And I should see an "#Form_versionForm_URLSegment[readonly]" element
