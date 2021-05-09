const yargs = require('yargs');

const Server = require("./bin/server");
const SinglePageConfig = require("./bin/run_single_page_configuration");
const LaunchpadConfig = require("./bin/run_launchpad_configuration");

yargs.scriptName("server")
  .usage('$0 <cmd> [args]')
  .command('launchpad', 'Runs the Lauchpad', (yargs) => {}, function (argv) {
    new Server(new LaunchpadConfig()).startup();
  })
  .alias("launchpad", "lp")
  .command('single-page', 'Runs one app as single page application', (yargs) => {
      SinglePageConfig.YARGS_COMMAND_PARAMS.forEach(param => {
        yargs.option(param.name, {
            type: param.type,
            demandOption: param.required,
            describe: param.description
          })
      });
  }, function (argv) {
    new Server(new SinglePageConfig(argv)).startup();
  })
  .alias("launchpad", "sp")
  .help()
  .argv
