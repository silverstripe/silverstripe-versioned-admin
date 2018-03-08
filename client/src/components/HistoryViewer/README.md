# HistoryViewer component

Generates a table displaying the historical changes of a DataObject that has the Versioned extension.

## Example
```js
<HistoryViewer name="my-historyviewer" sourceClass="SilverStripe\CMS\Model\SiteTree" id="123" />
```

## Properties

 * `name` (string) (required): The name for the component.
 * `sourceClass` (string): The class name for the DataObject to look up
 * `id` (int): The DataObject's ID
