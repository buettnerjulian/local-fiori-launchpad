const path = require('path')
const fs = require('fs');
const express = require('express');
const ExpressController = require("./express_controller");
const {searchInDir} = require('./utils/fs_utils');

class LibImportExpressController extends ExpressController {

    constructor (psLibsBaseRoute, ...args){
        // TODO: Medium find a nice solution for the singleton pattern
        super(...args);
        this._sLibBaseRoute = psLibsBaseRoute;
        this._aLibs = null;
    }
    /**
     * Transforms the namepspace to an valid uri
     * @param {string} sLibNamespace 
     */
    _mapNamespaceToUrl(sLibNamespace) {
        let sLibUriPath = sLibNamespace.replace(/\./gi, '/');
        return `${this._sLibBaseRoute}/${sLibUriPath}`;
    }
    /**
     * @typedef LibraryInfo
     * @property {string} namespace
     * @property {string} path
     */
    /**
     * @return {LibraryInfo[]} Map of library paths with the namepace as key
     */
    _getValidLibsWithNamespaces() {
        let aInfos = [];
        let sLibsPath = `${__dirname}/../libs`;
        if(fs.existsSync(sLibsPath)) {
            let aLibs = fs.readdirSync(sLibsPath, {withFileTypes: true});
            aLibs.forEach(oLib => {
                if (oLib.isDirectory()) {
                    let sLibPath = `${sLibsPath}/${oLib.name}`;
                    
                    let sLibFilePath = searchInDir(sLibPath, `${path.sep}library.js`);
                    sLibFilePath = sLibFilePath !== "" ? sLibFilePath : searchInDir(sLibPath,  `${path.sep}Component.js`);
                    
                    if (sLibFilePath !== "") sLibPath = path.dirname(sLibFilePath);
                    
                    if ( sLibFilePath !== "" && fs.existsSync(sLibFilePath) 
                            && fs.existsSync(`${sLibPath}/manifest.json`)) {
                        let sRawManifestData = fs.readFileSync(`${sLibPath}/manifest.json`);
                        let oManifest = JSON.parse(sRawManifestData);
                        let sLibNamespace = oManifest["sap.app"]["id"];
                        aInfos.push({namespace: sLibNamespace, path: sLibPath});
                    }
                }       
            });
        }
        return aInfos;
    }
    loadData () {
        this._loadLibs();
    }
    _loadLibs() {
        let aInfos = this._getValidLibsWithNamespaces();
        aInfos.map((oInfo) => {
            oInfo.middleware = express.static(oInfo.path);
            oInfo.route = this._mapNamespaceToUrl(oInfo.namespace)
            return oInfo;
        })
        this._aLibs = aInfos;
    }
    /**
     * @typedef LibraryInfoExtended
     * @property {string} namespace
     * @property {string} path
     * @property {function} middleware
     * @property {string} route
     */
    /**
     * @return {LibraryInfoExtended[]} Map of library paths with the namepace as key
     */
    getLibs() {
        return this._aLibs;
    }
    /**
     * Registers the controller routes
     * @param {Express.Application} poExpressApp 
     */
    registerRoutes (poExpressApp) {
        super.registerRoutes(poExpressApp);
        poExpressApp.use(this._sLibBaseRoute, (req, res, next) => {
            let aLib = this.getLibs().slice();
            let fnMiddlewareNext = function (err) {
                if(err == null && aLib.length > 0){
                    let oLib = aLib.pop();
                    if (req.originalUrl.startsWith(oLib.route)){
                        req.url = req.originalUrl.replace(oLib.route, "")
                        oLib.middleware(req, res, fnMiddlewareNext);
                    } else {
                        fnMiddlewareNext();
                    }
                } else {
                    next(err);
                }
            }
            fnMiddlewareNext();
        });
    }
}
module.exports = LibImportExpressController;