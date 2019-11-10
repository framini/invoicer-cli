import { Machine, assign, sendParent } from 'xstate';

const defaultContext = {
  rate: '',
  description: '',
  fields: {
    rate: {
      label: 'Total amount',
      kind: 'input'
    },
    description: {
      label: 'Description',
      kind: 'input'
    },
    review: {
      kind: 'table',
      columns: [
        { label: 'Total amount', value: 'rate' },
        { label: 'Description', value: 'description' }
      ]
    }
  }
};

export const createFixedRateProvider = (provider = {}) => {
  return {
    ...defaultContext,
    ...provider
  };
};

export const fixedRateProviderMachine = Machine<any, any, any>(
  {
    id: 'fixed-rate-provider',
    initial: 'idle',
    context: {},
    states: {
      idle: {
        on: {
          '': [
            {
              target: 'rate',
              // cond: 'isEmptyProvider'
            }
          ]
        }
      },
      rate: {
        on: {
          'CLIENT_PROVIDER.NEXT': {
            target: 'description',
            actions: ['updateContextKey']
          }
        }
      },
      description: {
        on: {
          'CLIENT_PROVIDER.NEXT': {
            target: 'success',
            actions: ['updateContextKey']
          }
        }
      },
      format: {
        invoke: {
          src: 'formatEntries',
          onDone: {
            actions: ['onCalculateSuccess'],
            target: 'idle'
          }
        }
      },
      success: {
        type: 'final'
      }
    },
    on: {
      'PROVIDER.CALCULATE': {
        target: 'format'
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
      onCalculateSuccess: sendParent((ctx: any, event: any) => {
        return {
          type: 'TOP_LEVEL.PROVIDER.CALCULATE_SUCCESS',
          payload: {
            data: event.data
          }
        };
      })
    },
    guards: {
      isEmptyProvider: (ctx: any) => ctx.rate === ''
    },
    services: {
      formatEntries: async (ctx: any) => {
        return {
          report: [{
            'Project Name': ctx.description,
            'Hourly Rate': '',
            Hours: '',
            'Amount US$': parseFloat(ctx.rate),
          }]
        };
      }
    }
  }
);
