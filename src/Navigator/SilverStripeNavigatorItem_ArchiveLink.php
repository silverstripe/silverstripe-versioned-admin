<?php

namespace SilverStripe\VersionedAdmin\Navigator;

use SilverStripe\Admin\Navigator\SilverStripeNavigatorItem;
use SilverStripe\CMS\Model\RedirectorPage;
use SilverStripe\Control\Controller;
use SilverStripe\Core\Convert;
use SilverStripe\ORM\DataObject;
use SilverStripe\ORM\FieldType\DBDatetime;
use SilverStripe\ORM\FieldType\DBField;
use SilverStripe\Versioned\Versioned;

class SilverStripeNavigatorItem_ArchiveLink extends SilverStripeNavigatorItem
{
    private static int $priority = 40;

    public function getHTML()
    {
        $linkClass = $this->isActive() ? 'ss-ui-button current' : 'ss-ui-button';
        $linkTitle = _t(__CLASS__ . '.PREVIEW', 'Preview version');
        $recordLink = Convert::raw2att(Controller::join_links(
            $this->record->AbsoluteLink(),
            '?archiveDate=' . urlencode($this->record->LastEdited ?? '')
        ));
        return "<a class=\"{$linkClass}\" href=\"$recordLink\" target=\"_blank\">$linkTitle</a>";
    }

    public function getTitle()
    {
        return _t(__CLASS__ . '.TITLE', 'Archived');
    }

    public function getMessage()
    {
        $date = Versioned::current_archived_date();
        if (empty($date)) {
            return null;
        }
        /** @var DBDatetime $dateObj */
        $dateObj = DBField::create_field('Datetime', $date);
        $title = _t(
            SilverStripeNavigatorItem::class . '.WONT_BE_SHOWN',
            'Note: this message will not be shown to your visitors'
        );
        return "<div id=\"SilverStripeNavigatorMessage\" title=\"{$title}\">"
            . _t(__CLASS__ . '.ARCHIVED_FROM', 'Archived site from {date}', ['date' => $dateObj->Nice()])
            . '</div>';
    }

    public function getLink()
    {
        $link = $this->record->PreviewLink();
        return $link ? Controller::join_links($link, '?archiveDate=' . urlencode($this->record->LastEdited ?? '')) : '';
    }

    public function canView($member = null)
    {
        /** @var Versioned|DataObject $record */
        $record = $this->record;
        return (
            $record->hasExtension(Versioned::class)
            && $record->hasStages()
            && $this->isArchived()
            // Don't follow redirects in preview, they break the CMS editing form
            && !($record instanceof RedirectorPage)
            && $this->getLink()
        );
    }

    public function isActive()
    {
        return $this->isArchived();
    }
}
