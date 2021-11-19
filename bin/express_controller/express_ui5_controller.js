const express = require('express');
const sapui5 = require("sapui5-runtime");
const fs = require('fs');
const httpProxy = require('http-proxy');
const ExpressController = require("./express_controller");
const ExpressGatewayController = require("./express_gateway_controller");

/**
 * Enum string values.
 * @enum {string}
 */
const Ui5PredefinedSources = {
    LOCAL: "LOCAL",
    GATEWAY: "GATEWAY"
};

class ExpressUI5Controller extends ExpressController {
    
    /**
     * @typedef Ui5Config
     * @property {UUi5PredefinedSources|string} source
     */
    static get configPath() { return `${ExpressController.CONFIG_ROOT}ui5_controller.json`};
    static get gatewayResourcePath() { return `/sap/bc/ui5_ui5/ui2/ushell${this._sSapUi5BaseRoute}/`};
    constructor (psSapUi5BaseRoute, ...args){
        // TODO: Medium find a nice solution for the singleton pattern
        super(...args);
        this._sSapUi5BaseRoute = psSapUi5BaseRoute;
    }
    
    loadData () {
        super.loadData();
        if (!fs.existsSync(ExpressUI5Controller.configPath)) {
            this._createDefaultConfigFile();
            console.error(`Added a clean config file for UI5-settings '${ExpressUI5Controller.configPath}'. Please enter valid information before restarting the server.`);
            process.exit();
        }
        
        let sRawConfigData = fs.readFileSync(ExpressUI5Controller.configPath);
        let oConfig = JSON.parse(sRawConfigData);
        let oGatewayConfig = oConfig.ui5Config;
        this.config = oGatewayConfig;
    }
    _defaultConfig() {
        return {
            "ui5Config": {
                "_comment": "Please define a valid source. Possible sources LOCAL|GATEWAY|any url",
                "source": ""
            }
        }
    }
    _createDefaultConfigFile(){
        let oDefaultConfig = this._defaultConfig();
        fs.writeFileSync(ExpressUI5Controller.configPath, JSON.stringify(oDefaultConfig, null, 4));
    }

    /**
     * @type {Ui5Config}
     */
    set config(poConfig){
        this._oConfig = poConfig;
        switch (this.source) {
            case Ui5PredefinedSources.LOCAL:
                this._initialiseLocalSourceMiddleware();
                break;
            case Ui5PredefinedSources.GATEWAY:
                break;
            default:
                this._initialiseProxy();
                break;
        }
    } 
    /**
     * @type {Ui5Config}
     */
    get config(){
        return this._oConfig;
    }

    get source() {
        return this._oConfig.source;
    }

    get proxy(){
        return this._oProxy;
    }
    
    _initialiseLocalSourceMiddleware() {
        if (this._localSourceMiddleware != null) return;
        this._localSourceMiddleware = express.static(sapui5);
    }

    _initialiseProxy(psUrl) {
        if (this._oProxy != null) {
            this._oProxy.close();
            delete this._oProxy;
        }
        let oConfig = {
            target: this.config.source,
            secure: false,
            changeOrigin: true,
            autoRewrite: true,
            protocolRewrite: "http"
        }
        this._oProxy = httpProxy.createProxyServer(oConfig);
    }
    _adjustRequestPathForLocal(poReq) {
        poReq.url = poReq.originalUrl.replace(`${this._sSapUi5BaseRoute}`, "")
    }
    _adjustRequestPathForUrl(poReq) {
        poReq.url = poReq.originalUrl.replace(`${this._sSapUi5BaseRoute}`, "")
    }
    _adjustRequestPathForGateway(poReq) {
        poReq.url = poReq.url.replace(`${this._sSapUi5BaseRoute}`, ExpressUI5Controller.gatewayResourcePath);
    }
    /**
     * Registers the controller routes
     * @param {Express.Application} poExpressApp 
     */
    registerRoutes (poExpressApp) {
        super.registerRoutes(poExpressApp);
        poExpressApp.use(`${this._sSapUi5BaseRoute}`, (req, res, next) => {
            var reqCopy = Object.assign({}, req);
            reqCopy.headers = req.headers
            // var reqCopy = JSON.parse(JSON.stringify(req));
            switch (this.source) {
                case Ui5PredefinedSources.LOCAL:
                    this._adjustRequestPathForLocal(reqCopy);
                    this._localSourceMiddleware(reqCopy, res, next);
                    break;
                case Ui5PredefinedSources.GATEWAY:
                    this._adjustRequestPathForGateway(reqCopy);
                    new ExpressGatewayController().proxy.web(reqCopy, res, next);
                    break;
                default:
                    this._adjustRequestPathForUrl(reqCopy);
                    this.proxy.web(reqCopy, res, next);
                    break;
            }
        });
    }
}
module.exports = ExpressUI5Controller;