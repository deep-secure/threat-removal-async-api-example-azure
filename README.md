# Demo the Threat Removal Async API on Microsoft Azure
Featuring Deep Secure’s unique [Threat Removal technology](https://www.deep-secure.com/threat-removal-1.php) delivered via the cloud, potentially infected files can be uploaded and transformed. Providing 100% guaranteed, clean files in return. This is the key difference between existing anti-virus detection based approaches and our next generation Threat Removal technology; malicious content is simply left behind. You can learn more about our [cloud-based APIs here](https://threat-removal.deep-secure.com/apis).

Our Instant and Async APIs can be utilised through Microsoft Azure. By following the setup instructions below, content can be uploaded to a storage container within Azure, sent to our Threat Removal services in AWS and subsequently transformed. The safe content is then placed in another storage container in Azure for you to download. Currently, we do not support native Azure transformations. When using our Azure code samples, content leaves the Azure infrastructure and is sent to our AWS-hosted APIs for transformation. We are planning to support Microsoft Azure natively in the future.

This code sample deploys a small amount of Microsoft Azure infrastructure. This includes:
+ A storage account used to store input files, transformations and errors
+ A Function App that uploads files from your storage account to the instant API, then downloads the result
+ Additional resources necessary for logging and billing within Microsoft Azure

These resources will be created in your own Microsoft Azure account, and usage will incur charges to your Microsoft Azure subscription as well as separate Threat Removal API fees. The Azure charges are primarily for Storage Accounts and data transfer. You can keep the storage charges to a minimum by removing data from the blob containers after use.

## Setup Instructions
1. Login to the [Microsoft Azure Portal](https://portal.azure.com/). You can create a new Microsoft Azure account if necessary, or choose an existing one. Your Azure account must be linked to an active subscription in order to deploy this code sample. To do so, either add a payment method to your Azure account or activate a [free trial subscription](https://azure.microsoft.com/en-gb/free/).
2. Click this button to open the code sample template in the Azure Portal:  
[![Deploy to Azure](https://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fdeep-secure%2Fthreat-removal-async-api-example-azure%2Fmain%2Fazuredeploy.json)
3. Select the appropriate subscription to manage the deployed resources and associated costs. Then, choose a resource group to deploy into. This can either be an existing resource group or a newly created one.
4. If you chose to create a new resource group, please select the region you would like the resources to be deployed into. If you chose an existing resource group, the region will be based on the location of the resource group you selected.
5. Enter a name for the function app resource. This can be anything you like, but the name must only contain alphanumerics and hyphens.
6. Get your API Service URL and API Key from the [Async API management page](https://threat-removal.deep-secure.com/api/async/manage) and enter these values into the Azure deployment parameters.
7. Click the blue 'Review + create' button at the bottom of the page. The deployment will now undergo final validation checks. After the validation checks have passed, please read the Microsoft Azure terms that are on screen.
8. Once you have read the on-screen T&C's, click the blue 'Create' button to start the deployment of the code sample.
9. You will now be redirected to the deployment overview. The deployment should only take a couple of minutes. Once the deployment is complete, click the blue 'Go to resource group' button.
10. In the resource group, click on the *filestorexxxxxxxxxxxxx* storage account. Then, on the 'overview' page, in the 'Tools and SDKs' section, open 'Storage Explorer (preview)'.
11. In Storage Explorer, open the blob containers dropdown:  
    + *input* - upload unsafe content here. The Azure Function then sends the unsafe content to the Async API to be transformed.
    + *transformed* - Safe content is uploaded to this blob container after a successful transformation.
    + *errors* - If the unsafe content cannot be processed, a json file containing error information will be placed here.

You are now ready to upload some content to the Async API.

## Usage Instructions
1. In the *filestorexxxxxxxxxxxxx* storage account, open the *input* blob container.
2. Upload a file to the *input* container via the Azure Portal (alternatively, this can be done via the [Azure REST API, CLI, Powershell etc.](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction))
3. Refresh until the file disappears from the *input* container.
3. Check the *transformed* container for your newly transformed file.
4. If it is not there, check the *errors* container.

## Cleaning up
Follow these steps in order to remove the deployed Azure resources:
1. Navigate to 'Resource Groups' in the Azure portal.
2. Click on the resource group that contains your deployed resources
3. Click 'Delete resource group'
4. Click the blue 'Delete' button.