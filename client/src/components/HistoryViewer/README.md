# HistoryViewer component

Generates a table displaying the historical changes of a DataObject that has the Versioned extension.

## Example
```js
<HistoryViewer name="my-historyviewer" recordClass="SilverStripe\CMS\Model\SiteTree" recordId="123" />
```

## Properties

 * `name` (string) (required): The name for the component
 * `recordClass` (string): The class name for the DataObject to look up
 * `recordId` (int): The DataObject's ID
