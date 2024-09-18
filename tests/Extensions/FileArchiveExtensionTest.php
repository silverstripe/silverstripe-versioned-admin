<?php

namespace SilverStripe\VersionedAdmin\Tests\Extensions;

use SilverStripe\Dev\SapphireTest;
use SilverStripe\Assets\AssetControlExtension;
use SilverStripe\Core\Config\Config;
use SilverStripe\Assets\File;
use PHPUnit\Framework\Attributes\DataProvider;

class FileArchiveExtensionTest extends SapphireTest
{
    #[DataProvider('provideIsArchiveFieldEnabled')]
    public function testIsArchiveFieldEnabled(
        bool $assetControlExtension,
        bool $file,
        bool $expected
    ): void {
        Config::modify()->set(AssetControlExtension::class, 'keep_archived_assets', $assetControlExtension);
        Config::modify()->set(File::class, 'keep_archived_assets', $file);
        $actual = File::singleton()->isArchiveFieldEnabled();
        $this->assertSame($expected, $actual);
    }

    public static function provideIsArchiveFieldEnabled(): array
    {
        return [
            [
                'assetControlExtension' => false,
                'file' => false,
                'expected' => false,
            ],
            [
                'assetControlExtension' => true,
                'file' => false,
                'expected' => true,
            ],
            [
                'assetControlExtension' => false,
                'file' => true,
                'expected' => true,
            ],
            [
                'assetControlExtension' => true,
                'file' => true,
                'expected' => true,
            ],
        ];
    }
}
