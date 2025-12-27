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

Mainly as an experiment, I wanted to set up Karma to work with other Chromium-based browsers as well, so you can run tests in Brave using `npm run test:brave` However, you'll have to make sure you have the appropriate browser installed, and you'll need to set the correct path to the browser executable in the `package.json` scripts.

### Manual Testing

You can also manually test the application by uploading CSV files through the UI. Sample test files are located in the `test-files` directory. Descriptions below..

| File Name              | Description                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checksum-invalid.csv` | All policy numbers will fail the checksum validation.                                                                                                   |
| `checksum-mixed.csv`   | A mix of valid and invalid policy numbers based on checksum validation.                                                                                 |
| `checksum-valid.csv`   | All policy numbers will pass the checksum validation.                                                                                                   |
| `error-badfile.csv`    | Actually a misnamed .json file. Will fail the character validation.                                                                                     |
| `error-empty.csv`      | An empty CSV file. Will trigger the empty file error handling.                                                                                          |
| `error-filetoobig.csv` | A CSV file that exceeds the size limit. Will trigger the file size error handling.                                                                      |
| `error-filetype.xml`   | Technically possible for the user to do if they really try hard. This file will be rejected because it isn't a csv, won't even be validated beyond that |
| `fifty.csv`            | A CSV file with 50 policy numbers (mix of valid and invalid) to demo bigger tables                                                                      |
