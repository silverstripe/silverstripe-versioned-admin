@javascript
Feature: Restore to draft
  As a CMS author
  I want to restore archived version to draft

  Background:
    Given a "page" "Home"
      And a "page" "MyPage"
      And the "group" "EDITOR" has permissions "Access to 'Pages' section" and "Access to 'Archive' section"
      And I am logged in as a member of "EDITOR" group
      And I go to "/admin/pages"
      And I should see "MyPage"
      And I click on "MyPage" in the tree
      And I press the "Publish" button
      And I click "More options" in the "#ActionMenus" element
      And I press the "Unpublish and archive" button, confirming the dialog

  Scenario: I can restore archived version to draft
    When I go to "/admin/archive"
    Then I should see "MyPage" in the "#Form_EditForm" element
    Then I click "MyPage" in the "#Form_EditForm" element
    Then I press the "Restore to draft" button
    Then I should see "Successfully restored the page" in the "#Form_EditForm" element
    When I go to "/admin/pages"
    And I should see "MyPage" in the ".cms-tree [data-pagetype='Page']:nth-of-type(2).status-addedtodraft" element
