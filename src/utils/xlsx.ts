import XlsxPopulate from 'xlsx-populate';

export async function checkRequiredVariables(p: string, variables: string[]) {
  return new Promise((resolve, reject) => {
    XlsxPopulate.fromFileAsync(p).then((workbook: any) => {
      if (!workbook) reject('File not found!');

      const sheet = workbook.sheet(0);

      const missingVariables = variables.reduce(
        (reducer, key) => {
          const [a] = sheet.find(`{{${key}}}`);

          if (!a) {
            reducer.push(key);
          }

          return reducer;
        },
        [] as string[]
      );

      if (missingVariables.length > 0) {
        reject(
          `The following variables are missing in the xlsx template:\n ${missingVariables
            .map(k => `{{${k}}}`)
            .join(', ')}`
        );
      } else {
        resolve();
      }
    });
  });
}

const getCellFromVariable = ({
  sheet,
  variable
}: {
  sheet: any;
  variable: string;
}) => {
  const [cell] = sheet.find(`{{${variable}}}`);

  if (!cell) {
    return undefined
  }

  return `${cell.columnName()}${cell.rowNumber()}`;
};

export async function toXlsx({ templatePath, data, filenames }: any) {
  return XlsxPopulate.fromFileAsync(templatePath).then((workbook: any) => {
    const sheet = workbook.sheet(0);

    let hasSetDate = false;

    Object.keys(data).forEach(variable => {
      const cell = getCellFromVariable({ sheet, variable });

      if (!cell) return;

      if (variable === 'month' || variable === 'year') {
        if (!hasSetDate) {
          sheet.cell(cell).value(`${data.month}, ${data.year}`);
        }
      } else {
        sheet.cell(cell).value(data[variable]);
      }
    });

    return Promise.all(
      filenames.map((filename: string) => {
        return workbook.toFileAsync(`./${filename}.xlsx`);
      })
    );
  });
}
