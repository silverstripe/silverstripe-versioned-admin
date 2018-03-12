<?php

namespace SilverStripe\VersionedAdmin\Tests\Forms;

use SilverStripe\Dev\SapphireTest;
use SilverStripe\Forms\Form;
use SilverStripe\VersionedAdmin\Forms\HistoryViewerField;
use SilverStripe\View\Requirements;

class HistoryViewerFieldTest extends SapphireTest
{
    public function testRequirementsAreAddedInConstructor()
    {
        new HistoryViewerField('Test');

        $css = Requirements::backend()->getCSS();
        $this->assertNotEmpty($css);
        $this->assertContains('client/dist/styles/bundle.css', key($css));

        $javascript = Requirements::backend()->getJavascript();
        $this->assertNotEmpty($javascript);
        $this->assertContains('client/dist/js/bundle.js', key($javascript));
    }

    public function testGetSourceRecord()
    {
        $form = $this->createMock(Form::class);
        $form->expects($this->once())->method('getRecord')->willReturn('foo');

        $field = new HistoryViewerField('Test');
        $field->setForm($form);

        $this->assertSame('foo', $field->getSourceRecord());
    }
}
