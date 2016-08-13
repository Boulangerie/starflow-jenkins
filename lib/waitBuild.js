module.exports = function (starflow, config, jenkinsService) {

  var _ = require('lodash');
  var Promise = require('bluebird');
  var getBuildFactory = require('./getBuild')(starflow, jenkinsService);
  var Task = starflow.Task;

  function WaitBuild() {
    starflow.BaseExecutable.call(this, 'jenkins.waitBuild');
    this.retries = 0;
    this.intervalId = null;
    this.timeoutId = null;
  }

  WaitBuild.prototype = Object.create(starflow.BaseExecutable.prototype);
  WaitBuild.prototype.constructor = WaitBuild;

  WaitBuild.prototype.startMaxTimer = function startMaxTimer() {
    this.timeoutId = setTimeout(function () {
      this.stopTimer();
    }.bind(this), config.MAX_TIMEOUT * 1000);
  };

  WaitBuild.prototype.stopTimer = function stopTimer() {
    if (!_.isNull(this.intervalId)) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    if (!_.isNull(this.timeoutId)) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  };

  WaitBuild.prototype.retry = function retry(buildNumber, reason, reject) {
    this.retries++;
    if (this.retries >= config.MAX_RETRIES) {
      this.stopTimer();
      reject();
      starflow.logger.error('Could not get status of build #' + buildNumber + ': ' + reason);
    } else {
      starflow.logger.debug('Number of retries for build #' + buildNumber + ': ' + this.retries);
    }
  };

  WaitBuild.prototype.iteration = function iteration(jobName, buildNumber, delayInSeconds, resolve, reject) {
    var getBuildFactoryExec = this.createExecutable(getBuildFactory);
    var task = new Task(getBuildFactoryExec, [jobName, buildNumber]);
    task
      .run()
      .then(function () {
        var build = getBuildFactoryExec.storage.get('build');
        if (_.isUndefined(build)) {
          this.intervalId = setTimeout(this.iteration.bind(this), delayInSeconds * 1000);
          this.retry(buildNumber, 'Build not saved in the storage', reject);
        }
        else if (!_.isNull(build.result)) {
          this.stopTimer();
          this.storage.set('build', build);
          starflow.logger.success('Build #' + buildNumber + ' ended with status "' + build.result + '"');
          resolve();
        }
        else {
          this.intervalId = setTimeout(this.iteration.bind(this), delayInSeconds * 1000);
        }
      }.bind(this))
      .catch(function (err) {
        this.intervalId = setTimeout(this.iteration.bind(this), delayInSeconds * 1000);
        this.retry(buildNumber, err, reject);
      }.bind(this));
  };

  WaitBuild.prototype.exec = function exec(jobName, buildNumber, delayInSeconds) {
    if (!_.isNumber(delayInSeconds)) {
      delayInSeconds = config.DEFAULT_DELAY;
    }
    this.retries = 0;
    this.startMaxTimer();
    return new Promise(function (resolve, reject) {
      this.iteration(jobName, buildNumber, delayInSeconds, resolve, reject);
    }.bind(this));
  };

  return function () {
    return new WaitBuild();
  };
  
};
