module.exports = function (starflow, config) {

  // API: https://github.com/silas/node-jenkins
  var JenkinsApi = require('jenkins');
  var _ = require('lodash');

  var url = config.URL;
  if (_.isEmpty(url)) {
    throw new Error('Jenkins url is mandatory');
  }

  var username = config.USERNAME;
  var password = config.PASSWORD;
  var token = new Buffer(username + ':' + password);

  return new JenkinsApi({
    baseUrl: url,
    headers: {
      'Authorization': 'Basic ' + token.toString('base64')
    },
    promisify: true
  });
  
};
