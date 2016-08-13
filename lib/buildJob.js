module.exports = function (starflow, jenkinsService) {

  function BuildJob() {
    starflow.BaseExecutable.call(this, 'jenkins.buildJob');
  }

  BuildJob.prototype = Object.create(starflow.BaseExecutable.prototype);
  BuildJob.prototype.constructor = BuildJob;

  BuildJob.prototype.exec = function exec(jobName, params) {
    return jenkinsService.job.build({
        name: jobName,
        parameters: params
      })
      .then(function (buildId) {
        starflow.logger.success('Job built successfully: ' + buildId);
        this.storage.set('build.id', buildId);
      }.bind(this), function (err) {
        starflow.logger.error('Could not build the job');
        throw err;
      });

  };

  return function () {
    return new BuildJob();
  };

};
