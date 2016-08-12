module.exports = function (starflow) {

  var config = {
    URL: starflow.config.get('jenkins.URL'),
    USERNAME: starflow.config.get('jenkins.USERNAME'),
    PASSWORD: starflow.config.get('jenkins.PASSWORD'),
    DEFAULT_DELAY: parseInt(starflow.config.get('jenkins.DEFAULT_DELAY', 30), 10),
    MAX_RETRIES: parseInt(starflow.config.get('jenkins.MAX_RETRIES', 10), 10),
    MAX_TIMEOUT: parseInt(starflow.config.get('jenkins.MAX_TIMEOUT', 18000), 10)
  };

  var jenkinsService = require('./lib/jenkinsService')(starflow, config);

  return {
    service: jenkinsService,
    factories: {
      getBuild: require('./lib/getBuild')(starflow, jenkinsService),
      waitBuild: require('./lib/waitBuild')(starflow, config, jenkinsService),
      buildJob: require('./lib/buildJob')(starflow, jenkinsService)
    }
  };

};
