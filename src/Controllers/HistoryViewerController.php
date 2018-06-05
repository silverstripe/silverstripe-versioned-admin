<?php

namespace SilverStripe\VersionedAdmin\Controllers;

use InvalidArgumentException;
use SilverStripe\Admin\LeftAndMain;
use SilverStripe\Admin\LeftAndMainFormRequestHandler;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Control\HTTPResponse;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Forms\FormFactory;
use SilverStripe\Versioned\Versioned;
use SilverStripe\VersionedAdmin\Forms\DataObjectVersionFormFactory;

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

    public function getClientConfig()
    {
        $clientConfig = parent::getClientConfig();

        $clientConfig['form']['versionForm'] = [
            'schemaUrl' => $this->owner->Link('schema/versionForm')
        ];

        return $clientConfig;
    }

    /**
     * Gets a JSON schema representing the current version detail form.
     *
     * WARNING: Experimental API.
     *
     * @param HTTPRequest $request
     * @return HTTPResponse
     */
    public function schema($request)
    {
        $formName = $request->param('FormName');
        if ($formName !== 'versionForm') {
            return parent::schema($request);
        }

        // Get schema for history form
        // @todo Eventually all form scaffolding will be based on context rather than record ID
        // See https://github.com/silverstripe/silverstripe-framework/issues/6362
        $form = $this->getVersionForm([
            'RecordClass' => $request->getVar('RecordClass'),
            'RecordID' => $request->getVar('RecordID'),
            'RecordVersion' => $request->getVar('RecordVersion'),
        ]);

        // Respond with this schema
        $response = $this->getResponse();
        $response->addHeader('Content-Type', 'application/json');
        $schemaID = $this->getRequest()->getURL();
        return $this->getSchemaResponse($schemaID, $form);
    }

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
}
