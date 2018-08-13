<?php

namespace SilverStripe\VersionedAdmin\Tests\Forms;

use InvalidArgumentException;
use LogicException;
use SilverStripe\Control\Controller;
use SilverStripe\Dev\SapphireTest;
use SilverStripe\Forms\CompositeField;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\TextField;
use SilverStripe\ORM\DataObject;
use SilverStripe\VersionedAdmin\Forms\DiffTransformation;
use SilverStripe\View\ArrayData;

class DiffTransformationTest extends SapphireTest
{
    private $testData = [
        'First' => 'One',
        'Second' => 'Two',
        'Third' => 'Three',
    ];

    /**
     * @var Form
     */
    private $testForm;

    protected function setUp()
    {
        parent::setUp();

        $fields = FieldList::create();
        foreach ($this->testData as $fieldName => $fieldValue) {
            $fields->push(TextField::create($fieldName)->setValue($fieldValue));
        }

        $this->testForm = Form::create(
            Controller::create(),
            'TestForm',
            $fields,
            FieldList::create()
        );

        // Don't go injecting an extra field to the $fields FieldList
        $this->testForm->disableSecurityToken();
    }

    public function testTransform()
    {
        $form = $this->testForm;
        $oldData = [
            'First' => '1st',
            'Second' => '2nd',
            'Third' => '3rd',
        ];

        $expected = $this->getExpected($oldData);
        $transformation = DiffTransformation::create();
        $form->transform($transformation);
        $form->loadDataFrom($oldData);

        foreach ($form->Fields() as $index => $field) {
            $this->assertContains($expected[$index]['before'], $field->Value(), 'Value before is shown');
            $this->assertContains($expected[$index]['after'], $field->Value(), 'Value after is shown');
        }
    }

    public function testTransformWithCompositeFields()
    {
        $form = $this->testForm;
        $form->setFields(
            FieldList::create(
                CompositeField::create($form->Fields())
            )
        );
        $oldData = [
            'First' => 'Uno',
            'Second' => 'Dos',
            'Third' => 'Tres',
        ];

        $expected = $this->getExpected($oldData);
        $transformation = DiffTransformation::create();
        $form->transform($transformation);
        $form->loadDataFrom($oldData);

        foreach (array_values($form->Fields()->dataFields()) as $index => $field) {
            $this->assertContains($expected[$index]['before'], $field->Value(), 'Value before is shown');
            $this->assertContains($expected[$index]['after'], $field->Value(), 'Value after is shown');
        }
    }

    /**
     * Helper method for generating the expected result for diff views between fields
     *
     * @param array $outdated
     * @return array
     */
    private function getExpected($outdated)
    {
        $expected = [];
        $current = $this->testData;
        foreach (array_combine(array_values($outdated), array_values($current)) as $now => $was) {
            $expected[] = [
                'before' => "<ins>$was</ins>",
                'after' => "<del>$now</del>",
            ];
        }
        return $expected;
    }
}
