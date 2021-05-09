const express = require('express');
const path = require('path');
const utils = require('./utils/fs_utils');

var ExpressUi5Controller = require('./express_controller/express_ui5_controller');
var ExpressImportLibController = require('./express_controller/express_import_controller');
var ExpressGatewayController = require('./express_controller/express_gateway_controller');


const RunConfiguration = require("./run_configuration");

const YARGS_COMMAND_PARAMS = [
    {
        name: "AppDir",
        type: "string",
        required: true,
        description: "The app directory within the apps folder"
    },
    {
        name: "StartupFile",
        type: "string",
        required: true,
        description: "The entry point (file) of the"
    }
]

class RunSinglePageConfiguration extends RunConfiguration {
    constructor (yargs) {
        super(arguments);
        this._sAppFolder = yargs.AppDir;
        this._sAppStartupFile = yargs.StartupFile;
    }

   loadConfig() {
        const oServerConfig = {};
        oServerConfig.specialRoutes = this._loadRoutes();
        oServerConfig.expressControllers = this._loadController();
        return oServerConfig
    }
    _loadController() {
        return [
            new ExpressUi5Controller("/app/resources"),
            new ExpressImportLibController("/app/resources"),
            new ExpressGatewayController()
        ]
    }
    _loadRoutes() {
        const sStartupPath = utils.searchInDir(`apps${path.sep}${this._sAppFolder}`,`${path.sep}${this._sAppStartupFile}`);
        const sAppPath = path.dirname(sStartupPath);
        return [
            {path: "/app", handler: express.static(sAppPath)},
            {path: "/test-resources", handler: express.static("test-resources")},
            {path: /^\/$/, handler: async (req, res) => {res.redirect(`/app/${this._sAppStartupFile}`);}},
                
        ]
    }
}

RunConfiguration.YARGS_COMMAND_PARAMS = YARGS_COMMAND_PARAMS

module.exports = RunSinglePageConfiguration;