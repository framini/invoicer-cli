import cuid from 'cuid';
import { Machine, assign, sendParent, send } from 'xstate';
import {
  subMonths,
  format,
  isBefore,
  setDate,
  setMonth,
  getYear,
  getMonth
} from 'date-fns';

import { toXlsx, checkRequiredVariables } from '../utils/xlsx';
import * as config from '../config';
import { fileExists } from '../utils/fs';
import { FormFields } from '../types/types';

// Number of previous years to display while selecting the year for
// the invoice
const MAX_PREV_YEARS = 5;

// Number of days within a month to recommened the previous month as
// the default one for emitting an invoice.
// Example: any day until the 15 of Feb will default to Jan while any
// day after that will default to Feb
const MAX_DAYS_WITHIN_MONTH = 15;

type InvoiceMachineState = {
  client: {};
  payment: {};
  year: {};
  month: {};
  retry_month: {};
  calculating: {};
  format: {};
  retry_calculating: {};
  review: {};
  check_dependencies: {};
  retry_check_dependencies: {};
  generate: {};
  retry_generate: {};
  success: {};
  failure: {};
};

interface InvoiceMachineSchema {
  states: InvoiceMachineState;
}

export type InvoiceMachineEvents =
  | {
      type: 'INVOICE.NEXT';
    }
  | {
      type: 'PROVIDER.CALCULATE_SUCCESS';
    }
  | {
      type: 'PROVIDER.CALCULATE_FAILURE';
    }
  | {
      type: 'INVOICE.DISCARD';
    };

type InvoiceMachineFields = FormFields<
  Pick<
    InvoiceMachineState,
    | 'payment'
    | 'client'
    | 'month'
    | 'calculating'
    | 'check_dependencies'
    | 'review'
    | 'retry_month'
    | 'retry_generate'
    | 'retry_calculating'
    | 'retry_check_dependencies'
  >
>;

export interface InvoiceMachineContext {
  id: string;
  firstname: string;
  lastname: string;
  fields: InvoiceMachineFields;
}

export const createInvoice = () => {
  return {
    id: cuid(),
    fields: {
      payment: {
        label: 'Pick a Payment method',
        kind: 'select-input',
        values: [
          {
            label: 'PayPal',
            value: 'paypal'
          },
          {
            label: 'International Wire',
            value: 'international-wire'
          },
          {
            label: 'Domestic Wire',
            value: 'domestic-wire'
          },
          {
            label: 'Payonner',
            value: 'payonner'
          },
          {
            label: 'Transferwise',
            value: 'transferwise'
          }
        ]
      },
      client: {
        label: 'Pick a client to invoice',
        kind: 'select-input-dynamic',
        // This will look up for ctx.clients. It expects an object
        src: 'clients'
      },
      year: {
        label: 'Pick a year',
        kind: 'select-input-dynamic',
        src: 'available_years'
      },
      month: {
        label: 'Pick a month',
        values: [
          {
            label: 'January',
            value: '0'
          },
          {
            label: 'February',
            value: '1'
          },
          {
            label: 'March',
            value: '2'
          },
          {
            label: 'April',
            value: '3'
          },
          {
            label: 'May',
            value: '4'
          },
          {
            label: 'June',
            value: '5'
          },
          {
            label: 'July',
            value: '6'
          },
          {
            label: 'August',
            value: '7'
          },
          {
            label: 'September',
            value: '8'
          },
          {
            label: 'October',
            value: '9'
          },
          {
            label: 'November',
            value: '10'
          },
          {
            label: 'December',
            value: '11'
          }
        ],
        kind: 'select-input',
        defaultValue: 'recommended_month'
      },
      calculating: {
        kind: 'loading',
        label: 'Retrieving data'
      },
      check_dependencies: {
        kind: 'loading',
        label: 'Checking that all dependencies are in place'
      },
      review: {
        kind: 'table',
        label: 'Details',
        columns: [
          { label: 'Name', value: 'name' },
          { label: 'Provider', value: 'provider' },
          { label: 'Total Hours', value: 'formatted.totalHours' },
          { label: 'Month', value: 'formatted.month' },
          { label: 'Year', value: 'formatted.year' },
          { label: 'Payment Method', value: 'formatted.payment_method' },
          { label: 'Hourly Rate', value: 'formatted.hourlyRate' },
          { label: 'Flat Salary', value: 'formatted.flatSalary' },
          { label: 'Remote data', src: 'formatted.report' }
        ]
      },
      retry_generate: {
        label:
          'Something went wrong while generating the invoice. Do you want to retry?',
        values: [
          {
            label: 'Yes',
            value: 'yes'
          },
          {
            label: 'No',
            value: 'no'
          }
        ],
        kind: 'select-input'
      },
      retry_month: {
        label:
          'It seems that there are no entries for that period. Do you want to select another month?',
        values: [
          {
            label: 'Yes',
            value: 'yes'
          },
          {
            label: 'No',
            value: 'no'
          }
        ],
        kind: 'select-input'
      },
      retry_calculating: {
        label:
          'Something went wrong while making the math. Feeling lucky and want to retry?',
        values: [
          {
            label: 'Yes',
            value: 'yes'
          },
          {
            label: 'No',
            value: 'no'
          }
        ],
        kind: 'select-input'
      },
      retry_check_dependencies: {
        label: 'Missing dependencies. See the error below:',
        errorSrc: 'dependencies_error',
        values: [
          {
            label: 'Yes',
            value: 'yes'
          },
          {
            label: 'No',
            value: 'no'
          }
        ],
        kind: 'select-input'
      }
    }
  };
};

export const invoiceMachine = Machine<
  InvoiceMachineContext,
  InvoiceMachineSchema,
  InvoiceMachineEvents
>(
  {
    id: 'invoice',
    initial: 'client',
    // @ts-ignore
    context: {},
    states: {
      client: {
        on: {
          'INVOICE.NEXT': {
            target: 'payment',
            actions: ['updateContextKey', 'getClientToContext']
          }
        }
      },
      payment: {
        on: {
          'INVOICE.NEXT': {
            target: 'year',
            actions: ['updateContextKey']
          }
        }
      },
      year: {
        invoke: {
          src: 'getAvailableYears',
          onDone: {
            actions: 'updateAvailableYears'
          }
        },
        on: {
          'INVOICE.NEXT': {
            target: 'month',
            actions: ['updateContextKey']
          }
        }
      },
      month: {
        invoke: {
          src: 'getDefaultDate',
          onDone: {
            actions: 'updateRecommendedDate'
          }
        },
        on: {
          'INVOICE.NEXT': {
            target: 'calculating',
            actions: ['updateContextKey']
          }
        }
      },
      retry_month: {
        on: {
          'INVOICE.NEXT': [
            {
              target: 'month',
              cond: 'shouldRetry'
            },
            {
              target: 'failure',
              actions: 'sendInvoiceDiscard',
              cond: 'shouldAbortRetry'
            }
          ]
        }
      },
      calculating: {
        entry: ['sendProviderCalculateRequest'],
        on: {
          'PROVIDER.CALCULATE_SUCCESS': [
            {
              target: 'format',
              cond: 'readyToFormat',
              actions: ['onCalculateSuccess']
            },
            {
              target: 'retry_month',
              cond: 'noEntriesFound'
            }
          ],
          'PROVIDER.CALCULATE_FAILURE': {
            target: 'retry_calculating',
            actions: ['onCalculateFail']
          }
        }
      },
      format: {
        invoke: {
          src: 'formatEntries',
          onDone: {
            target: 'review',
            actions: 'onFormatSuccess'
          },
          onError: {
            target: 'retry_calculating',
            actions: 'onFormatFail'
          }
        }
      },
      retry_calculating: {
        on: {
          'INVOICE.NEXT': [
            {
              target: 'calculating',
              cond: 'shouldRetry'
            },
            {
              target: 'failure',
              actions: 'sendInvoiceDiscard',
              cond: 'shouldAbortRetry'
            }
          ]
        }
      },
      review: {
        on: {
          'INVOICE.NEXT': {
            target: 'check_dependencies'
          }
        }
      },
      check_dependencies: {
        invoke: {
          src: 'checkDependencies',
          onDone: {
            target: 'generate'
          },
          onError: {
            target: 'retry_check_dependencies',
            actions: ['onCheckDependenciesFail']
          }
        }
      },
      retry_check_dependencies: {
        on: {
          'INVOICE.NEXT': [
            {
              target: 'check_dependencies',
              cond: 'shouldRetry'
            },
            {
              target: 'failure',
              actions: 'sendInvoiceDiscard',
              cond: 'shouldAbortRetry'
            }
          ]
        }
      },
      generate: {
        invoke: {
          src: 'generateInvoice',
          onDone: {
            target: 'success',
            actions: 'createEntity'
          },
          onError: {
            target: 'retry_generate'
          }
        }
      },
      retry_generate: {
        on: {
          'INVOICE.NEXT': [
            {
              target: 'generate',
              cond: 'shouldRetry'
            },
            {
              target: 'failure',
              actions: 'sendInvoiceDiscard',
              cond: 'shouldAbortRetry'
            }
          ]
        }
      },
      success: {
        type: 'final'
      },
      failure: {
        type: 'final'
      }
    },
    on: {
      'INVOICE.DISCARD': {
        actions: ['sendInvoiceDiscard']
      }
    }
  },
  {
    actions: {
      updateContextKey: assign((ctx, event: any) => {
        return {
          [event.key]: event.value
        };
      }),
      getClientToContext: assign((ctx: any, event: any) => {
        const client = ctx.clients[event.value];

        // will basically move/copy some of the client's context value
        // to the top level context
        return {
          providerRef: client.providers[client.provider].ref,
          name: client.name,
          provider: client.provider,
          fixed_rate: client.fixed_rate
        };
      }),
      updateRecommendedDate: assign({
        recommended_month: (context: any, event: any) => event.data
      }),
      updateAvailableYears: assign({
        available_years: (context: any, event: any) => event.data
      }),
      updateEntries: assign({
        entries: (context: any, event: any) => event.data
      }),
      createEntity: sendParent((ctx: any) => {
        return {
          type: 'CREATE_ENTITY.COMMIT',
          payload: {
            id: ctx.id,
            entity: 'invoices',
            data: ctx
          }
        };
      }),
      sendProviderCalculateRequest: send(
        (ctx: any) => ({
          type: 'PROVIDER.CALCULATE',
          payload: { month: ctx.month, year: ctx.year }
        }),
        { to: ctx => ctx.providerRef }
      ),
      onFormatSuccess: assign({
        formatted: (ctx: any, event: any) => {
          return {
            ...event.data
          };
        }
      }),
      onFormatFail: assign({
        format_error: (context: any, event: any) => event.data
      }),
      onCalculateSuccess: assign({
        providerFormattedData: (context: any, event: any) => event.payload.data
      }),
      onCalculateFail: assign({
        calculate_error: (context: any, event: any) => event.data
      }),
      onCheckDependenciesFail: assign({
        dependencies_error: (context: any, event: any) => event.data
      }),
      sendInvoiceDiscard: sendParent((ctx: InvoiceMachineContext) => {
        // Heuristic for determining if we should remove the invoice
        // when the user exit the screen.
        // TODO: currently we don't support the option to edit
        // "Invoices" but if we ever plan to do it we'll have to
        // implement this const shouldRemove = <TBD>

        return {
          type: 'CREATE_ENTITY.DISCARD',
          payload: {
            id: ctx.id,
            entity: 'invoices'
          }
        };
      })
    },
    services: {
      getAvailableYears: async () => {
        const currentYear = getYear(new Date());

        return [...Array(MAX_PREV_YEARS).keys()].reduce((reducer, _, index) => {
          reducer.push({
            id: `${currentYear - index}`,
            name: `${currentYear - index}`
          });

          return reducer;
        }, [] as any);
      },
      getDefaultDate: async () => {
        const today = new Date();
        // we'll use the ${MAX_DAYS_WITHIN_MONTH}th of each month
        const limitWithinMonth = setDate(new Date(), MAX_DAYS_WITHIN_MONTH);

        let defaultMonth;

        // if `today` is within the limit of each month AND we're not
        // at the beginning of the year, we'll assume we're trying to invoice the
        // last month
        if (isBefore(today, limitWithinMonth) && getMonth(today) > 0) {
          defaultMonth = format(subMonths(today, 1), 'M');
        } else {
          defaultMonth = format(today, 'M');
        }

        const parsedMonth = parseInt(defaultMonth, 10);

        // Months are zero based index (from 0 to 11)
        return `${parsedMonth - 1}`;
      },
      formatEntries: async (ctx: any) => {
        const paymentMethodField = ctx.fields.payment.values.find(
          (f: any) => f.value === ctx.payment
        );

        const paymentMethod = paymentMethodField
          ? paymentMethodField.label
          : ctx.payment;

        const supportedVariables = config.app.variables.reduce((reducer, v) => {
          reducer[v.name] = undefined;

          return reducer;
        }, {} as Record<string, undefined>);

        // This is a convienent way for deleting unsued variables
        // within the xlx template since properties with `underfined`
        // as value will be removed from the template.
        const formattedData = {
          ...supportedVariables,
          ...ctx.providerFormattedData
        };

        return {
          ...formattedData,
          paymentMethod,
          month: format(setMonth(new Date(), ctx.month), 'MMMM'),
          year: ctx.year
        };
      },
      generateInvoice: async (ctx: any) => {
        // TODO: add support for adding custom file outputs
        const filename = `invoice-${ctx.formatted.month}-${ctx.baseInfo.firstname}-${ctx.baseInfo.lastname}`.toLocaleUpperCase();

        // we'll re-format `report` to the shape expected by the xlsx
        // generator. We can't do this before since we need the
        // original shape to preview the data in previous steps.
        const data = {
          ...ctx.formatted,
          fullName: `${ctx.baseInfo.firstname} ${ctx.baseInfo.lastname}`,
          report: ctx.formatted.report.map((item: any) =>
            Object.keys(item).map(i => item[i])
          )
        };

        return await toXlsx({
          templatePath: config.app.templatePath,
          filenames: [filename],
          data
        });
      },
      checkDependencies: async (ctx: any) => {
        const templateExists = await fileExists(config.app.templatePath);

        if (!templateExists) {
          return Promise.reject(
            'Missing "template.xlsx". This file is expected to exist in\nthe Current Working Directory'
          );
        }

        const keys = Object.keys(ctx.formatted)
          .filter(k => ctx.formatted[k])
          .filter(k => {
            const variable = config.app.variables.find(v => v.name === k);

            // This way we make sure we're only validating `required`
            // variables and any other, whether defined or non required
            // will be filtered out.
            if (variable && variable.required) {
              return true;
            }

            return false;
          });

        await checkRequiredVariables(config.app.templatePath, keys);

        return Promise.resolve();
      }
    },
    guards: {
      shouldAbortRetry: (ctx: InvoiceMachineContext, event: any) => {
        return event.value === 'no';
      },
      shouldRetry: (ctx: InvoiceMachineContext, event: any) => {
        return event.value === 'yes';
      },
      readyToFormat: (ctx: any, event: any) => {
        const data = event.payload?.data;

        if (data && (data.totalHours > 0 || Object.keys(data.report).length)) {
          return true;
        }

        return false;
      },
      // TODO: find if there's another way of doing this. we're pretty
      // much re-writing something because I can't negate a guard.
      noEntriesFound: (ctx: any, event: any) => {
        const data = event.payload?.data;

        if (data && Object.keys(data.report).length === 0) {
          return true;
        }

        return false;
      }
    }
  }
);
