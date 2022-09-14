<?php

namespace SilverStripe\VersionedAdmin\Navigator;

use SilverStripe\Admin\Navigator\SilverStripeNavigatorItem;
use SilverStripe\Control\Controller;
use SilverStripe\Core\Config\Config;
use SilverStripe\Core\Convert;
use SilverStripe\ORM\DataObject;
use SilverStripe\Versioned\Versioned;

class SilverStripeNavigatorItem_LiveLink extends SilverStripeNavigatorItem
{
    private static int $priority = 30;

    public function getHTML()
    {
        $livePage = $this->getLivePage();
        if (!$livePage) {
            return null;
        }

        $linkClass = $this->isActive() ? 'class="current" ' : '';
        $linkTitle = _t(__CLASS__ . '.PUBLISHED_SITE', 'Published Site');
        $recordLink = Convert::raw2att(Controller::join_links($livePage->AbsoluteLink(), "?stage=Live"));
        return "<a {$linkClass} href=\"$recordLink\">$linkTitle</a>";
    }

    public function getTitle()
    {
        return _t(
            __CLASS__ . '.TITLE',
            'Published',
            'Used for the Switch between draft and published view mode. Needs to be a short label'
        );
    }

    public function getMessage()
    {
        return "<div id=\"SilverStripeNavigatorMessage\" title=\"" . _t(
            SilverStripeNavigatorItem::class . '.WONT_BE_SHOWN',
            'Note: this message will not be shown to your visitors'
        ) . "\">" . _t(
            __CLASS__ . '.PUBLISHED_SITE',
            'Published Site'
        ) . "</div>";
    }

    public function getLink()
    {
        $link = $this->getLivePage()->PreviewLink();
        return $link ? Controller::join_links($link, '?stage=Live') : '';
    }

    public function canView($member = null)
    {
        /** @var Versioned|DataObject $record */
        $record = $this->record;
        return (
            $record->hasExtension(Versioned::class)
            && $this->showLiveLink()
            && $record->hasStages()
            && $this->getLivePage()
            && $this->getLink()
        );
    }

    /**
     * @return bool
     */
    public function showLiveLink()
    {
        return (bool)Config::inst()->get(get_class($this->record), 'show_live_link');
    }

    public function isActive()
    {
        return (
            (!Versioned::get_stage() || Versioned::get_stage() == 'Live')
            && !$this->isArchived()
        );
    }

    protected function getLivePage()
    {
        $baseClass = $this->record->baseClass();
        return Versioned::get_by_stage($baseClass, Versioned::LIVE)->byID($this->record->ID);
    }
}
