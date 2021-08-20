const {Command, flags} = require('@oclif/command');
const { Copyleaks, CopyleaksFileSubmissionModel } = require('plagiarism-checker');
const fs = require('fs');
const dotenv = require('dotenv');

const dotenvconf = dotenv.config();
if (dotenvconf.error) {
  throw result.error;
}

const copyleaks = new Copyleaks();

class PlgchkCommand extends Command {
  static args = [
    {
      name: 'files',               // name of arg to show in help and reference with args[name]
      required: true,            // make the arg required with `required: true`
      description: 'input file(s)', // help description
      hidden: false,               // hide this arg from help
      // parse: input => 'output',   // instead of the user input, return a different value
      default: 'lib.rs',           // default value if no arg input
      // options: ['a', 'b'],        // only allow input to be from a discrete set
    },
    // {name: 'secondArg'},
  ]

  async run() {
    const {flags} = this.parse(PlgchkCommand)
    // const name = flags.name || 'world'
    // this.log(`hello ${name} from ./src/index.js`)

    // can get args as an object
    const {args} = this.parse(PlgchkCommand)
    console.log(`running my command with args: ${args.files}`)

    copyleaks.loginAsync(process.env.CL_EMAIL, process.env.CL_KEY)
    .then(loginResult => { 
      console.log("Logged in");
      return loginResult;
    }, err => {
      console.error("Error logging in");
      console.error(err);
    })
    .then(loginResult => {
      return copyleaks.getCreditsBalanceAsync('businesses', loginResult)
      .then(
        res => {
          console.log("Credits:", res)
          return loginResult;
        }, 
        err => {
          console.error("Error logging in");
          console.error(err);
        });
    })
    .then(loginResult => {
      var files = fs.readdirSync(".").filter(fn => fn.match(args.files));
      console.log({files});
      // console.log({loginResult});
      //TODO: Parse files to submit
      //TODO: Submit all files
      const fileContents = fs.readFileSync(args.files, {encoding: 'base64'});
      console.log(args.files + ".sh")
      // console.log({fileContents})
      var submission = new CopyleaksFileSubmissionModel(
        fileContents,
        args.files + ".sh",
        {
          sandbox: true,
          webhooks: {
            status: "https://script.google.com/macros/s/AKfycbxChMg4vXiHbZD_vwpfFbaNBpZ7ekjhTnhKpvkt0o7n38jJNfVo8X8szKgw7Iv9ty8WiA/exec"
          }
        }
      );
    
      copyleaks.submitFileAsync('businesses', loginResult, Date.now(), submission)
      .then(res => {
        console.log('submitFileAsync', res);
        console.log({submission});
      }, err => {
        console.error('submitFileAsync error', err);
        console.log({submission});
      });
    })
  }
}

PlgchkCommand.description = `Describe the command here
...
Extra documentation goes here
`

PlgchkCommand.flags = {
  name: flags.boolean({
    char: 'c',                    // shorter flag version
    description: 'Ignore comment lines', // help description for flag
    hidden: false,                // hide from help
    multiple: false,              // allow setting this flag multiple times
    // env: 'MY_NAME',               // default to value of environment variable
    // options: ['a', 'b'],          // only allow the value to be from a discrete set
    // parse: input => 'output',     // instead of the user input, return a different value
    default: false,             // default value if flag not passed (can be a function that returns a string or undefined)
    // required: false,              // make flag required (this is not common and you should probably use an argument instead)
    // dependsOn: ['extra-flag'],    // this flag requires another flag
    // exclusive: ['extra-flag'],    // this flag cannot be specified alongside this other flag
  }),
  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),
  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
  // name: flags.string({char: 'n', description: 'name to print'}),
}

module.exports = PlgchkCommand
