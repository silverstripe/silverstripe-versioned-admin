<?php

namespace SilverStripe\VersionedAdmin\Tests\Forms;

use SilverStripe\Dev\SapphireTest;
use SilverStripe\Forms\Form;
use SilverStripe\VersionedAdmin\Forms\HistoryViewerField;

class HistoryViewerFieldTest extends SapphireTest
{
    public function testGetSourceRecord()
    {
        $form = $this->createMock(Form::class);
        $form->expects($this->once())->method('getRecord')->willReturn('foo');

        $field = new HistoryViewerField('Test');
        $field->setForm($form);

        $this->assertSame('foo', $field->getSourceRecord());
    }
}
