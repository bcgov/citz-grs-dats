# Setup Instructions

## Step 1: Update the Registry File

To enable the protocol handler for your desktop application, you need to update the registry file with the path to your application.

Example Registry File (`myprotocol.reg`):

```reg
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\myprotocol]
@="URL:My Protocol"
"URL Protocol"=""

[HKEY_CLASSES_ROOT\myprotocol\shell]

[HKEY_CLASSES_ROOT\myprotocol\shell\open]

[HKEY_CLASSES_ROOT\myprotocol\shell\open\command]
@="\"C:\\Path\\To\\Your\\DesktopApp.exe\" \"%1\""
```

## Step 2: Install the Registry File
Double click on the registry `myprotocol.reg` to install it.

This can also be achieved by running `regedit /s myprotocol.reg` from an elevated command prompt.

## Step 3: Install the Windows Service

 Step 1: Open Command Prompt as Administrator.
 
 Step 2: Navigate to the directory where the service executable (DATSCompanionService.exe) is located
 
 Step 3: Run `installutil DATSCompanionService.exe` 
 
 Step 4: Run `net start DATSCompanionService`

TO install a new version of the service uninstall the service by running the following command

``installutil DATSCompanionService.exe``