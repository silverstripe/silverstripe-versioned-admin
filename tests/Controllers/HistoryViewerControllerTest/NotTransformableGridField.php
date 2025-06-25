<?php

namespace SilverStripe\VersionedAdmin\Tests\Controllers\HistoryViewerControllerTest;

use SilverStripe\Dev\TestOnly;
use SilverStripe\Forms\FormTransformation;
use SilverStripe\Forms\GridField\GridField;

/**
 * GridField that won't get transformed.
 * This makes sure that weird setups don't break the compare form.
 */
class NotTransformableGridField extends GridField implements TestOnly
{
    public function transform(FormTransformation $transformation)
    {
        return $this;
    }
}
