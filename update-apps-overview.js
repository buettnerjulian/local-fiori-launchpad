var fs = require("fs");
var path = require('path');
var appsDir = "./apps";
var manifestRelPath = "webapp/manifest.json";
var configPath = "appconfig/fioriSandboxConfig.json";
var updateForce = false;

function getAppsFolders() {
    return fs.readdirSync(appsDir).map(function (name) {return path.join(appsDir, name);});
}

function getAppId(appFolder){
    var manifest = path.join(appFolder, manifestRelPath);
    if (fs.existsSync(manifest)){
        var str = fs.readFileSync(manifest);
        var conf = JSON.parse(str);
        return conf["sap.app"]["id"];
    } else {
        console.log(appFolder + " manifest not found.")
    }
    return "";
}

function createAppConfig(appFolder){
    var name = path.basename(appFolder);
    return {
        "semanticObject": name.replaceAll('-',''),
        "action": "display",
        "resolutionResult": {
            "applicationType": "SAPUI5",
            "additionalInformation": "SAPUI5.Component=" + getAppId(appFolder),
            "url": "/apps/" + name + "/webapp"
        },
        "signature": {
             "parameters": {},
              "additionalParameters": "allowed"
        }
    }
}

function createTileConfig(appFolder) {
    var name = path.basename(appFolder);
    return {
        "id": name,
        "size": "1x1",
        "tileType": "sap.ushell.ui.tile.StaticTile",
        "properties": {
            "chipId": "catalogTile_" + name,
            "title": name,
            "targetURL": "#" + name.replaceAll('-','') + "-display"
        }
    }
}

function readConfig() {
    var str = fs.readFileSync(configPath);
    return JSON.parse(str);
    return null;
}

function saveConfig(config) {
    var str = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, str);
}

function configContainsApp(config, appName){
    return config["services"]["ClientSideTargetResolution"]["adapter"]["config"]["inbounds"].hasOwnProperty(appName);
}

function addTileConfig(config, appName, tileConfig){
    return config["services"]["LaunchPage"]["adapter"]["config"]["groups"][0]["tiles"].push(tileConfig);
}

function addAppConfig(config, appName, appConfig){
    return config["services"]["ClientSideTargetResolution"]["adapter"]["config"]["inbounds"][appName] = appConfig;
}


function main(){
    var apps = getAppsFolders();
    var conf = readConfig();
    apps.forEach(app => {
        var name = path.basename(app);
        if (configContainsApp(conf, name) && !updateForce) return;
        // Adjust config
        var appConfig = createAppConfig(app);
        addAppConfig(conf, name, appConfig);
        var tileConfig = createTileConfig(app);
        addTileConfig(conf, name, tileConfig);
    });
    saveConfig(conf);
}

main();