<?php

namespace SilverStripe\VersionedAdmin\Forms;

use SilverStripe\Forms\FormField;
use SilverStripe\ORM\CMSPreviewable;
use SilverStripe\ORM\DataObject;
use SilverStripe\View\Requirements;

class HistoryViewerField extends FormField
{
    /**
     * Default to using the SiteTree component
     *
     * @var string
     */
    protected $schemaComponent = 'PageHistoryViewer';

    /**
     * Unique context key used to differentiate the different use cases for HistoryViewer
     *
     * @var string
     */
    protected $contextKey;

    public function __construct($name, $title = null, $value = null)
    {
        Requirements::javascript('silverstripe/versioned-admin:client/dist/js/bundle.js');
        Requirements::css('silverstripe/versioned-admin:client/dist/styles/bundle.css');

        parent::__construct($name, $title, $value);
    }

    /**
     * Get the source record to view history for
     *
     * @return DataObject|null
     */
    public function getSourceRecord()
    {
        return $this->getForm() ? $this->getForm()->getRecord() : null;
    }

    /**
     * Get whether the record is previewable
     *
     * @return boolean
     */
    public function getPreviewEnabled()
    {
        $record = $this->getSourceRecord();

        return $record && $record instanceof CMSPreviewable;
    }

    public function getContextKey()
    {
        if ($this->contextKey) {
            return $this->contextKey;
        }

        // Default to using the DataObject's DB table name as the unique identifier
        return DataObject::getSchema()->baseDataTable(get_class($this->getSourceRecord()));
    }

    public function setContextKey($contextKey)
    {
        $this->contextKey = (string) $contextKey;
        return $this;
    }
}
