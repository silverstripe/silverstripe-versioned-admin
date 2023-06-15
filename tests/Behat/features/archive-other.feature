Feature: Archive admin other tab
  As a CMS author
  I want to view the other tab in the archive section
  So that I can easily switch back to older content

  Background:
    Given I am logged in with "ADMIN" permissions

  Scenario: I can select from the dropdown
    When I go to "/admin/archive?others=1"
    And I wait 2 seconds
    Then I should not see an "#Form_EditForm_Others" element
    When I click on the "#Form_EditForm_OtherDropdown_chosen" element
    And I wait 1 seconds
    And I click "Companies" in the "#Form_EditForm_OtherDropdown_chosen .chosen-results" element
    And I wait 1 seconds
    Then I should see an "#Form_EditForm_Others" element
