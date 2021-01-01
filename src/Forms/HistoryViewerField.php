<?php

namespace SilverStripe\VersionedAdmin\Forms;

use SilverStripe\Forms\FormField;
use SilverStripe\ORM\CMSPreviewable;
use SilverStripe\ORM\DataObject;
use SilverStripe\Security\Security;

class HistoryViewerField extends FormField
{
    /**
     * The default pagination page size
     *
     * @config
     * @var int
     */
    private static $default_page_size = 30;

    /**
     * Unique context key used to differentiate the different use cases for HistoryViewer
     *
     * @var string
     */
    protected $contextKey;

    protected $schemaComponent = 'HistoryViewer';

    protected $inputType = '';

    public function __construct($name, $title = null, $value = null)
    {
        parent::__construct($name, $title, $value);
    }

    protected function setupDefaultClasses()
    {
        parent::setupDefaultClasses();

        $this->addExtraClass('fill-height');
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
        $previewEnabled = $record && $record instanceof CMSPreviewable;

        $this->extend('updatePreviewEnabled', $previewEnabled, $record);

        return $previewEnabled;
    }

    private function getIsRevertable()
    {
        $record = $this->getSourceRecord();
        $member = Security::getCurrentUser();
        return $record->canEdit($member);
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

    /**
     * Provide the necessary input data for React to power the history viewer
     *
     * {@inheritDoc}
     */
    public function getSchemaDataDefaults()
    {
        $data = parent::getSchemaDataDefaults();

        $sourceRecord = $this->getSourceRecord();

        $data['data'] = array_merge($data['data'], [
            'recordId' => $sourceRecord ? $sourceRecord->ID : null,
            'recordClass' => $sourceRecord ? $sourceRecord->ClassName : null,
            'contextKey' => $this->getContextKey(),
            'isPreviewable' => $this->getPreviewEnabled(),
            'isRevertable' => $this->getIsRevertable(),
            'limit' => $this->config()->get('default_page_size'),
            'offset' => 0,
            'page' => 0,
        ]);

        return $data;
    }

    /**
     * When not used in a React form factory context, this adds the schema data to SilverStripe template
     * rendered attributes lists
     *
     * @return array
     */
    public function getAttributes()
    {
        $attributes = parent::getAttributes();

        $attributes['data-schema'] = json_encode($this->getSchemaData());

        return $attributes;
    }

    public function Type()
    {
        return 'history-viewer__container';
    }
}
