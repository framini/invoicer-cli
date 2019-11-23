import { Machine, assign, sendParent, spawn } from 'xstate';
import cuid from 'cuid';

import {
  harvestProviderMachine,
  createHarvestProvider
} from './harvest-provider.model';
import {
  createFixedRateProvider,
  fixedRateProviderMachine
} from './fixed-rate-provider.model';
import { BaseClient, FormFields } from '../types/types';

export type ClientState = {
  initializing: {};
  name: {};
  provider: {};
  providerFork: {};
  fixed_rate: {};
  harvest: {};
  review: {};
  complete: {};
};

export interface ClientSchema {
  states: ClientState;
}

export type ClientFormFields = FormFields<
  Pick<ClientState, 'name' | 'provider'>
>;

export type ClientContext = BaseClient & {
  // Map of top level fields
  fields: ClientFormFields;
  // Map of providers
  providers: any;
};

export type ClientEvent =
  | {
      type: 'CREATE_CLIENT.NEXT';
      key: keyof ClientContext;
      value: string;
    }
  | { type: 'CREATE_CLIENT.BACK' }
  | { type: 'CLIENT_PROVIDER.COMMIT' }
  | { type: 'CREATE_CLIENT.DISCARD' };

export const createClient = (
  c: BaseClient = { id: '', name: '', provider: '', providers: {} }
) => {
  const baseClient = {
    providers: {},
    ...c,
    id: c.id || cuid(),
    fields: {
      name: {
        label: 'Name',
        kind: 'input',
        value: 'name',
        required: true
      },
      provider: {
        label: 'Provider',
        values: [
          {
            label: 'Harvest',
            value: 'harvest'
          },
          {
            label: 'Fixed',
            value: 'fixed_rate'
          }
        ],
        kind: 'select-input',
        value: 'provider'
      },
      review: {
        kind: 'table',
        columns: [
          { label: 'Name', value: 'name' },
          { label: 'Provider', value: 'provider' },
          { label: 'Type of Contract', value: 'typeOfContract' },
          { label: 'Flat Salary', value: 'flatSalary' },
          { label: 'Hourly Rate', value: 'hourlyRate' },
          { label: 'Fixed Rate', value: 'fixedRate' },
          { label: 'Description', value: 'fixedRateDescription' },
          { label: 'Harvest (status)', value: 'harvest' }
        ]
      }
    }
  };

  if (c.providers && c.providers[c.provider]) {
    let ref;

    if (c.provider === 'harvest') {
      ref = spawn(harvestProviderMachine.withContext(c.providers[c.provider]));
    } else if (c.provider === 'fixed_rate') {
      ref = spawn(
        fixedRateProviderMachine.withContext(c.providers[c.provider])
      );
    } else {
      // we should probably throw in here.
    }

    return {
      ...baseClient,
      providers: {
        [c.provider]: {
          ...c.providers[c.provider],
          ref
        }
      }
    };
  }

  return baseClient;
};

export const clientMachine = Machine<ClientContext, ClientSchema, ClientEvent>(
  {
    id: 'client',
    initial: 'initializing',
    // Note: This whole context is gonna be overwritten by the parent
    // machine while spawning this one (through `createEmptyClient`)
    // so to avoid confusion we'll just ignore the TS error
    // @ts-ignore
    context: {},
    states: {
      initializing: {
        entry: 'initializer',
        on: {
          '': [
            {
              target: 'name'
            }
            // {
            //   target: 'home',
            //   cond: 'hasNotFinishedSetup'
            // },
            // {
            //   target: 'create-invoice',
            //   cond: 'home'
            // }
          ]
        }
      },
      name: {
        on: {
          'CREATE_CLIENT.NEXT': {
            target: 'provider',
            actions: ['updateContextKey']
          }
        }
      },
      provider: {
        on: {
          'CREATE_CLIENT.NEXT': {
            target: 'providerFork',
            actions: ['updateContextKey']
          }
        }
      },
      providerFork: {
        on: {
          '': [
            { target: 'fixed_rate', cond: 'isFixedRate' },
            { target: 'harvest', cond: 'isHarvest' }
          ]
        }
      },
      fixed_rate: {
        entry: 'initFixedRateProvider',
        on: {
          'CREATE_CLIENT.NEXT': {
            target: 'review',
            actions: ['updateProviderData']
          }
        }
      },
      harvest: {
        entry: 'initHarvestProvider',
        on: {
          'CREATE_CLIENT.NEXT': {
            target: 'review',
            actions: ['updateProviderData']
          }
        }
      },
      review: {
        on: {
          'CREATE_CLIENT.NEXT': [
            {
              target: 'complete',
              actions: ['sendClientCommit'],
              cond: 'isConfirmed'
            },
            {
              target: 'complete',
              actions: ['sendClientDiscard'],
              cond: 'isNotConfirmed'
            }
          ],
          'CREATE_CLIENT.BACK': 'name'
        }
      },
      complete: {
        type: 'final'
      }
    },
    on: {
      'CREATE_CLIENT.DISCARD': {
        actions: ['sendClientDiscard']
      }
    }
  },
  {
    actions: {
      initializer: () => {},
      updateContextKey: assign((ctx, event: any) => {
        return {
          [event.key]: event.value
        };
      }),
      updateProviderData: assign((ctx: any, event: any) => {
        return {
          [event.provider]: event.confirmed ? 'confirmed' : 'failed',
          // we'll get a copy to some of the provider's context values
          // into the client's top level for ease of access
          // Harvest Provider
          accountId: event.data.accountId,
          token: event.data.token,
          typeOfContract: event.data.typeOfContract,
          flatSalary: event.data.flat_salary,
          hourlyRate: event.data.hourly_rate,
          // Flat Rate provider
          fixedRate: event.data.rate,
          fixedRateDescription: event.data.description,
          // Update the local provider map with all the data from the
          // recently created provider
          providers: {
            ...ctx.providers,
            [event.provider]: {
              ...ctx.providers[event.provider],
              ...event.data
            }
          }
        };
      }),
      sendClientCommit: sendParent((ctx: ClientContext) => {
        return {
          type: 'CREATE_ENTITY.COMMIT',
          payload: {
            id: ctx.id,
            entity: 'clients',
            data: ctx
          }
        };
      }),
      sendClientDiscard: sendParent((ctx: ClientContext) => {
        // Heuristic for determining if we should remove the client
        // when the user exit the screen.
        const shouldRemove = !ctx.provider || !ctx.providers[ctx.provider];

        return {
          type: 'CREATE_ENTITY.DISCARD',
          payload: {
            id: ctx.id,
            entity: 'clients',
            shouldRemove
          }
        };
      }),
      initHarvestProvider: assign({
        providers: (ctx: any) => {
          const provider = createHarvestProvider(ctx.providers.harvest);

          return {
            ...ctx.providers,
            harvest: {
              ref: spawn(harvestProviderMachine.withContext(provider))
            }
          };
        }
      }),
      initFixedRateProvider: assign({
        providers: (ctx: any) => {
          const provider = createFixedRateProvider(ctx.providers.fixed_rate);

          return {
            ...ctx.providers,
            fixed_rate: {
              ref: spawn(fixedRateProviderMachine.withContext(provider))
            }
          };
        }
      })
    },
    guards: {
      isFixedRate: (ctx: ClientContext) => ctx.provider === 'fixed_rate',
      isHarvest: (ctx: ClientContext) => ctx.provider === 'harvest',
      isConfirmed: (ctx: any) => ctx[ctx.provider] === 'confirmed',
      isNotConfirmed: (ctx: any) => ctx[ctx.provider] === 'failed'
    }
  }
);
