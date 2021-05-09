const express = require("express");



class Server {

    static get Config() { return this._oConfig};
    static set Config(oConfig) { this._oConfig = oConfig};
    
    static get App() { return this._oApp};
    static set App(oApp) { this._oApp = oApp};

    static get Server() { return this._oServer};
    static set Server(oServer) { this._oServer = oServer};

    constructor(RunConfiguration) {
        if(this.constructor._oInstance) return this.constructor._oInstance;
        this.constructor._oInstance = this;
        this.RunConfig = RunConfiguration;
    }

    startup() {
        require("dotenv").config();
        this._executeBeforeStartup();

        this.Config.expressControllers.forEach( c => c.loadData());
        this.App = express();
        this.Config.expressControllers.forEach( c => c.registerRoutes(this.App));
        this.Config.specialRoutes.forEach( r => this.App.use(r.path, r.handler));
        this.Server = this.App.listen(process.env.PORT || 3000);
        this.Config.expressControllers.forEach(c => c.onServerListen(this.Server))
        this._executeAfterStartup();
    }

    _executeBeforeStartup() {
        this.Config = this.RunConfig.loadConfig();
    }
    _executeAfterStartup() {}

}

module.exports = Server;
