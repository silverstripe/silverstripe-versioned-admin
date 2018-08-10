<?php

namespace SilverStripe\VersionedAdmin\Controllers;

use InvalidArgumentException;
use SilverStripe\Admin\LeftAndMain;
use SilverStripe\Admin\LeftAndMainFormRequestHandler;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\HTTPResponse;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Forms\Form;
use SilverStripe\Forms\FormFactory;
use SilverStripe\ORM\DataObject;
use SilverStripe\Versioned\Versioned;
use SilverStripe\VersionedAdmin\Forms\DataObjectVersionFormFactory;
use SilverStripe\VersionedAdmin\Forms\DiffTransformation;

/**
 * The HistoryViewerController provides AJAX endpoints for React to enable functionality, such as retrieving the form
 * schema.
 */
class HistoryViewerController extends LeftAndMain
{
    /**
     * @var string
     */
    const FORM_NAME_VERSION = 'versionForm';

    /**
     * @var string
     */
    const FORM_NAME_COMPARE = 'compareForm';

    private static $url_segment = 'historyviewer';

    private static $url_rule = '/$Action';

    private static $url_priority = 10;

    private static $required_permission_codes = 'CMS_ACCESS_CMSMain';

    private static $allowed_actions = [
        self::FORM_NAME_VERSION,
        self::FORM_NAME_COMPARE,
        'schema',
    ];

    /**
     * An array of supported form names that can be requested through the schema
     *
     * @var string[]
     */
    protected $formNames = [self::FORM_NAME_VERSION, self::FORM_NAME_COMPARE];

    public function getClientConfig()
    {
        $clientConfig = parent::getClientConfig();

        foreach ($this->formNames as $formName) {
            $clientConfig['form'][$formName] = [
                'schemaUrl' => $this->Link('schema/' . $formName),
            ];
        }

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

    /**
     * Checks the requested schema name and returns a scaffolded {@link Form}. An exception is thrown
     * if an unexpected value is provided.
     *
     * @param string $formName
     * @param HTTPRequest $request
     * @return HTTPResponse
     * @throws InvalidArgumentException
     */
    protected function generateSchemaForForm($formName, HTTPRequest $request)
    {
        switch ($formName) {
            // Get schema for history form
            case self::FORM_NAME_VERSION:
                $form = $this->getVersionForm([
                    'RecordClass' => $request->getVar('RecordClass'),
                    'RecordID' => $request->getVar('RecordID'),
                    'RecordVersion' => $request->getVar('RecordVersion'),
                ]);
                break;
            case self::FORM_NAME_COMPARE:
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
        $this->validateInput($context, ['RecordClass', 'RecordID', 'RecordVersion']);

        $recordClass = $context['RecordClass'];
        $recordId = $context['RecordID'];
        $recordVersion = $context['RecordVersion'];

        // Load record and perform a canView check
        $record = $this->getRecordVersion($recordClass, $recordId, $recordVersion);
        if (!$record) {
            return null;
        }

        $effectiveContext = array_merge($context, ['Record' => $record]);
        return $this->scaffoldForm(self::FORM_NAME_VERSION, $effectiveContext, [
            $recordClass,
            $recordId,
            $recordVersion
        ]);
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
        $this->validateInput($context, ['RecordClass', 'RecordID', 'RecordVersionFrom', 'RecordVersionTo']);

        $recordClass = $context['RecordClass'];
        $recordId = $context['RecordID'];
        $recordVersionFrom = $context['RecordVersionFrom'];
        $recordVersionTo = $context['RecordVersionTo'];

        // Load record and perform a canView check
        $recordFrom = $this->getRecordVersion($recordClass, $recordId, $recordVersionFrom);
        $recordTo = $this->getRecordVersion($recordClass, $recordId, $recordVersionTo);
        if (!$recordFrom || !$recordTo) {
            return null;
        }

        $effectiveContext = array_merge($context, ['Record' => $recordTo]);

        $form = $this->scaffoldForm(self::FORM_NAME_COMPARE, $effectiveContext, [
            $recordClass,
            $recordId,
            $recordVersionFrom,
            $recordVersionTo,
        ]);

        // Enable the "compare mode" diff view
        $comparisonTransformation = DiffTransformation::create();
        $form->transform($comparisonTransformation);
        $form->loadDataFrom($recordFrom);

        return $form;
    }

    public function versionForm(HTTPRequest $request = null)
    {
        if (!$request) {
            $this->jsonError(400);
            return null;
        }

        try {
            return $this->getVersionForm([
                'RecordClass' => $request->getVar('RecordClass'),
                'RecordID' => $request->getVar('RecordID'),
                'RecordVersion' => $request->getVar('RecordVersion'),
            ]);
        } catch (InvalidArgumentException $ex) {
            $this->jsonError(400);
        }
    }

    public function compareForm(HTTPRequest $request = null)
    {
        if (!$request) {
            $this->jsonError(400);
            return null;
        }

        try {
            return $this->getCompareForm([
                'RecordClass' => $request->getVar('RecordClass'),
                'RecordID' => $request->getVar('RecordID'),
                'RecordVersionFrom' => $request->getVar('RecordVersionFrom'),
                'RecordVersionTo' => $request->getVar('RecordVersionTo'),
            ]);
        } catch (InvalidArgumentException $ex) {
            $this->jsonError(400);
        }
    }

    /**
     * Perform some centralised validation checks on the input request and data within it
     *
     * @param array $context
     * @param string[] $requiredFields
     * @return bool
     * @throws InvalidArgumentException
     */
    protected function validateInput(array $context, array $requiredFields = [])
    {
        foreach ($requiredFields as $requiredField) {
            if (empty($context[$requiredField])) {
                throw new InvalidArgumentException('Missing required field ' . $requiredField);
            }
        }
        return true;
    }

    /**
     * Given some context, scaffold a form using the FormFactory and return it
     *
     * @param string $formName The name for the returned {@link Form}
     * @param array $context Context arguments for the {@link FormFactory}
     * @param array $extra Context arguments for the {@link LeftAndMainFormRequestHandler}
     * @return Form
     */
    protected function scaffoldForm($formName, array $context = [], array $extra = [])
    {
        /** @var FormFactory $scaffolder */
        $scaffolder = Injector::inst()->get(DataObjectVersionFormFactory::class);
        $form = $scaffolder->getForm($this, $formName, $context);

        // Set form handler with class name, ID and VersionID
        return $form->setRequestHandler(
            LeftAndMainFormRequestHandler::create($form, $extra)
        );
    }
}
