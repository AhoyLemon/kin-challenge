# Kin OCR

This project is a technical exercise for Kin Insurance, simulating an OCR (Optical Character Recognition) system for processing insurance documents. It includes features for file upload, CSV parsing, data validation, and error handling.

[![Angular](https://img.shields.io/badge/-Angular-313131?style=flat&logo=angular&logoColor=fff&labelColor=ce18ac)](https://angular.dev)
&nbsp;
[![Karma](https://img.shields.io/badge/K-Karma-313131?style=flat&logo=karma&logoColor=fff&labelColor=1AB394)](https://karma-runner.github.io/) &nbsp;
[![Jasmine](https://img.shields.io/badge/-Jasmine-313131?style=flat&logo=jasmine&logoColor=fff&labelColor=8A4182)](https://jasmine.github.io/) &nbsp;
[![TypeScript](https://img.shields.io/badge/-TypeScript-313131?style=flat&logo=typescript&logoColor=fff&labelColor=3178C6)](https://www.typescriptlang.org/) &nbsp;
[![Sass](https://img.shields.io/badge/-Sass-313131?style=flat&logo=sass&logoColor=fff&labelColor=CC6699)](https://sass-lang.com/)

## To Install

```bash
npm install
```

## To Run Locally

```bash
npm run start
```

## To Run Tests

```bash
npm run test
```

This will run all the tests defined in the `*.spec.ts` files. Individual tests are documented within those files.

### Testing with other browsers

Mainly as an experiment, I wanted to set up Karma to work with other Chromium-based browsers as well, so you can run tests in Brave or Vivaldi using `npm run test:brave` or `npm run test:vivaldi`. However, you'll have to make sure you have those browsers installed, and you'll need to set the correct path to the browser executable in the `package.json` scripts.

### Manual Testing

You can also manually test the application by uploading CSV files through the UI. Sample test files are located in the `test-files` directory.
