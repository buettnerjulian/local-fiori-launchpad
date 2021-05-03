# Local Fiori Sandbox

### Quick Guide to run a UI5 app in the local launchpad

1. Put your App in the apps folder (for example as a git-submodule)
2. Config your Tiles in the fioriSandboxConfig.json like the example
3. Change Proxy URL in the server.js to the Backend System u use
4. Install dependencies from package.json
5. Run "node update-apps-overview" in order to register the added apps to the dashboard
6. Run "node server"

Run http://localhost:3000 in your Browser.

### Quick Guide to add libraries which are required for your apps
1. Put the library in the libs folder
2. include your libs via /resources.... (see server.js)
