module.exports = function (starflow, jenkinsService) {

  function GetBuild() {
    starflow.BaseExecutable.call(this, 'jenkins.getBuild');
  }

  GetBuild.prototype = Object.create(starflow.BaseExecutable.prototype);
  GetBuild.prototype.constructor = GetBuild;

  GetBuild.prototype.exec = function exec(jobName, buildNumber) {
    return jenkinsService.build.get(jobName, buildNumber)
      .then(function (data) {
        starflow.logger.success('Build information of #' + buildNumber + ' got successfully');
        this.storage.set('build', data);
      }.bind(this), function (err) {
        starflow.logger.error('Could not get build information');
        throw err;
      });
  };

  return function () {
    return new GetBuild();
  };
  
};
