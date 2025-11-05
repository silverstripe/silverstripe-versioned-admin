@retry @job1
Feature: Archive admin other tab
  As a CMS author
  I want to view the other tab in the archive section
  So that I can easily switch back to older content

  Background:
    And a "Company" "first company"
    And the "Company" "first company" is archived
    And a "Company" "second company"
    And the "Company" "second company" is archived
    And a "Company" "third company"
    Given I am logged in with "ADMIN" permissions
    And I go to "/admin/archive?others=1"
    And I wait 2 seconds
    Then I should not see an "#Form_EditForm_Others" element
    When I click on the "#Form_EditForm_OtherDropdown_chosen" element

  Scenario: I can select from the dropdown
    Given I click "Companies" in the "#Form_EditForm_OtherDropdown_chosen .chosen-results" element
    And I wait 1 seconds
    Then I should see an "#Form_EditForm_Others" element
    Then I should see "second company" in the "#Form_EditForm .grid-field__table" element
    Then I should see "first company" in the "#Form_EditForm .grid-field__table" element
    And I should not see "third company" in the "#Form_EditForm .grid-field__table" element

  Scenario: I can filter records in archive admin
    Given I click "Companies" in the "#Form_EditForm_OtherDropdown_chosen .chosen-results" element
    And I wait 1 seconds
    And I press the "Open search and filter" button
    And I press the "Advanced" button
    Then I should see "Date Archived" in the "#GridField_Others_SearchForm_Search_LastEdited_Holder label" element
    And I should see the "#GridField_Others_SearchForm_Search_LastEdited_Holder input[name='Search__LastEdited_SearchFrom'][type='date']" element
    And I should see the "#GridField_Others_SearchForm_Search_LastEdited_Holder input[name='Search__LastEdited_SearchTo'][type='date']" element
    And I fill in "Search" with "second"
    And I press the "Enter" key in the "SearchBox__q" field
    Then I should see "second company" in the "#Form_EditForm .grid-field__table" element
    But I should not see "first company" in the "#Form_EditForm .grid-field__table" element
    And I should not see "third company" in the "#Form_EditForm .grid-field__table" element
