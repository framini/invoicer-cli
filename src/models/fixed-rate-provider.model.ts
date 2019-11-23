import { Machine, assign, sendParent } from 'xstate';

import { FormFields } from '../types/types';

type FixedRateProviderState = {
  idle: {};
  rate: {};
  description: {};
  format: {};
  success: {};
};

interface FixedRateProviderSchema {
  states: FixedRateProviderState;
}

type FixedRateProviderFormFields = FormFields<
  Pick<FixedRateProviderState, 'rate' | 'description'>
>;

interface FixedRateProviderContext {
  fields: FixedRateProviderFormFields;
}

type FixedRateProviderEvents =
  | {
      type: 'CLIENT_PROVIDER.NEXT';
    }
  | {
      type: 'PROVIDER.CALCULATE';
    };

const defaultContext = {
  rate: '',
  description: '',
  fields: {
    rate: {
      label: 'Total amount',
      kind: 'input',
      value: 'rate'
    },
    description: {
      label: 'Description',
      kind: 'input',
      value: 'description'
    }
  }
};

export const createFixedRateProvider = (provider = {}) => {
  // @ts-ignore
  const { ref, ...restProvider } = provider;

  return {
    ...defaultContext,
    ...restProvider
  };
};

export const fixedRateProviderMachine = Machine<
  FixedRateProviderContext,
  FixedRateProviderSchema,
  FixedRateProviderEvents
>(
  {
    id: 'fixed-rate-provider',
    initial: 'idle',
    // @ts-ignore
    context: {},
    states: {
      idle: {
        on: {
          '': [
            {
              target: 'rate'
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
          report: [
            {
              'Project Name': ctx.description,
              'Hourly Rate': '',
              Hours: '',
              'Amount US$': parseFloat(ctx.rate)
            }
          ]
        };
      }
    }
  }
);
