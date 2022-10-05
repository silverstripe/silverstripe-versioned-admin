<?php

namespace SilverStripe\VersionedAdmin\Tests\Navigator;

use SilverStripe\Admin\Navigator\SilverStripeNavigator;
use SilverStripe\Admin\Navigator\SilverStripeNavigatorItem_Unversioned;
use SilverStripe\VersionedAdmin\Navigator\SilverStripeNavigatorItem_ArchiveLink;
use SilverStripe\VersionedAdmin\Navigator\SilverStripeNavigatorItem_LiveLink;
use SilverStripe\VersionedAdmin\Navigator\SilverStripeNavigatorItem_StageLink;
use SilverStripe\Dev\SapphireTest;

class SilverStripeNavigatorTest extends SapphireTest
{
    protected static $extra_dataobjects = [
        UnstagedRecord::class,
        UnversionedRecord::class,
        VersionedRecord::class,
    ];

    public function testGetItemsPublished(): void
    {
        $record = new VersionedRecord();
        $record->PreviewLinkTestProperty = 'some-value';
        $record->write();
        $record->publishRecursive();
        $navigator = new SilverStripeNavigator($record);
        $classes = array_map('get_class', $navigator->getItems()->toArray());

        // Has the live and staged links
        $this->assertContains(SilverStripeNavigatorItem_LiveLink::class, $classes);
        $this->assertContains(SilverStripeNavigatorItem_StageLink::class, $classes);

        // Does not have the other links
        $this->assertNotContains(SilverStripeNavigatorItem_ArchiveLink::class, $classes);
        $this->assertNotContains(SilverStripeNavigatorItem_Unversioned::class, $classes);
    }

    public function testGetItemsStaged(): void
    {
        $record = new VersionedRecord();
        $record->PreviewLinkTestProperty = 'some-value';
        $record->write();
        $navigator = new SilverStripeNavigator($record);
        $classes = array_map('get_class', $navigator->getItems()->toArray());

        // Has the stage link
        $this->assertContains(SilverStripeNavigatorItem_StageLink::class, $classes);

        // Does not have the other links
        $this->assertNotContains(SilverStripeNavigatorItem_ArchiveLink::class, $classes);
        $this->assertNotContains(SilverStripeNavigatorItem_LiveLink::class, $classes);
        $this->assertNotContains(SilverStripeNavigatorItem_Unversioned::class, $classes);
    }

    public function testGetItemsArchived(): void
    {
        $record = new VersionedRecord();
        $record->PreviewLinkTestProperty = 'some-value';
        $record->write();
        $record->doArchive();
        $navigator = new SilverStripeNavigator($record);
        $classes = array_map('get_class', $navigator->getItems()->toArray());

        // Has the archived link
        $this->assertContains(SilverStripeNavigatorItem_ArchiveLink::class, $classes);

        // Does not have the other links
        $this->assertNotContains(SilverStripeNavigatorItem_LiveLink::class, $classes);
        $this->assertNotContains(SilverStripeNavigatorItem_StageLink::class, $classes);
        $this->assertNotContains(SilverStripeNavigatorItem_UnversionedLink::class, $classes);
    }

    public function testGetItemsUnstaged(): void
    {
        $record = new UnstagedRecord();
        $record->previewLinkTestProperty = 'some-value';
        $record->write();
        $navigator = new SilverStripeNavigator($record);
        $classes = array_map('get_class', $navigator->getItems()->toArray());

        // Has the unversioned link
        $this->assertContains(SilverStripeNavigatorItem_Unversioned::class, $classes);

        // Does not have the other links
        $this->assertNotContains(SilverStripeNavigatorItem_ArchiveLink::class, $classes);
        $this->assertNotContains(SilverStripeNavigatorItem_LiveLink::class, $classes);
        $this->assertNotContains(SilverStripeNavigatorItem_StageLink::class, $classes);
    }

    public function testGetItemsUnversioned(): void
    {
        $record = new UnversionedRecord();
        $record->previewLinkTestProperty = 'some-value';
        $record->write();
        $navigator = new SilverStripeNavigator($record);
        $classes = array_map('get_class', $navigator->getItems()->toArray());

        // Has the unversioned link
        $this->assertContains(SilverStripeNavigatorItem_Unversioned::class, $classes);

        // Does not have the other links
        $this->assertNotContains(SilverStripeNavigatorItem_ArchiveLink::class, $classes);
        $this->assertNotContains(SilverStripeNavigatorItem_LiveLink::class, $classes);
        $this->assertNotContains(SilverStripeNavigatorItem_StageLink::class, $classes);
    }

    public function testCanViewPublished(): void
    {
        $record = new VersionedRecord();
        $record->write();
        $record->publishRecursive();
        $liveLinkItem = new SilverStripeNavigatorItem_LiveLink($record);
        $stagedLinkItem = new SilverStripeNavigatorItem_StageLink($record);
        $archivedLinkItem = new SilverStripeNavigatorItem_ArchiveLink($record);
        $unversionedLinkItem = new SilverStripeNavigatorItem_Unversioned($record);

        // Cannot view staged and live links when there's no preview link
        $this->assertFalse($liveLinkItem->canView());
        $this->assertFalse($stagedLinkItem->canView());

        $record->PreviewLinkTestProperty = 'some-value';
        $record->write();
        $record->publishRecursive();

        // Can view staged and live links
        $this->assertTrue($liveLinkItem->canView());
        $this->assertTrue($stagedLinkItem->canView());
        // Cannot view the other links
        $this->assertFalse($archivedLinkItem->canView());
        $this->assertFalse($unversionedLinkItem->canView());
    }

    public function testCanViewStaged(): void
    {
        $record = new VersionedRecord();
        $record->write();
        $liveLinkItem = new SilverStripeNavigatorItem_LiveLink($record);
        $stagedLinkItem = new SilverStripeNavigatorItem_StageLink($record);
        $archivedLinkItem = new SilverStripeNavigatorItem_ArchiveLink($record);
        $unversionedLinkItem = new SilverStripeNavigatorItem_Unversioned($record);

        // Cannot view staged link when there's no preview link
        $this->assertFalse($stagedLinkItem->canView());

        $record->PreviewLinkTestProperty = 'some-value';

        // Can view staged link
        $this->assertTrue($stagedLinkItem->canView());
        // Cannot view the other links
        $this->assertFalse($liveLinkItem->canView());
        $this->assertFalse($archivedLinkItem->canView());
        $this->assertFalse($unversionedLinkItem->canView());
    }

    public function testCanViewArchived(): void
    {
        $record = new VersionedRecord();
        $record->write();
        $record->doArchive();
        $liveLinkItem = new SilverStripeNavigatorItem_LiveLink($record);
        $stagedLinkItem = new SilverStripeNavigatorItem_StageLink($record);
        $archivedLinkItem = new SilverStripeNavigatorItem_ArchiveLink($record);
        $unversionedLinkItem = new SilverStripeNavigatorItem_Unversioned($record);

        // Cannot view archived link when there's no preview link
        $this->assertFalse($archivedLinkItem->canView());

        $record->PreviewLinkTestProperty = 'some-value';

        // Can view archived link
        $this->assertTrue($archivedLinkItem->canView());
        // Cannot view the other links
        $this->assertFalse($liveLinkItem->canView());
        $this->assertFalse($stagedLinkItem->canView());
        $this->assertFalse($unversionedLinkItem->canView());
    }

    public function testCanViewUnstaged(): void
    {
        $record = new UnstagedRecord();
        $record->write();
        $liveLinkItem = new SilverStripeNavigatorItem_LiveLink($record);
        $stagedLinkItem = new SilverStripeNavigatorItem_StageLink($record);
        $archivedLinkItem = new SilverStripeNavigatorItem_ArchiveLink($record);
        $unversionedLinkItem = new SilverStripeNavigatorItem_Unversioned($record);

        // Cannot view unversioned link when there's no preview link
        $this->assertFalse($unversionedLinkItem->canView());

        $record->previewLinkTestProperty = 'some-value';

        // Can view unversioned link
        $this->assertTrue($unversionedLinkItem->canView());
        // Cannot view the other links
        $this->assertFalse($liveLinkItem->canView());
        $this->assertFalse($stagedLinkItem->canView());
        $this->assertFalse($archivedLinkItem->canView());
    }

    public function testCanViewUnversioned(): void
    {
        $record = new UnversionedRecord();
        $record->write();
        $liveLinkItem = new SilverStripeNavigatorItem_LiveLink($record);
        $stagedLinkItem = new SilverStripeNavigatorItem_StageLink($record);
        $archivedLinkItem = new SilverStripeNavigatorItem_ArchiveLink($record);
        $unversionedLinkItem = new SilverStripeNavigatorItem_Unversioned($record);

        // Cannot view unversioned link when there's no preview link
        $this->assertFalse($unversionedLinkItem->canView());

        $record->previewLinkTestProperty = 'some-value';

        // Can view unversioned link
        $this->assertTrue($unversionedLinkItem->canView());
        // Cannot view the other links
        $this->assertFalse($liveLinkItem->canView());
        $this->assertFalse($stagedLinkItem->canView());
        $this->assertFalse($archivedLinkItem->canView());
    }
}
