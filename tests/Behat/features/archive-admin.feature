@javascript @retry @job1
Feature: Archive admin
  As a CMS author
  I want to see archived records in the archived admin

  Background:
    # Note we create in a different order than archiving to ensure the sort order is based explicitly on the archive order
    Given a "page" "create first, archive second"
    And a "page" "create second, archive first"
    And the "page" "create second, archive first" is archived
    # We have to wait or else they're all archived at the same time and the order will be wrong
    And I wait for 1 second
    And the "page" "create first, archive second" is archived
    And I wait for 1 second
    And a "page" "create last, archive last"
    And the "page" "create last, archive last" is archived
    And a "page" "not archived but has create and second in its name"
    And the "group" "EDITOR" has permissions "Access to 'Pages' section" and "Access to 'Archive' section"
    And I am logged in as a member of "EDITOR" group

  Scenario: I can see archived records in the correct order
    When I go to "/admin/archive"
    Then I should see "create last, archive last" in the "#Form_EditForm tr:first-of-type .col-Title" element
    Then I should see "create first, archive second" in the "#Form_EditForm tr:nth-of-type(2) .col-Title" element
    Then I should see "create second, archive first" in the "#Form_EditForm tr:last-of-type .col-Title" element
    And I should not see "not archived but has create and second in its name"
    # reverse the sort order
    When I press the "action_SetOrderLastEdited" button
    Then I should see "create second, archive first" in the "#Form_EditForm tr:first-of-type .col-Title" element
    Then I should see "create first, archive second" in the "#Form_EditForm tr:nth-of-type(2) .col-Title" element
    Then I should see "create last, archive last" in the "#Form_EditForm tr:last-of-type .col-Title" element
    And I should not see "not archived but has create and second in its name"

  Scenario: I can filter records in archive admin
    When I go to "/admin/archive"
    And I press the "Open search and filter" button
    And I press the "Advanced" button
    Then I should see "Date Archived" in the "#GridField_Pages_SearchForm_Search_LastEdited_Holder label" element
    And I should see the "#GridField_Pages_SearchForm_Search_LastEdited_Holder input[name='Search__LastEdited_SearchFrom'][type='date']" element
    And I should see the "#GridField_Pages_SearchForm_Search_LastEdited_Holder input[name='Search__LastEdited_SearchTo'][type='date']" element
    When I fill in "Search" with "second"
    And I press the "Enter" key in the "SearchBox__q" field
    Then I should see "create first, archive second" in the "#Form_EditForm .grid-field__table" element
    And I should see "create second, archive first" in the "#Form_EditForm .grid-field__table" element
    But I should not see "create last, archive last" in the "#Form_EditForm .grid-field__table" element
    And I should not see "not archived but has create and second in its name" in the "#Form_EditForm .grid-field__table" element
