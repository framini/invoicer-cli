# 🧾 Invoicer CLI
> Terminal assistant for generating invoices

## Overview
`Invoicer` is a command line tool to help you generate invoices by just following a small set of steps. Absolutely nothing will leave your computer so feel free to experiment with it. Meaning, everything you do stays local in your computer (within the [user config directory](https://github.com/sindresorhus/env-paths#pathsconfig)) and nothing is sent to the outside at any point.

## Features
- **Harvest report:** Connect to your `Harvest` account and fetch the hours report for a specific date.
- **Flat salary/Hourly rate**: Depending on your contract, you can pick among a couple of different options, including `Flat Salary` and `Hourly Rate`. If you are lucky and don't have to provide a detailed hours report you can also use `Fixed Rate`.

## Install

```bash
npx invoicer-cli
```

or

```bash
yarn global add invoicer-cli
```

> Exposes two global commands (the same), `inv` and `@framini/invoicer-cli`.

## Usage
There are a couple of requirements in order to be able to run the tool:
- **`template.xlsx`**: This is a normal Excel file that's gonna serve as the base template for the invoice. You can put anything you want in there, from formulas to custom styles. We'll keep everything as it is and *only* replace the parts you told us to. This file should exist at the root of the `process.cwd()` (Current Working Directory)
- **Template variables**: The part to be replaced within `template.xlsx` are placeholders we're gonna be replacing with the data for the specified month. Here's the list of supported variables:
  - `{{report}}`
  - `{{totalHours}}`
  - `{{hourlyRate}}`
  - `{{flatSalary}}`
  - `{{paymentMethod}}`
  - `{{month}}`
  - `{{year}}`

By placing any of the values above within your `template.xlsx` we'll take care of placing the right value when needed. If certain variables don't apply for a specific type of invoice we'll clean them up before generating the final file.

```
❯ inv
```

## Connecting with Harvest
In order to be able to connect with `Harvest` you'll have to create a `Personal Access Token` in [here](https://id.getharvest.com/developers). There are 2 pieces of interest, the `Account ID` and the `Token`, you'll need both. If your are interested in reading more info about it and why we need this: [link](https://help.getharvest.com/api-v2/authentication-api/authentication/authentication/#personal-access-tokens)

## License

MIT © [Francisco Ramini](https://github.com/framini)
