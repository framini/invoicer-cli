# 🧾 Invoicer CLI
> Terminal assistant for generating invoices

## Overview
`Invoicer` is a command line tool to help you generate invoices by just following a small set of steps. Absolutely nothing will leave your computer so feel free to experiment with it. Meaning, everything you do stays local in your computer (within the [user config directory](https://github.com/sindresorhus/env-paths#pathsconfig)) and nothing is sent to the outside at any point.

## Quick Start
1. Get the `Personal Access Token` and `Account ID` [from harvest](https://help.getharvest.com/api-v2/authentication-api/authentication/authentication/#personal-access-tokens).
1. Download [template.xlsx](template.xlsx) and place it on any folder you want. There's nothing special about this file, it just shows you how you could use the different template variables available.
1. Install the package: `npm install -g @framini/invoicer-cli`
1. From within that same folder, run: `inv`.
1. Follow the steps.

## Features
- **Harvest report:** Connect to your `Harvest` account and fetch the hours report for a specific date.
- **Flat salary/Hourly rate**: Depending on your contract, you can pick among a couple of different options, including `Flat Salary` and `Hourly Rate`. If you are lucky and don't have to provide a detailed hours report you can also use `Fixed Rate`.

## Install

```bash
npm install -g @framini/invoicer-cli
```

or

```bash
yarn global add @framini/invoicer-cli
```

> Exposes two global commands (the same), `inv` and `invv`.

## Usage
There are a couple of requirements in order to be able to run the tool:
- **`template.xlsx`**: This is a normal Excel file that's gonna serve as the base template for the invoice (you could see the example file [template.xlsx](template.xlsx) for some inspiration). You can put anything you want in there, from formulas to custom styles. We'll keep everything as it is and *only* replace the parts you told us to. This file should exist at the root of the `process.cwd()` (Current Working Directory)
- **Template variables**: The part to be replaced within `template.xlsx` are placeholders we're gonna be replacing with the data for the specified month. Here's the list of supported variables:
  - `{{fullName}}`
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

## Development

By running:

`yarn dev`

You'll get to expirement with the attached `template.xlsx` file.

## License

MIT © [Francisco Ramini](https://github.com/framini)
