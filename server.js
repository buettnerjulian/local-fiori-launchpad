var ExpressUi5Controller = require('./bin/express_ui5_controller');
var ExpressImportLibController = require('./bin/express_import_controller');
var ExpressGatewayController = require('./bin/express_gateway_controller');
const express = require("express");
const aControllers = [
    new ExpressImportLibController("/resources"),
    new ExpressUi5Controller(),
    new ExpressGatewayController()
]
// let oConfig = {
// // neoApp: require("./neo-app.json"),
// // destinations: require("./neo-dest.json")
// // here you can choose the exact UI5 version
// version: "1.52.28"
// };
// initialize environment variables
require("dotenv").config();
aControllers.forEach( c => c.loadData());
let app = express();
["appconfig", "apps"].forEach(function (sPath) {
app.use("/" + sPath, express.static(sPath));
});;
app.use('/test-resources', express.static('test-resources'));
app.get("/", async (req, res) => {
res.redirect('/test-resources/fioriSandbox.html');
});

aControllers.forEach( c => c.registerRoutes(app));
app.listen(process.env.PORT || 3000);