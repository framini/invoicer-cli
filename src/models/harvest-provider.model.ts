import { Machine, assign, sendParent } from 'xstate';
import Decimal from 'decimal.js';
import { format, endOfMonth, getYear } from 'date-fns';

import { api } from '../utils/api';

const getTimeEntriesFromHarvest = async (
  {
    from,
    to,
    url,
    token,
    accountId
  }: {
    url?: string;
    from?: string;
    to?: string;
    token: string;
    accountId: string;
  },
  acc: any = []
): Promise<any> => {
  const target =
    url ||
    `https://api.harvestapp.com/api/v2/time_entries?from=${from}&to=${to}`;

  const { data } = await api({
    url: target,
    headers: {
      'Harvest-Account-ID': accountId,
      Authorization: `Bearer ${token}`
    }
  });

  if (data.links && data.links.next) {
    return await getTimeEntriesFromHarvest(
      {
        url: data.links.next,
        token,
        accountId
      },
      [...acc, ...data.time_entries]
    );
  }

  return [...acc, ...data.time_entries];
};

const defaultContext = {
  url: 'https://api.harvestapp.com/v2/users/me',
  accountId: '',
  token: '',
  fields: {
    accountId: {
      label: 'Account ID',
      kind: 'input'
    },
    token: {
      label: 'Token',
      kind: 'input'
    },
    typeOfContract: {
      label: 'Specify the type of arrangement/contract with this client',
      values: [
        {
          label: 'Flat Salary',
          value: 'flat_salary'
        },
        {
          label: 'Hourly Rate',
          value: 'hourly_rate'
        }
      ],
      kind: 'select-input'
    },
    flat_salary: {
      label: 'Enter flat salary',
      kind: 'input'
    },
    hourly_rate: {
      label: 'Enter hourly rate',
      kind: 'input'
    },
    retry: {
      label: 'Invalid token/Account it. Do you want to re-enter them?',
      values: [
        {
          label: 'Yes',
          value: 'accountId'
        },
        {
          label: 'No',
          value: 'failure'
        }
      ],
      kind: 'select-input'
    }
  }
};

export const createHarvestProvider = (provider = {}) => {
  // @ts-ignore
  const { ref, ...restProvider } = provider;

  return {
    ...defaultContext,
    ...restProvider
  };
};

export const harvestProviderMachine = Machine<any, any, any>(
  {
    id: 'harvest-provider',
    initial: 'idle',
    context: {},
    states: {
      idle: {
        on: {
          '': [
            {
              target: 'accountId',
              cond: 'isEmptyProvider'
            }
          ]
        }
      },
      accountId: {
        on: {
          'CLIENT_PROVIDER.NEXT': {
            target: 'token',
            actions: ['updateContextKey']
          }
        }
      },
      token: {
        on: {
          'CLIENT_PROVIDER.NEXT': {
            target: 'typeOfContract',
            actions: ['updateContextKey']
          }
        }
      },
      typeOfContract: {
        on: {
          'CLIENT_PROVIDER.NEXT': [
            {
              target: 'flat_salary',
              cond: 'isFlatSalary',
              actions: 'updateContextKey'
            },
            {
              target: 'hourly_rate',
              cond: 'isHourlyRate',
              actions: 'updateContextKey'
            }
          ]
        }
      },
      flat_salary: {
        on: {
          'CLIENT_PROVIDER.NEXT': {
            target: 'loading',
            actions: ['updateContextKey']
          }
        }
      },
      hourly_rate: {
        on: {
          'CLIENT_PROVIDER.NEXT': {
            target: 'loading',
            actions: ['updateContextKey']
          }
        }
      },
      loading: {
        invoke: {
          src: 'validateClient',
          onDone: {
            target: 'success',
            actions: ['onValidateSuccess']
          },
          onError: {
            target: 'retry',
            actions: 'onValidateFail'
          }
        }
      },
      retry: {
        on: {
          'CLIENT_PROVIDER.NEXT': [
            {
              target: 'accountId',
              cond: 'shouldRetry'
            },
            {
              target: 'failure',
              cond: 'shouldAbortRetry'
            }
          ]
        }
      },
      calculate: {
        invoke: {
          src: 'getEntries',
          onDone: {
            actions: ['updateEntries'],
            target: 'format'
          },
          onError: {
            actions: ['onCalculateFail']
          }
        }
      },
      format: {
        invoke: {
          src: 'formatEntries',
          onDone: {
            actions: ['onCalculateSuccess'],
            target: 'idle'
          },
          onError: {
            // Note: we might need a different action but unsure we do for now.
            actions: ['onCalculateFail']
          }
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
      'PROVIDER.CALCULATE': {
        target: 'calculate'
      }
    }
  },
  {
    actions: {
      updateEntries: assign({
        entries: (ctx: any, event: any) => event.data
      }),
      updateContextKey: assign((ctx, event: any) => {
        return {
          [event.key]: event.value
        };
      }),
      onValidateSuccess: assign({
        user_data: (context: any, event: any) => event.data
      }),
      onValidateFail: assign({
        error: (context: any, event: any) => event.data
      }),
      onCalculateSuccess: sendParent((ctx: any, event: any) => {
        return {
          type: 'TOP_LEVEL.PROVIDER.CALCULATE_SUCCESS',
          payload: {
            data: event.data
          }
        };
      }),
      onCalculateFail: sendParent((ctx: any, event: any) => {
        return {
          type: 'TOP_LEVEL.PROVIDER.CALCULATE_FAILURE',
          payload: event.data
        };
      })
    },
    services: {
      validateClient: (ctx: any, event: any) => {
        return api({
          url: ctx.url,
          headers: {
            'Harvest-Account-ID': ctx.accountId,
            Authorization: `Bearer ${ctx.token}`
          }
        }).then(r => r.data);
      },
      getEntries: async (ctx: any, event: any) => {
        const { payload } = event;

        const from = format(
          new Date(getYear(new Date()), payload.date),
          'yyyy-MM-dd'
        );
        const to = format(
          endOfMonth(new Date(getYear(new Date()), payload.date, 1)),
          'yyyy-MM-dd'
        );

        const data = await getTimeEntriesFromHarvest({
          from,
          to,
          token: ctx.token,
          accountId: ctx.accountId
        });

        const final = data.reduce(
          (reducer: any, b: any) => {
            if (!reducer[b.client.name]) {
              reducer[b.client.name] = 0;
            }

            const month = new Date(b.spent_date).getMonth();

            if (month == payload.date) {
              reducer[b.client.name] += new Decimal(b.hours)
                .mul(60)
                .toNearest(6, Decimal.ROUND_UP)
                .dividedBy(60)
                .toNumber();
            }

            return reducer;
          },
          {} as any
        );

        return Object.keys(final).reduce(
          (reducer, key) => {
            reducer[key] = new Decimal(final[key])
              .toSignificantDigits(4, Decimal.ROUND_HALF_UP)
              .toNumber();

            return reducer;
          },
          {} as any
        );
      },
      formatEntries: async (ctx: any) => {
        const totalHours = Object.keys(ctx.entries).reduce(
          (reducer, projectName) => {
            return reducer + parseFloat(ctx.entries[projectName]);
          },
          0
        );

        const hourlyRate =
          ctx.typeOfContract === 'flat_salary'
            ? parseFloat(ctx.flat_salary) / totalHours
            : ctx.hourly_rate;

        const flatSalary =
          ctx.typeOfContract === 'flat_salary' ? ctx.flat_salary : undefined;

        const formattedEntries = Object.keys(ctx.entries).map(projectName => {
          return {
            'Project Name': projectName,
            'Hourly Rate': hourlyRate,
            Hours: parseFloat(ctx.entries[projectName]), // hours
            'Amount US$': hourlyRate * parseFloat(ctx.entries[projectName]) // $ amount = rate * hours,
          };
        });

        // we'll only include `totalHours` for `flat_salary` since for
        // `hourly_rate` we don't need to fill in that field
        const totalHoursProp = ctx.typeOfContract === 'flat_salary' ? {
          totalHours
        } : {}

        return {
          ...totalHoursProp,
          report: formattedEntries,
          hourlyRate,
          flatSalary
        };
      }
    },
    guards: {
      isFlatSalary: (ctx: any, event: any) => {
        return event.value === 'flat_salary';
      },
      isHourlyRate: (ctx: any, event: any) => {
        return event.value === 'hourly_rate';
      },
      shouldAbortRetry: (ctx: any, event: any) => {
        return event.value === 'failure';
      },
      shouldRetry: (ctx: any, event: any) => {
        return event.value === 'accountId';
      },
      isEmptyProvider: (ctx: any) => {
        // should be enough to check that `accountId` doesn't exist to
        // know that we're dealing with an empty provider
        return !ctx.accountId;
      }
    }
  }
);
