const express = require('express');
const ExpressUi5Controller = require('./express_controller/express_ui5_controller');
const ExpressImportLibController = require('./express_controller/express_import_controller');
const ExpressGatewayController = require('./express_controller/express_gateway_controller');
const ExpressGatewayAppsProxyController = require('./express_controller/express_gateway_apps_proxy_controller');


const RunConfiguration = require("./run_configuration");

class RunLaunchpadConfiguration extends RunConfiguration {
    loadConfig() {
        const oServerConfig = {};
        oServerConfig.specialRoutes = this._loadRoutes();
        oServerConfig.expressControllers = this._loadController();
        return oServerConfig
    }
    _loadController() {
        return [
            new ExpressUi5Controller("/resources/"),
            new ExpressImportLibController("/resources/"),
            new ExpressGatewayController(),
            // new ExpressGatewayAppsProxyController()
        ]
    }
    _loadRoutes() {
        return [
            {path: "/appconfig", handler: express.static("appconfig")},
            // {path: "/resources/com/tgroup/cat/sb/core", handler: async (req, res) => { console.log(req.path); res.redirect('/resources/com/tgroup/cat/ep/core/'+req.path);}},
            {path: "/apps", handler: express.static("apps")},
            {path: "/test-resources", handler: express.static("test-resources")},
            // {path: "/", handler: async (req, res) => {res.redirect('/test-resources/fioriSandbox.html');}},
                
        ]
    }
}

module.exports = RunLaunchpadConfiguration;