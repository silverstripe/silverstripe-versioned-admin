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
use PHPUnit\Framework\Attributes\DataProvider;

class DiffFieldTest extends SapphireTest
{
    public function testScalarValuesAreDiffed()
    {
        $newField = TextField::create('Test', 'Test', 'new');
        $diffField = DiffField::create('DiffTest');

        $diffField->setComparisonField($newField);
        $diffField->setValue('old');

        $this->assertMatchesRegularExpression('/^<del>old<\/del> *<ins>new<\/ins>$/', $diffField->getFormattedValue());
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

        $this->assertEquals('(No diff available)', $diffField->getFormattedValue());
    }

    #[DataProvider('provideEscaping')]
    public function testEscaping(
        string $className,
        string $oldValue,
        string $newValue,
        string $expected,
    ) {
        // get $emptyPlaceholder here instead of provideEscaping to prevent
        // BadMethodCallException: No injector manifests available
        // error in dataProvider method
        $emptyPlaceholder = ReadonlyField::create('na')->getFormattedValue();
        $emptyPlaceholderNoTags = strip_tags($emptyPlaceholder);
        $expected = str_replace('$emptyPlaceholderNoTags', $emptyPlaceholderNoTags, $expected);
        $expected = str_replace('$emptyPlaceholder', $emptyPlaceholder, $expected);
        $newField = new $className('Test', 'Test', $newValue);
        $diffField = DiffField::create('DiffTest');
        $diffField->setComparisonField($newField);
        $diffField->setValue($oldValue);
        $this->assertSame($expected, $diffField->getFormattedValue());
    }

    public static function provideEscaping()
    {
        return [
            'readonly-add-bold' => [
                'className' => ReadonlyField::class,
                'oldValue' => 'Something',
                'newValue' => 'Something <strong>bold</strong>',
                'expected' => 'Something <ins>&lt;strong&gt; bold &lt;/strong&gt;</ins>',
            ],
            'htmleditor-readonly' => [
                'className' => HTMLEditorField_Readonly::class,
                'oldValue' => 'Something',
                'newValue' => 'Something <strong>bold</strong>',
                'expected' => 'Something <ins><strong>bold</strong></ins>',
            ],
            'readonly-nothing' => [
                'className' => ReadonlyField::class,
                'oldValue' => '',
                'newValue' => '',
                'expected' => "<i>('none')</i>",
            ],
            'readonly-add-something' => [
                'className' => ReadonlyField::class,
                'oldValue' => '',
                'newValue' => 'Something',
                'expected' => "<del>('none')</del> <ins>Something</ins>",
            ],
            'readonly-remove-something' => [
                'className' => ReadonlyField::class,
                'oldValue' => 'Something',
                'newValue' => '',
                'expected' => "<del>Something</del> <ins>('none')</ins>",
            ],
        ];
    }
}
