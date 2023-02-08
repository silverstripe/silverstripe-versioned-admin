<?php

namespace SilverStripe\VersionedAdmin\Tests\Forms;

use SilverStripe\Dev\SapphireTest;
use SilverStripe\Forms\HTMLEditor\HTMLEditorField_Readonly;
use SilverStripe\Forms\ReadonlyField;
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

        $this->assertMatchesRegularExpression('/^<del>old<\/del> *<ins>new<\/ins>$/', $diffField->Value());
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

    /**
     * @dataProvider provideEscaping
     */
    public function testEscaping(
        string $className,
        string $oldValue,
        string $newValue,
        string $expected,
        string $message
    ) {
        // get $emptyPlaceholder here instead of provideEscaping to prevent
        // BadMethodCallException: No injector manifests available
        // error in dataProvider method
        $emptyPlaceholder = ReadonlyField::create('na')->Value();
        $emptyPlaceholderNoTags = strip_tags($emptyPlaceholder);
        $expected = str_replace('$emptyPlaceholderNoTags', $emptyPlaceholderNoTags, $expected);
        $expected = str_replace('$emptyPlaceholder', $emptyPlaceholder, $expected);
        $newField = new $className('Test', 'Test', $oldValue);
        $diffField = DiffField::create('DiffTest');
        $diffField->setComparisonField($newField);
        $diffField->setValue($newValue);
        $this->assertSame($expected, $diffField->Value(), $message);
    }

    public function provideEscaping()
    {
        return [
            [
                ReadonlyField::class,
                'Something',
                'Something <strong>bold</strong>',
                'Something <del>&lt;strong&gt; bold &lt;/strong&gt;</del>',
                'Non HTML field is escaped'
            ],
            [
                HTMLEditorField_Readonly::class,
                'Something',
                'Something <strong>bold</strong>',
                'Something <del><strong>bold</strong></del>',
                'Non HTML field is not escaped'
            ],
            [
                ReadonlyField::class,
                '',
                '',
                '$emptyPlaceholder',
                'No value is not escaped'
            ],
            [
                ReadonlyField::class,
                '',
                'Something',
                '<del>Something</del> <ins>$emptyPlaceholderNoTags</ins>',
                'No value is escaped without tags removed when value added'
            ],
            [
                ReadonlyField::class,
                'Something',
                '',
                '<del>$emptyPlaceholderNoTags</del> <ins>Something</ins>',
                'No value is escaped without tags removed when value removed'
            ],
        ];
    }
}
