<?php

namespace SilverStripe\VersionedAdmin\Tests\Forms;

use SilverStripe\Dev\SapphireTest;
use SilverStripe\Forms\TextField;
use SilverStripe\Forms\TreeMultiselectField;
use SilverStripe\ORM\ManyManyList;
use SilverStripe\Security\Group;
use SilverStripe\VersionedAdmin\Forms\DiffField;

class DiffFieldTest extends SapphireTest
{
    public function testScalarValuesAreDiffed()
    {
        $newField = TextField::create('Test', 'Test', 'new');
        $diffField = DiffField::create('DiffTest');

        $diffField->setComparisonField($newField);
        $diffField->setValue('old');

        $this->assertEquals('<ins>new</ins> <del>old</del>', $diffField->Value());
    }

    /**
     * Relationship lists and other non-scalar field values cannot be diffed in the current incarnation of DiffField.
     */
    public function testObjectValuesAreNotDiffed()
    {
        $newField = TreeMultiselectField::create('Test', 'Test');
        $diffField = DiffField::create('DiffTest');

        $diffField->setComparisonField($newField);
        $diffField->setValue(ManyManyList::create(Group::class, 'Group_Members', 'GroupID', 'MemberID'));

        $this->assertEquals('(No diff available)', $diffField->Value());
    }
}
