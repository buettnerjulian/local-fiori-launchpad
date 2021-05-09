module.exports = class RunConfiguration {

    constructor() {
        if(this.constructor._oInstance) return this.constructor._oInstance;
        this.constructor._oInstance = this;
    }

    /**
     * @typedef SpecialRoute
     * @property {string} path
     * @property {function} handler The function should be structured like a express middleware
     */

    /**
     * @typedef ServerConfig
     * @property {ExpressController[]} expressControllers
     * @property {SpecialRoute[]} specialRoutes
     */
    
    /**
     * Preloads data needed to start the controller
     * Note: Can be executed by multiple controllers simultaneously
     * @returns {ServerConfig}
     */
    loadConfig() {
    }
}