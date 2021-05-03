const fs = require('fs');

module.exports = class ExpressController {
    static get CONFIG_ROOT(){ return "config/"; }

    constructor(p) {
        if(this.constructor._oInstance) return this.constructor._oInstance;
        this.constructor._oInstance = this;
    }
    
    /**
     * Preloads data needed to start the controller
     * Note: Can be executed by multiple controllers simultaneously
     */
    loadData() {
        if(!fs.existsSync(ExpressController.CONFIG_ROOT)){
            fs.mkdirSync(ExpressController.CONFIG_ROOT);
        }
    }

    /**
     * Registers the controller routes
     * @param {e.Express} poExpressApp 
     */
    registerRoutes (poExpressApp) {
        this._oExpressApp = poExpressApp;
    }
}