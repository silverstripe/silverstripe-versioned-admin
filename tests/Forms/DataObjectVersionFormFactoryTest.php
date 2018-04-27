<?php

namespace SilverStripe\VersionedAdmin\Tests\Forms;

use InvalidArgumentException;
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Dev\SapphireTest;
use SilverStripe\Forms\ReadonlyField;
use SilverStripe\Forms\TextField;
use SilverStripe\VersionedAdmin\Controllers\HistoryViewerController;
use SilverStripe\VersionedAdmin\Forms\DataObjectVersionFormFactory;
use SilverStripe\VersionedAdmin\Tests\Forms\DataObjectVersionFormFactoryTest\ObjectWithFields;

class DataObjectVersionFormFactoryTest extends SapphireTest
{
    protected static $fixture_file = 'DataObjectVersionFormFactoryTest.yml';

    protected static $extra_dataobjects = [
        ObjectWithFields::class,
    ];

    /**
     * @var DataObjectVersionFormFactory
     */
    protected $factory;

    /**
     * @var HistoryViewerController
     */
    protected $controller;

    protected function setUp()
    {
        parent::setUp();

        $this->factory = new DataObjectVersionFormFactory();
        $this->controller = new HistoryViewerController();
    }

    public function testGetFormType()
    {
        $this->assertSame('custom', $this->factory->getFormType(['Type' => 'custom']));
        $this->assertSame('history', $this->factory->getFormType([]));
    }

    public function testIsReadonlyFormType()
    {
        $this->assertFalse(
            $this->factory->isReadonlyFormType(['Type' => 'custom']),
            'Custom, or non default form types are not registered automatically as readonly form types'
        );

        $this->assertTrue(
            $this->factory->isReadonlyFormType([]),
            'Default "history" form type is registered as a readonly form type'
        );
    }

    /**
     * @expectedException InvalidArgumentException
     * @expectedExceptionMessage Missing required context Record
     */
    public function testGetFormThrowsExceptionOnMissingRequiredContext()
    {
        $this->factory->getForm();
    }

    public function testFormFieldFromDataObjectAreAddedToForm()
    {
        $context = [
            'Record' => $this->objFromFixture(ObjectWithFields::class, 'object_one'),
            'Type' => 'custom_type',
        ];
        $form = $this->factory->getForm($this->controller, 'some_form', $context);
        $this->assertInstanceOf(TextField::class, $form->Fields()->fieldByName('Root.Main.Title'));
    }

    public function testHistoryViewerFieldsAreRemovedFromFieldLists()
    {
        $context = [
            'Record' => $this->objFromFixture(ObjectWithFields::class, 'object_one'),
            'Type' => 'custom_type',
        ];
        $form = $this->factory->getForm($this->controller, 'some_form', $context);
        $this->assertNull($form->Fields()->fieldByName('Root.CustomHistoryTab.History'));
    }

    public function testEmptyTabsAreRemovedAfterRemovingHistoryViewerFields()
    {
        $context = [
            'Record' => $this->objFromFixture(ObjectWithFields::class, 'object_one'),
        ];
        $form = $this->factory->getForm($this->controller, 'some_form', $context);
        $this->assertNull($form->Fields()->fieldByName('Root.CustomHistoryTab'));
        $this->assertNotNull($form->Fields()->fieldByName('Root.Main'));
    }

    public function testFieldsAreMadeReadonlyInDefaultContext()
    {
        $context = [
            'Record' => $this->objFromFixture(ObjectWithFields::class, 'object_one'),
        ];
        $form = $this->factory->getForm($this->controller, 'some_form', $context);
        $this->assertInstanceOf(
            ReadonlyField::class,
            $form->Fields()->fieldByName('Root.Main.Title'),
            'FieldList has readonly transformation performed'
        );
    }

    public function testSiteTreeMetaFieldsHaveNoRightTitle()
    {
        if (!class_exists(SiteTree::class)) {
            $this->markTestSkipped('This test requires the cms module to be installed.');
        }

        $context = [
            'Record' => new SiteTree(),
        ];
        $form = $this->factory->getForm($this->controller, 'some_form', $context);
        $field = $form->Fields()->dataFieldByName('MetaDescription');
        $this->assertInstanceOf(
            ReadonlyField::class,
            $field,
            'FieldList has readonly transformation performed'
        );
        $this->assertEmpty($field->RightTitle());
    }
}
