<?php

namespace SilverStripe\VersionedAdmin\Tests\Extensions;

use SilverStripe\CMS\Forms\SiteTreeURLSegmentField;
use SilverStripe\CMS\Model\SiteTree;
use SilverStripe\Dev\SapphireTest;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Versioned\Versioned;
use SilverStripe\VersionedAdmin\Navigator\SilverStripeNavigatorItem_ArchiveLink;

class SiteTreeArchiveExtensionTest extends SapphireTest
{
    protected $usesDatabase = true;

    public function testUrlSegmentFieldLinksToTheArchivedPage(): void
    {
        $child = $this->createArchivedPageWithArchivedParent();

        $url = $this->getUrlSegmentField($child)->getURL();

        $this->assertStringContainsString(
            'parent-page/child-page',
            $url,
            'The ancestor path is resolved from version history, even though the parent was archived too'
        );
        $this->assertStringNotContainsString(
            'stage=Stage',
            $url,
            'An archived page is not on the draft stage, so a draft link only opens the "page not found" page'
        );
        $this->assertStringContainsString('archiveDate=', $url);
    }

    /**
     * SiteTreeURLSegmentField.js rebuilds the link as encodeURI(decodeURI(prefix + segment) + suffix),
     * so anything percent-encoded in the suffix is encoded a second time and the date arrives mangled
     */
    public function testUrlSegmentFieldSuffixIsNotPreEncoded(): void
    {
        $child = $this->createArchivedPageWithArchivedParent();
        $field = $this->getUrlSegmentField($child);

        $this->assertStringNotContainsString('%', $field->getURLSuffix());

        // The server-rendered href is still encoded, and decodes back to the version's date
        parse_str((string) parse_url($field->getURL(), PHP_URL_QUERY), $query);
        $this->assertSame(
            SilverStripeNavigatorItem_ArchiveLink::getArchiveDate($child),
            $query['archiveDate'] ?? null
        );
    }

    public function testUrlSegmentFieldMatchesTheArchivePreviewState(): void
    {
        $child = $this->createArchivedPageWithArchivedParent();

        $this->assertSame(
            (new SilverStripeNavigatorItem_ArchiveLink($child))->getLink(),
            $this->getUrlSegmentField($child)->getURL()
        );
    }

    public function testPageOnDraftIsLeftAlone(): void
    {
        $page = SiteTree::create(['Title' => 'Draft page', 'URLSegment' => 'draft-page']);
        $page->write();

        $this->assertStringContainsString('stage=Stage', $this->getUrlSegmentField($page)->getURL());
    }

    private function createArchivedPageWithArchivedParent(): SiteTree
    {
        $parent = SiteTree::create(['Title' => 'Parent page', 'URLSegment' => 'parent-page']);
        $parent->write();
        $parent->publishSingle();

        $child = SiteTree::create([
            'Title' => 'Child page',
            'URLSegment' => 'child-page',
            'ParentID' => $parent->ID,
        ]);
        $child->write();
        $child->publishSingle();

        $child->doArchive();
        $parent->doArchive();

        // The archive admin lists the "deleted" versions of records removed from draft
        $archived = Versioned::getRemovedFromDraft(SiteTree::class)->byID($child->ID);
        $this->assertInstanceOf(SiteTree::class, $archived);

        return $archived;
    }

    /**
     * The field only knows the page's URL segment once the edit form has loaded the record into it
     */
    private function getUrlSegmentField(SiteTree $page): SiteTreeURLSegmentField
    {
        $fields = $page->getCMSFields();
        Form::create(null, 'EditForm', $fields, FieldList::create())->loadDataFrom($page);

        $field = $fields->dataFieldByName('URLSegment');
        $this->assertInstanceOf(SiteTreeURLSegmentField::class, $field);

        return $field;
    }
}
