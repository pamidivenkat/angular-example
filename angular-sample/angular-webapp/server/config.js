var fs = require('fs');
//var storage = require('azure-storage');

/**
* Reads the configurations.
* @ignore
*
* @return {Object}
*/
function readConfig() {
  var config = JSON.parse(fs.readFileSync('./server/app.config', 'utf8'));
//   if (config.useDevelopmentStorage) {
//     config.connectionString = storage.generateDevelopmentStorageCredentials();
//   }
  return config;
}

module.exports = readConfig();