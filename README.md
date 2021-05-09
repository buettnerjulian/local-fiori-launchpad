# Local Fiori Sandbox

### Quick Setup Guide
1. Use "npm install" to install the dependencies
2. Start the server, e.g. by using the command "npm server launchpad"
3. The server will stop and ask you to update a clean config file it created: 
"Added a clean config file ... Please enter valid information before restarting the server."
This step can happen twice.
4. Every thing should be fine, if the server starts without a error Message
5. With the command "node server help" helps to understand and find the right commands

### Quick Guide to run a UI5 app in the local launchpad

1. Put your Apps in the apps folder (for example as a git-submodule)
2. Config your Tiles in the fioriSandboxConfig.json by using the command "node update-apps-overview" and adjust the generated config if necessary.
3. Run "node server launchpad"
4. Run "http://localhost:3000/test-resources/fioriSandbox.html#" in your Browser.

### Quick Guide to run a UI5 stand alone application

1. Put your App in the apps folder (for example as a git-submodule)
2. Run "node server single-page --AppDir 'THE_DIRECTORY_BELOW_APPS' --StartupFile 'THE_ENTRY_FILE'"
4. Run "http://localhost:3000/app/THE_ENTRY_FILE" in your Browser.

### Quick Guide to add libraries which are required for your apps
1. Put the library in the libs folder
2. Restart the server
