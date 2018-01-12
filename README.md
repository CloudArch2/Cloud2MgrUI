# Cloud2MgrUI
The UI to submit data requests

This is a partial React implementation that submits a mostly hard coded payload to the Azure function that triggers the data pull.

It is wired to a dummy datasource for metadata, changing the URL should get the metadata (the fetch may need to be augmented with additional details like content-type, etc if the function requires more than a GET).
