<?php

use SilverStripe\Admin\CMSMenu;
use SilverStripe\VersionedAdmin\Controllers\CMSPageHistoryViewerController;

CMSMenu::remove_menu_class(CMSPageHistoryViewerController::class);
