<?php

use SilverStripe\Admin\CMSMenu;
use SilverStripe\VersionedAdmin\Controllers\CMSPageHistoryViewerController;
use SilverStripe\VersionedAdmin\Controllers\HistoryViewerController;

CMSMenu::remove_menu_class(CMSPageHistoryViewerController::class);
CMSMenu::remove_menu_class(HistoryViewerController::class);
