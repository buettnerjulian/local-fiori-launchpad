const url = require('url')
const fs = require('fs');
const httpProxy = require('http-proxy');
const HttpsProxyAgent = require("https-proxy-agent");
const ExpressController = require("./express_controller");

class GatewayExpressController extends ExpressController {
    /**
     * @typedef GatewayUser
     * @property {string} user
     * @property {string} password  
     */
    /**
     * @typedef GatewayConfig
     * @property {string} host
     * @property {number} [port]
     * @property {GatewayUser} [defaultUser]
     * @property {object} proxySettings Available options: https://www.npmjs.com/package/http-proxy#options
     */
    static get _sConfigPath() { return `${ExpressController.CONFIG_ROOT}gateway_controller.json`};
    constructor (...args){
        // TODO: Medium find a nice solution for the singleton pattern
        super(...args);
    }
    
    loadData () {
        super.loadData();
        if (!fs.existsSync(GatewayExpressController._sConfigPath)) {
            this._createDefaultConfigFile();
            console.error(`Added a clean config file for Gateway-Connections '${GatewayExpressController._sConfigPath}'. Please enter valid information before restarting the server.`);
            process.exit();
        }
        
        let sRawConfigData = fs.readFileSync(GatewayExpressController._sConfigPath);
        let oConfig = JSON.parse(sRawConfigData);
        let oGatewayConfig = oConfig.gatewayConnections.default;
        this.config = oGatewayConfig;
    }
    _defaultConfig() {
        return {
            "gatewayConnections": {
                "default": {
                    "host": "HOST",
                    "port": "PORT",
                    "defaultUser": {
                        "_comment": "It's optional to define a default user for the forwarded requests.",
                        "user": "USER",
                        "password": "PASSWORD"
                    },
                    "proxySettings": {
                        "_comment": "Available options: https://www.npmjs.com/package/http-proxy#options",
                        "secure": false
                    }
                }
            }
        }
    }
    _createDefaultConfigFile(){
        let oDefaultConfig = this._defaultConfig();
        fs.writeFileSync(GatewayExpressController._sConfigPath, JSON.stringify(oDefaultConfig, null, 4));
    }

    /**
     * @type {GatewayConfig}
     */
    set config(poConfig){
        this._oConfig = poConfig;
        this._initialiseProxy();
    } 
    /**
     * @type {GatewayConfig}
     */
    get config(){
        return this._oConfig;
    }

    get proxy(){
        return this._oProxy;
    }
    
    _initialiseProxy() {
        if (this._oProxy != null) {
            this._oProxy.close();
            delete this._oProxy;
        }
        let oConfig = {
            target: this.config.port != null ? `${this.config.host}:${this.config.port}` : this.config.host,
            auth: this._getBasicAuth(),
            changeOrigin: true
        }
        // TODO: Medium Check if missing agent leads to problems with different options
        // oConfig.agent = new HttpsProxyAgent(this._getAgentSettings(oConfig));
        oConfig = Object.assign(oConfig, this.config.proxySettings);
        delete oConfig._comment;
        this._oProxy = httpProxy.createProxyServer(oConfig);
    }
    _getAgentSettings(poConfig) {
        let oConfig = url.parse(poConfig.target);
        oConfig.auth = poConfig.auth != null ? poConfig.auth : null;
        return oConfig;
    }
    _getBasicAuth() {
        if (this.config.defaultUser != null) {
            return `${this.config.defaultUser.user}:${this.config.defaultUser.password}`;
        }
        return undefined;
    }
    /**
     * Registers the controller routes
     * @param {Express.Application} poExpressApp 
     */
    registerRoutes (poExpressApp) {
        super.registerRoutes(poExpressApp);
        poExpressApp.route("/sap/opu/odata/*$").all((req, res) => {
            this.proxy.web(req, res);
        });
        poExpressApp.route("/sap/opu/odata4/*$").all((req, res) => {
            this.proxy.web(req, res);
        });
        poExpressApp.route("/sap/bc/*$").all((req, res) => {
            this.proxy.web(req, res);
        });
        // TODO: Boulder: add possibility for defining custom routes
        poExpressApp.route("/cat*$").all((req, res) => {
            this.proxy.web(req, res);
        });
    }
}
module.exports = GatewayExpressController;