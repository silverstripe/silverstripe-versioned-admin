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

    public function testSetComparisonData()
    {
        $transformation = new DiffTransformation();
        $transformation->setComparisonData($this->testData);
        $this->assertEquals($this->testData, $transformation->getComparisonData(), 'Arrays are accepted');

        $transformation->setComparisonData(DataObject::create($this->testData));
        $this->assertEquals($this->testData, $transformation->getComparisonData(), 'DataObjects are accepted');

        $transformation->setComparisonData(ArrayData::create($this->testData));
        $this->assertEquals($this->testData, $transformation->getComparisonData(), 'ArrayDatas are accepted');
    }

    /**
     * @expectedException InvalidArgumentException
     */
    public function testSetComparisonDataThrowsExceptionWithInvalidArgument()
    {
        $transformation = new DiffTransformation();
        $transformation->setComparisonData('First', '1st');
    }

    public function testSetComparisonDataMerge()
    {
        $transformation = new DiffTransformation([
            'First' => 'Once',
            'Second' => '2nd',
        ]);

        $transformation->setComparisonData([
            'Second' => 'Twice',
            'Third' => 'Thrice',
        ], $merge = true);

        // will throw an exception if not enough data is set
        $this->testForm->transform($transformation);
    }

    public function testTransform()
    {
        $form = $this->testForm;
        $update = [
            'First' => '1st',
            'Second' => '2nd',
            'Third' => '3rd',
        ];

        $expected = $this->getExpected($update);
        $transformation = DiffTransformation::create($update);
        $form->transform($transformation);

        foreach ($form->Fields() as $index => $field) {
            $this->assertContains($expected[$index]['before'], $field->Value(), 'Value before is shown');
            $this->assertContains($expected[$index]['after'], $field->Value(), 'Value after is shown');
        }
    }

    /**
     * @expectedException LogicException
     */
    public function testTransformWithNotEnoughData()
    {
        $form = $this->testForm;
        $transformation = DiffTransformation::create([
            'First' => '1st',
        ]);
        $form->transform($transformation);
    }

    public function testTransformWithCompositeFields()
    {
        $form = $this->testForm;
        $form->setFields(
            FieldList::create(
                CompositeField::create($form->Fields())
            )
        );
        $update = [
            'First' => 'Uno',
            'Second' => 'Dos',
            'Third' => 'Tres',
        ];

        $expected = $this->getExpected($update);
        $transformation = DiffTransformation::create($update);
        $form->transform($transformation);

        foreach (array_values($form->Fields()->dataFields()) as $index => $field) {
            $this->assertContains($expected[$index]['before'], $field->Value(), 'Value before is shown');
            $this->assertContains($expected[$index]['after'], $field->Value(), 'Value after is shown');
        }
    }

    /**
     * Helper method for generating the expected result for diff views between fields
     *
     * @param array $update
     * @return array
     */
    private function getExpected($update)
    {
        $expected = [];
        $original = $this->testData;
        foreach (array_combine(array_values($update), array_values($original)) as $now => $was) {
            $expected[] = [
                'before' => "<ins>$now</ins>",
                'after' => "<del>$was</del>",
            ];
        }
        return $expected;
    }
}
