// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular/cli'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('@angular/cli/plugins/karma'),
      require('karma-jasmine-html-reporter'),      
      require('karma-coverage-istanbul-reporter'),
      require('karma-junit-reporter') 
    ],    
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    files: [{
      pattern: './client/test.ts',
      watched: false
    },
    { pattern: './client/assets/translate/*.json', watched: true, served: true, included: false }
  ],
    preprocessors: {
      './client/test.ts': ['@angular/cli']
    },
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    jasmineNodeOpts: {
      // If true, print colors to the terminal.
      showColors: true,
      // Default time to wait in ms before a test fails.
      defaultTimeoutInterval: 30000,
      // Function called to print jasmine results.
      print: function() {},
      // If set, only execute specs whose names match the pattern, which is
      // internally compiled to a RegExp.
      grep: 'pattern',
      // Inverts 'grep' matches
      invertGrep: false
    },
  reporters: config.angularCli && config.angularCli.codeCoverage
          ? ['progress', 'coverage-istanbul']
          : ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    captureTimeout:600000,
    browserDisconnectTimeout:10000,
    browserDisconnectTolerance:0,
    browserNoActivityTimeout:600000,
    junitReporter: {
      outputDir: 'test-reports', // results will be saved as $outputDir/$browserName.xml
      outputFile: 'junit-report.xml', // if included, results will be saved as $outputDir/$browserName/$outputFile
      suite: '', // suite will become the package name attribute in xml testsuite element
      useBrowserName: true, // add browser name to report and classes names
      nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
      classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
      properties: {} // key value pair of properties to add to the section of the report
  }
  });
};
