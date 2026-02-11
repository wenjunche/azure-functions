# Customer auth function

## Create function
* Install az cli
* Install Azure Functions extension in VSCode
* Press Ctrl+Shift+P and select Azure: Sign-in
* Press F1. Type Azure Functions: Create New Project
* Select HTTP trigger as the template and name it
* Add custom login in EnterpriseBrowserValidator.ts

## Deploy to Azure
* In VS Code, go to the Azure tab
* Under Resources, click the + (plus sign) and select Create Function App in Azure
* Fill all the prompts
* Once created, right-click the new Function App in the list and select Deploy to Function App
* Copy the function URL

## Register the Custom Authentication Extension
* Log in Entra and go to External Identities > Custom authentication extensions.
* Click + Create a custom extension.
* Event type: Select TokenIssuanceStart
* Endpoint Configuration Tab: enter name and Azure Function URL, created earlier

Go to App registrations in Entra and select the app you are trying to use for the extension
Select Expose an API and accept the default


Get-MgServicePrincipal -Filter "appId eq '99045fe1-7639-4a75-9d4a-577b6ca3810f'"

New-MgServicePrincipal -AppId "99045fe1-7639-4a75-9d4a-577b6ca3810f"