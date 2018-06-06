@javascript
Feature: View a list of versions
  As a cms author
  I want to view a list past revisions of a versioned DataObject (incl. pages)

  Background:
    # Test date cannot be in the past or the version list numbers won't be descending
    Given the current date is "2100-01-01"
    And I have a config file "enable-historyviewer.yml"
    And a "page" "Home" with "Content"="Background"

    Given I am logged in with "ADMIN" permissions
    And I go to "/admin/pages"
    And I click on "Home" in the tree

  Scenario: A list of versions is displayed
    Given I click on "History" in the header tabs
    Then I should see a list of versions

  Scenario: List shows the publish state, publish date and the author
    Given I should see an edit page form
    When I fill in the "Content" HTML field with "<p>Publish scenario</p>"
    And I press the "Publish" button
    Then I should see a "Published 'Home' successfully." notice
    # This is a workaround @todo remove when https://github.com/silverstripe/silverstripe-cms/issues/2128 is resolved in framework
    And I go to "/admin/pages/history/show/1"
    And I wait for 3 seconds
    Then I should see a list of versions
    And I should see "ADMIN User" in the author column in version 1
    And I should see "Published" in the record column in version 1
    And I should see "01/01/2100" in the record column in version 1
    And I should see the "Live" badge

  Scenario: List shows the draft state, draft date and the author
    Given I should see an edit page form
    When I fill in the "Content" HTML field with "<p>Save scenario</p>"
    And I press the "Save" button
    Then I should see a "Saved 'Home' successfully." notice
    # This is a workaround @todo remove when https://github.com/silverstripe/silverstripe-cms/issues/2128 is resolved in framework
    And I go to "/admin/pages/history/show/1"
    And I wait for 3 seconds
    Then I should see a list of versions
    And I should see "ADMIN User" in the author column in version 1
    And I should see "Saved" in the record column in version 1
    And I should see "01/01/2100" in the record column in version 1
    And I should not see the "Live" badge

  Scenario: Revisions are ordered descending by date
    Given I should see an edit page form
    When I fill in the "Content" HTML field with "<p>Order scenario</p>"
    And I press the "Publish" button
    Then I should see a "Published 'Home' successfully." notice
    # This is a workaround @todo remove when https://github.com/silverstripe/silverstripe-cms/issues/2128 is resolved in framework
    And I go to "/admin/pages/history/show/1"
    And I wait for 3 seconds
    Then I should see a list of versions in descending order
