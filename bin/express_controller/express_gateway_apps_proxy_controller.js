const express = require('express');
const sapui5 = require("sapui5-runtime");
const fs = require('fs');
const httpProxy = require('http-proxy');
const ExpressController = require("./express_controller");
const ExpressGatewayController = require("./express_gateway_controller");
const GatewayExpressController = require('./express_gateway_controller');
const { Console } = require('console');

class ExpressGatewayAppsProxyController extends ExpressController {
    /**
     * @typedef AppProxyConfigRoute
     * @property {String} GatewayRoute
     * @property {String} LocalRoute
     * @property {boolean} Active
     */
    
    /**
     * @typedef AppProxyConfig
     * @property {AppProxyConfigRoute[]} Routes
     * @property {String} Protocol
     */
    static get configPath() { return `${ExpressController.CONFIG_ROOT}gateway_apps.json`};
    /**
     * @type {ExpressGatewayController}
     */
    static get gatewayController() { 
        return ExpressGatewayAppsProxyController._oGatewayController != null ? ExpressGatewayAppsProxyController._oGatewayController : ExpressGatewayAppsProxyController._oGatewayController = new GatewayExpressController() || ExpressGatewayAppsProxyController._oGatewayController
    };
    constructor (...args){
        // TODO: Medium find a nice solution for the singleton pattern
        super(...args);
    }
    
    loadData () {
        super.loadData();
        if (!fs.existsSync(ExpressGatewayAppsProxyController.configPath)) {
            this._createDefaultConfigFile();
            console.error(`Added a clean config file for UI5-settings '${ExpressGatewayAppsProxyController.configPath}'. Please enter valid information before restarting the server.`);
            process.exit();
        }
        
        let sRawConfigData = fs.readFileSync(ExpressGatewayAppsProxyController.configPath);
        let oConfig = JSON.parse(sRawConfigData);
        let oGatewayConfig = oConfig.RouteConfig;
        this.config = oGatewayConfig;
    }
    _defaultConfig() {
        return {
            "RouteConfig": {
                "_comment": "",
                "Protocol": "http",
                "Routes": [
                    {
                        "_comment": "",
                        "GatewayRoute": "",
                        "LocalRoute": "",
                        "Active": false
                    }
                ]
            }
        }
    }
    _createDefaultConfigFile(){
        let oDefaultConfig = this._defaultConfig();
        fs.writeFileSync(ExpressGatewayAppsProxyController.configPath, JSON.stringify(oDefaultConfig, null, 4));
    }

    /**
     * @type {AppProxyConfig}
     */
    set config(poConfig){
        this._oConfig = poConfig;
        if (this._oConfig != null) this._oConfig.Routes = this._oConfig.Routes.filter((r) => r.Active);
        this._initialiseGatewayProxy();
    } 
    /**
     * @type {AppProxyConfig}
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
    
    _initialiseGatewayProxy() {
        let BasicAuth = ExpressGatewayAppsProxyController.gatewayController._getBasicAuth();
        let GatewayConfig = ExpressGatewayAppsProxyController.gatewayController.config;

        if (this._oProxy != null) {
            this._oProxy.close();
            delete this._oProxy;
        }
        let oConfig = {
            target: GatewayConfig.port != null ? `${GatewayConfig.host}:${GatewayConfig.port}` : GatewayConfig.host,
            auth: BasicAuth,
            changeOrigin: true,
            protocolRewrite: this.config.Protocol
        }
        // TODO: Medium Check if missing agent leads to problems with different options
        // oConfig.agent = new HttpsProxyAgent(this._getAgentSettings(oConfig));
        oConfig = Object.assign(oConfig, this.config.proxySettings);
        delete oConfig._comment;
        this._oProxy = httpProxy.createProxyServer(oConfig);


        this._oProxy.on('error', function (err, req, res) {
            console.log(`APP Request error ${err.message}`);
        });
        
        this._oProxy.on('proxyRes', function (proxyRes, req, res) {
            console.log(`APP Request: ${req.url} Code: ${res.statusCode}-${res.statusMessage}`);
        });
    }

    /**
     * Registers the controller routes
     * @param {Express.Application} poExpressApp 
     */
    registerRoutes (poExpressApp) {
        super.registerRoutes(poExpressApp);
        // this.config.Routes.forEach((r) => {
        //     poExpressApp.use(r.LocalRoute, (req, res, next) => {
        //         req.originalUrl;
        //         r.GatewayRoute;
        //         console.log(`Test: ${req.originalUrl}`);
        //         return;
        //         this.proxy.web(req, res, next);
        //     })
        // });
    }
}
module.exports = ExpressGatewayAppsProxyController;