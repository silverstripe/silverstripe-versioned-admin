<?php

namespace SilverStripe\VersionedAdmin\Controllers;

use InvalidArgumentException;
use SilverStripe\Admin\LeftAndMain;
use SilverStripe\Admin\LeftAndMainFormRequestHandler;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\HTTPResponse;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormFactory;
use SilverStripe\Versioned\Versioned;
use SilverStripe\VersionedAdmin\Forms\DataObjectVersionFormFactory;
use SilverStripe\VersionedAdmin\Forms\DiffTransformation;

/**
 * The HistoryViewerController provides AJAX endpoints for React to enable functionality, such as retrieving the form
 * schema.
 */
class HistoryViewerController extends LeftAndMain
{

    private static $url_segment = 'historyviewer';

    private static $url_rule = '/$Action';

    private static $url_priority = 10;

    private static $required_permission_codes = 'CMS_ACCESS_CMSMain';

    private static $allowed_actions = [
        'versionForm',
        'schema',
    ];

    /**
     * An array of supported form names that can be requested through the schema
     *
     * @var string[]
     */
    protected $formNames = ['versionForm', 'compareForm'];

    public function getClientConfig()
    {
        $clientConfig = parent::getClientConfig();

        $clientConfig['form']['versionForm'] = [
            'schemaUrl' => $this->owner->Link('schema/versionForm'),
        ];

        $clientConfig['form']['compareForm'] = [
            'schemaUrl' => $this->owner->Link('schema/compareForm'),
        ];

        return $clientConfig;
    }

    /**
     * Gets a JSON schema representing the current version detail form.
     *
     * WARNING: Experimental API.
     * @internal
     * @param HTTPRequest $request
     * @return HTTPResponse
     */
    public function schema($request)
    {
        $formName = $request->param('FormName');
        if (!in_array($formName, $this->formNames)) {
            return parent::schema($request);
        }

        return $this->generateSchemaForForm($formName, $request);
    }

    protected function generateSchemaForForm($formName, HTTPRequest $request)
    {
        switch ($formName) {
            // Get schema for history form
            case 'versionForm':
                $form = $this->getVersionForm([
                    'RecordClass' => $request->getVar('RecordClass'),
                    'RecordID' => $request->getVar('RecordID'),
                    'RecordVersion' => $request->getVar('RecordVersion'),
                ]);
                break;
            case 'compareForm':
                $form = $this->getCompareForm([
                    'RecordClass' => $request->getVar('RecordClass'),
                    'RecordID' => $request->getVar('RecordID'),
                    'RecordVersionFrom' => $request->getVar('RecordVersionFrom'),
                    'RecordVersionTo' => $request->getVar('RecordVersionTo'),
                ]);
                break;
            default:
                throw new InvalidArgumentException('Invalid form name passed to generate schema: ' . $formName);
        }

        // Respond with this schema
        $response = $this->getResponse();
        $response->addHeader('Content-Type', 'application/json');
        $schemaID = $this->getRequest()->getURL();

        return $this->getSchemaResponse($schemaID, $form);
    }

    /**
     * Returns a {@link Form} showing the version details for a given version of a record
     *
     * @param array $context
     * @return Form
     */
    public function getVersionForm(array $context)
    {
        // Check context
        if (!isset($context['RecordClass'], $context['RecordID'], $context['RecordVersion'])) {
            throw new InvalidArgumentException('Missing RecordID / RecordVersion / RecordClass for this form');
        }

        $recordClass = $context['RecordClass'];
        $recordId = $context['RecordID'];
        $recordVersion = $context['RecordVersion'];

        if (!$recordClass || !$recordId || !$recordVersion) {
            $this->jsonError(404);
            return null;
        }

        // Load record and perform a canView check
        $record = $this->getRecordVersion($recordClass, $recordId, $recordVersion);
        if (!$record) {
            return null;
        }

        $effectiveContext = array_merge($context, ['Record' => $record]);
        /** @var FormFactory $scaffolder */
        $scaffolder = Injector::inst()->get(DataObjectVersionFormFactory::class);
        $form = $scaffolder->getForm($this, 'versionForm', $effectiveContext);

        // Set form handler with class name, ID and VersionID
        $form->setRequestHandler(
            LeftAndMainFormRequestHandler::create($form, [$recordClass, $recordId, $recordVersion])
        );

        return $form;
    }
    
    /**
     * Fetches record version and checks canView permission for result
     *
     * @param string $recordClass
     * @param int $recordId
     * @param int $recordVersion
     * @return DataObject|null
     */
    protected function getRecordVersion($recordClass, $recordId, $recordVersion)
    {
        $record = Versioned::get_version($recordClass, $recordId, $recordVersion);
        
        if (!$record) {
            $this->jsonError(404);
            return null;
        }
        
        if (!$record->canView()) {
            $this->jsonError(403, _t(
                __CLASS__.'.ErrorItemViewPermissionDenied',
                "You don't have the necessary permissions to view {ObjectTitle}",
                ['ObjectTitle' => $record->i18n_singular_name()]
            ));
            return null;
        }
        
        return $record;
    }

    /**
     * Returns a {@link Form} containing the comparison {@link DiffTransformation} view for a record
     * between two specified versions.
     *
     * @param array $context
     * @return Form
     */
    public function getCompareForm(array $context)
    {
        // Check context
        if (!isset(
            $context['RecordClass'],
            $context['RecordID'],
            $context['RecordVersionFrom'],
            $context['RecordVersionTo']
        )) {
            throw new InvalidArgumentException('Missing RecordID / RecordVersion / RecordClass for this form');
        }

        $recordClass = $context['RecordClass'];
        $recordId = $context['RecordID'];
        $recordVersionFrom = $context['RecordVersionFrom'];
        $recordVersionTo = $context['RecordVersionTo'];

        if (!$recordClass || !$recordId || !$recordVersionFrom || !$recordVersionTo) {
            $this->jsonError(404);
            return null;
        }

        // Load record and perform a canView check
        $recordFrom = $this->getRecordVersion($recordClass, $recordId, $recordVersionFrom);
        $recordTo = $this->getRecordVersion($recordClass, $recordId, $recordVersionFrom);
        if (!$recordFrom || !$recordTo) {
            return null;
        }

        $effectiveContext = array_merge($context, ['Record' => $recordFrom]);
        /** @var FormFactory $scaffolder */
        $scaffolder = Injector::inst()->get(DataObjectVersionFormFactory::class);
        $form = $scaffolder->getForm($this, 'compareForm', $effectiveContext);
        $comparisonTransformation = DiffTransformation::create($recordTo);
        $form->transform($comparisonTransformation);

        // Set form handler with class name, ID and VersionID
        $form->setRequestHandler(
            LeftAndMainFormRequestHandler::create(
                $form,
                [
                    $recordClass,
                    $recordId,
                    $recordVersionFrom,
                    $recordVersionTo
                ]
            )
        );

        return $form;
    }

    public function versionForm(HTTPRequest $request = null)
    {
        if (!$request) {
            $this->jsonError(400);
            return null;
        }

        $recordClass = $request->getVar('RecordClass');
        $recordId = $request->getVar('RecordID');
        $recordVersion = $request->getVar('RecordVersion');
        if (!$recordClass || !$recordId || !$recordVersion) {
            $this->jsonError(400);
            return null;
        }

        return $this->getVersionForm([
            'RecordClass' => $recordClass,
            'RecordID' => $recordId,
            'RecordVersion' => $recordVersion,
        ]);
    }

    public function compareForm(HTTPRequest $request = null)
    {
        if (!$request) {
            $this->jsonError(400);
            return null;
        }

        $recordClass = $request->getVar('RecordClass');
        $recordId = $request->getVar('RecordID');
        $recordVersionFrom = $request->getVar('RecordVersionFrom');
        $recordVersionTo = $request->getVar('RecordVersionTo');
        if (!$recordClass || !$recordId || !$recordVersionFrom || !$recordVersionTo) {
            $this->jsonError(400);
            return null;
        }

        return $this->getCompareForm([
            'RecordClass' => $recordClass,
            'RecordID' => $recordId,
            'RecordVersionFrom' => $recordVersionFrom,
            'RecordVersionTo' => $recordVersionTo,
        ]);
    }
}
