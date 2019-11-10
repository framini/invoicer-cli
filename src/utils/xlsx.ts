import XlsxPopulate from 'xlsx-populate';
import path from 'path';

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

export async function toXlsx(data: any) {
  // TODO: the route should be dynamic
  return XlsxPopulate.fromFileAsync(
    path.join(__dirname, '../../', 'templates', 'template.xlsx')
  ).then((workbook: any) => {
    const sheet = workbook.sheet('Invoice');

    const report = data.report.map((item: any) =>
      Object.keys(item).map(i => item[i])
    );

    sheet.cell('B8').value(report);

    sheet.cell('F5').value(data.payment_method);

    sheet.cell('I8').value(`${data.month}, ${data.year}`);

    // Total Salary
    // TODO: This should be conditional
    sheet.cell('H11').value(data.flatSalary);

    // Total hours
    // TODO: This should be conditional
    sheet.cell('H12').value(data.totalHours);

    return workbook.toFileAsync('./pepe.xlsx');
  });
}
