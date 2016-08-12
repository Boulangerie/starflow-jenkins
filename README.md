# starflow-jenkins [![Build Status](https://travis-ci.org/Boulangerie/starflow-jenkins.svg?branch=master)](https://travis-ci.org/Boulangerie/starflow-jenkins)

## Prerequisites

In order to use this plugin, your project must have [starflow](http://github.com/boulangerie/starflow) as a dependency.

## Install

```
$ npm install --save-dev starflow-jenkins
```

## Usage

Using a workflow:

```js
var starflow = require('starflow');

var steps = [
  {'jenkins.getBuild': ['my-super-job', 42]}
];

var workflow = new starflow.Workflow(steps);
return workflow
  .addPlugin(require('starflow-jenkins'))
  .run();
```

In an executable:

```js
module.exports = function (starflow) {
  var getBuildFactory = require('starflow-jenkins')(starflow).factories.getBuild;

  function MyExecutable() {
    starflow.BaseExecutable.call(this, 'myPlugin.myExecutable');
  }
  MyExecutable.prototype = Object.create(starflow.BaseExecutable.prototype);
  MyExecutable.prototype.constructor = MyExecutable;

  MyExecutable.prototype.exec = function exec() {
    var getBuildExecutable = this.createExecutable(getBuildFactory);
    return new starflow.Task(getBuildExecutable, ['my-super-job', 42])
      .run()
      .then(function () {
        var buildResponse = this.storage.get('jenkins.getBuild/build');
        starflow.logger.log('Got the following build: ' + buildResponse);
      }.bind(this));
  };

  return function () {
    return new MyExecutable();
  };
};
```

## Executables

Thereafter is the list of all the executable classes provided by this plugin.

> **Important** The titles indicate the name that can be used when writing the steps of a workflow.

### jenkins.getBuild

Given a job name and a build number, gets all the data about the build.

Usage:
```js
// for a workflow
var buildId = 42;
var steps = [
  {'jenkins.getBuild': ['job-name', buildId]}
];

// in an executable
var getBuildFactory = require('starflow-jenkins')(starflow).factories.getBuild;
var getBuildExecutable = this.createExecutable(getBuildFactory);
var buildId = 42;

var myTask = new starflow.Task(getBuildExecutable, ['job-name', buildId]);
```

### jenkins.buildJob

Given a job name, triggers a new build on that job.

Usage:
```js
// for a workflow
var someParams = {}; // see https://github.com/silas/node-jenkins#jenkinsjobbuildoptions-callback
var steps = [
  {'jenkins.buildJob': ['job-name', someParams]}
];

// in an executable
var someParams = {};
var buildJobFactory = require('starflow-jenkins')(starflow).factories.buildJob;
var buildJobExecutable = this.createExecutable(buildJobFactory);

var myTask = new starflow.Task(buildJobExecutable, ['job-name', someParams]);
```

### jenkins.waitBuild

Given a job name and a build ID, waits for the build to finish before completion.

Usage:
```js
// for a workflow
var buildId = 42;
var delayInSeconds = 30; // check build status every 30 seconds
var steps = [
  {'jenkins.waitBuild': ['job-name', buildId, delayInSeconds]}
];

// in an executable
var buildId = 42;
var delayInSeconds = 30;
var waitBuildFactory = require('starflow-jenkins')(starflow).factories.waitBuild;
var waitBuildExecutable = this.createExecutable(waitBuildFactory);

var myTask = new starflow.Task(waitBuildExecutable, ['job-name', buildId, delayInSeconds]);
```

## Config

Some behaviors of this plugin depend on the values of config variables, here's the list of them and their effect.

- **URL** (no default value) URL to the Jenkins server.
- **USERNAME** (no default value) Username to access the server.
- **PASSWORD** (no default value) Password to access the server.
- **DEFAULT_DELAY** (default value: `30`) Delay (in seconds) at which the `waitBuild` executable checks the build status.
- **MAX_RETRIES** (default value: `10`) Number of retries before exiting the `waitBuild` executable (if an error occurs).
- **MAX_TIMEOUT** (default value: `18000`) Delay (in seconds) at which the `waitBuild` executable will complete no matter the build status. 

You can set these config variable from several ways:

- Env variables on your machine.
  
  Example (assuming `index.js` contains your workflow that uses the _jenkins_ executables):
  
  ```
  $ starflow_jenkins__DEFAULT_DELAY=10 starflow_jenkins_MAX_TIMEOUT=300 node index.js 
  ```

- `.starflowrc` file at the root of your project.

  Example:

  ```json
  {
    "jenkins": {
      "DEFAULT_DELAY": 10,
      "MAX_TIMEOUT": 300
    }
  }
  ```

Internally, Starflow uses the [rc module](https://github.com/dominictarr/rc) to handle the config values.

## Storage

Some of the executables of this plugin store some values in their storage.

### jenkins.getBuild

- **build** Contains the build data (the response) from the Jenkins server.

  Example:

  ```js
  var starflow = require('starflow');

  var steps = [
    {'jenkins.getBuild': ['job-name', 42]},
    {'custom.echo': '{{/jenkins.getBuild/build.id}}'} // displays 42
  ];

  var workflow = new starflow.Workflow(steps);
  return workflow
    .addPlugin(require('starflow-jenkins'))
    .addPlugin(require('starflow-custom')) // plugin that contains the 'echo' executable
    .run();
  ```

### jenkins.buildJob

- **build.id** Contains the ID of the build triggered on the specified job.

  Example:

  ```js
  var starflow = require('starflow');

  var steps = [
    {'jenkins.buildJob': 'job-name'},
    {'custom.echo': '{{/jenkins.buildJob/build.id}}'} // e.g. displays 123
  ];

  var workflow = new starflow.Workflow(steps);
  return workflow
    .addPlugin(require('starflow-jenkins'))
    .addPlugin(require('starflow-custom')) // plugin that contains the 'echo' executable
    .run();
  ```

### jenkins.waitBuild

- **build** Contains the "observed" build data.

  Example:

  ```js
  var starflow = require('starflow');

  var steps = [
    {'jenkins.waitBuild': ['job-name', 42]},
    {'custom.echo': '{{/jenkins.waitBuild/build.status}}'} // e.g. displays SUCCESS
  ];

  var workflow = new starflow.Workflow(steps);
  return workflow
    .addPlugin(require('starflow-jenkins'))
    .addPlugin(require('starflow-custom')) // plugin that contains the 'echo' executable
    .run();
  ```

> **Note:** learn more about storage paths on the [Starflow documentation page](http://github.com/boulangerie/starflow/blob/master/docs/API.md#path-format).

If you want to contribute, please take the time to update this README file with the new executables/API brought by your contribution. Thank you! :heart:
