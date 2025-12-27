// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [require("karma-jasmine"), require("karma-chrome-launcher"), require("@angular-devkit/build-angular/plugins/karma")],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    files: [{ pattern: "test-files/**/*.csv", included: false, served: true, watched: false }],
    browsers: ["Chrome", "BraveHeadless", "VivaldiHeadless"],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"],
      },
      BraveHeadless: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"],
      },
      VivaldiHeadless: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"],
      },
    },
    singleRun: true,
  });
};
