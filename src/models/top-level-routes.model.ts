import { Machine, assign, spawn, send } from 'xstate';

import { clientMachine, createClient } from './client.model';
import { invoiceMachine, createInvoice } from './invoice.model';
import { baseInfoMachine, createBaseInfo } from './base-info.model';
import { Client } from '../types/types';
import { db } from '../utils/db';

type TopLevelRoutesState = {
  initializing: {};
  'base-info': {};
  home: {};
  'create-client': {};
  'create-invoice': {};
  'action-completed': {};
};

export interface TopLevelRoutesSchema {
  states: TopLevelRoutesState;
}

interface MenuItem {
  label: string;
  id: TopLevelRoutesEvent['type'];
  value: keyof TopLevelRoutesState;
}

interface Clients {
  [id: string]: Client;
}

interface Invoices {
  [id: string]: any;
}

export interface TopLevelRoutesContext {
  selected: string;
  finishedSetup: boolean;
  menu: MenuItem[];
  clients: Clients;
  invoices: Invoices;
  activeId: string;
  actionCompleted: string;
  baseInfo: any;
}

export type TopLevelRoutesEvent =
  | { type: 'TO_HOME' }
  | { type: 'TO_CREATE_INVOICE' }
  | { type: 'TO_CREATE_CLIENT' }
  | { type: 'TO_BASE_INFO' }
  | { type: 'SELECT'; payload: any }
  | { type: 'CREATE_ENTITY.COMMIT'; payload: any }
  | { type: 'CREATE_ENTITY.DISCARD'; payload: any }
  | { type: 'TOP_LEVEL.PROVIDER.CALCULATE_SUCCESS'; payload: any }
  | { type: 'TOP_LEVEL.PROVIDER.CALCULATE_FAILURE'; payload: any }
  | { type: 'BASE_INFO.SAVE'; payload: any }
  | { type: 'BASE_INFO.DISCARD' }
  | { type: 'TOP_LEVEL.GO_TO'; payload: any };

export const topLevelRoutesMachine = Machine<
  TopLevelRoutesContext,
  TopLevelRoutesSchema,
  TopLevelRoutesEvent
>(
  {
    id: 'main-nav',
    initial: 'initializing',
    context: {
      // when the user selectes one of the sections using 'enter'
      // Values are machine states. Like 'create-client'
      selected: 'home',
      // for our purpose that is: the user has created at least one
      // client
      finishedSetup: false,
      // top level menu items.
      menu: [],
      // Map of created clients
      clients: {},
      // Map of created invoices
      invoices: {},
      // will be used for CRUD entities
      activeId: '',
      // used for showing a confirmed message after creating an entity
      actionCompleted: '',
      // basic info about the user like firstname, lastname, etc
      baseInfo: {}
    },
    states: {
      initializing: {
        entry: 'initializer',
        on: {
          '': [
            {
              target: 'home',
              cond: 'hasFinishedSetup'
            },
            {
              target: 'base-info',
              cond: 'needBaseInfo',
              actions: ['toBaseInfo', 'createEmptyBaseInfo']
            },
            {
              target: 'create-client',
              cond: 'noClientsCreated',
              actions: ['toCreateClient']
            }
          ]
        }
      },
      'base-info': {
        on: {
          '': [
            {
              target: 'home',
              cond: 'isInitialProcess'
            }
          ],
          TO_HOME: {
            target: 'home'
          },
          TO_CREATE_INVOICE: {
            target: 'create-invoice'
          },
          TO_CREATE_CLIENT: {
            target: 'create-client'
          },
        }
      },
      home: {
        entry: 'onHomeEntry',
        on: {
          TO_CREATE_INVOICE: {
            target: 'create-invoice'
          },
          TO_CREATE_CLIENT: {
            target: 'create-client'
          },
          TO_BASE_INFO: {
            target: 'base-info'
          },
        }
      },
      'create-invoice': {
        onEntry: 'createEmptyInvoice',
        on: {
          TO_HOME: {
            target: 'home'
          },
          TO_CREATE_CLIENT: {
            target: 'create-client'
          },
          TO_BASE_INFO: {
            target: 'base-info'
          }
        }
      },
      'create-client': {
        onEntry: 'createEmptyClient',
        on: {
          TO_CREATE_INVOICE: {
            target: 'create-invoice'
          },
          TO_HOME: {
            target: 'home'
          },
          TO_BASE_INFO: {
            target: 'base-info'
          }
        }
      },
      'action-completed': {
        on: {
          TO_HOME: {
            target: 'home',
            actions: ['afterActionCompleted']
          }
        }
      }
    },
    on: {
      'CREATE_ENTITY.DISCARD': {
        actions: 'discardEntity'
      },
      'CREATE_ENTITY.COMMIT': {
        actions: 'commitEntity',
        target: 'action-completed'
      },
      'TOP_LEVEL.PROVIDER.CALCULATE_SUCCESS': {
        actions: 'onCalculateSuccess'
      },
      'TOP_LEVEL.PROVIDER.CALCULATE_FAILURE': {
        actions: ['onCalculateFail']
      },
      'BASE_INFO.SAVE': [
        {
          actions: ['saveBaseInfo', 'toCreateClient'],
          target: 'create-client',
          cond: 'noClientsCreated'
        },
        {
          actions: ['saveBaseInfo', 'toHome', send('TO_HOME')],
          target: 'home',
          cond: 'hasFinishedSetup'
        }
      ],
      'BASE_INFO.DISCARD': {
        actions: ['toHome', send('TO_HOME')],
        target: 'home',
      },
      'TOP_LEVEL.GO_TO': {
        actions: ['sendNavigateTo', 'trackSelectedRoute']
      },
    }
  },
  {
    actions: {
      onHomeEntry: assign(ctx => {
        if (ctx.finishedSetup) {
          return {
            menu: [
              {
                value: 'create-invoice',
                label: 'Create Invoice',
                id: 'TO_CREATE_INVOICE'
              },
              {
                value: 'create-client',
                label: 'Create Client',
                id: 'TO_CREATE_CLIENT'
              },
              {
                value: 'base-info',
                label: 'Change Base Info',
                id: 'TO_BASE_INFO'
              }
            ]
          };
        }

        // if the user hasn't finished the setup we'll show only the
        // option to create a client
        return {
          menu: [
            {
              value: 'create-client',
              label: 'Create Client',
              id: 'TO_CREATE_CLIENT'
            }
          ]
        };
      }),
      afterActionCompleted: assign({
        actionCompleted: '',
        activeId: '',
        selected: 'home'
      }),
      toBaseInfo: assign({
        selected: 'base-info'
      }),
      toCreateClient: assign({
        selected: 'create-client'
      }),
      toHome: assign({
        selected: 'home'
      }),
      sendNavigateTo: send((ctx: any, event: any) => {
        return {
          type: event.id
        };
      }),
      trackSelectedRoute: assign({
        selected: (ctx: any, event: any) => event.value
      }),
      // used for setting up the user's basic info like firstname,
      // lastname, etc
      createEmptyBaseInfo: assign((ctx: TopLevelRoutesContext) => {
        if (ctx.baseInfo && ctx.baseInfo.ref) {
          return {};
        }

        const bi = createBaseInfo();

        return {
          baseInfo: {
            ...bi,
            ref: spawn(baseInfoMachine.withContext(bi))
          }
        };
      }),
      // used when selecting `Create Client` option. this will create
      // an `clientMachine` using `spawn`, which will let us
      // connect the 2 machine through the usage of `sendParent`
      createEmptyClient: assign((ctx: TopLevelRoutesContext) => {
        if (ctx.activeId) return {};

        const c = createClient();

        return {
          activeId: c.id,
          clients: {
            ...ctx.clients,
            [c.id]: {
              ...c,
              ref: spawn(clientMachine.withContext(c))
            }
          }
        };
      }),
      createEmptyInvoice: assign((ctx: TopLevelRoutesContext) => {
        const invoice = createInvoice();

        return {
          activeId: invoice.id,
          invoices: {
            ...ctx.invoices,
            [invoice.id]: {
              ...invoice,
              ref: spawn(
                invoiceMachine.withContext({
                  ...invoice,
                  clients: ctx.clients,
                  baseInfo: ctx.baseInfo
                })
              )
            }
          }
        };
      }),
      // Used during the init process. We'll create a new client
      // machine for every loaded record
      // @ts-ignore
      initializer: assign({
        clients: (ctx: TopLevelRoutesContext, event: TopLevelRoutesEvent) => {
          return Object.keys(ctx.clients).reduce(
            (reducer, c) => {
              const client = createClient(ctx.clients[c]);

              reducer[client.id] = {
                ...client,
                ref: spawn(clientMachine.withContext(client))
              };

              return reducer;
            },
            {} as Clients
          );
        },
        baseInfo: (ctx: TopLevelRoutesContext, event: TopLevelRoutesEvent) => {
          const bi = createBaseInfo(ctx.baseInfo);

          return {
            ...ctx.baseInfo,
            ref: spawn(baseInfoMachine.withContext(bi))
          };
        }
      }),
      // used when aborting a create process (client or invoice)
      discardEntity: assign((ctx, event) => {
        if (event.type !== 'CREATE_ENTITY.DISCARD') return {};

        const commonUpdates = {
          activeId: '',
          selected: 'home',
        };

        return {
          ...commonUpdates,
          [event.payload.entity]: Object.keys(
            // @ts-ignore
            ctx[event.payload.entity]
          ).reduce(
            (reducer, key) => {
              if (key !== event.payload.id) {
                // @ts-ignore
                reducer[key] = ctx[event.payload.entity][key];
              }

              return reducer;
            },
            {} as Clients
          )
        };
      }),
      // used for confirming the creation of an entity (client or invoice)
      commitEntity: assign((ctx, event) => {
        if (event.type !== 'CREATE_ENTITY.COMMIT') return {};

        const commonUpdates = {
          selected: 'action-completed',
          // we'll use this to show a "confirm" message
          actionCompleted: event.payload.entity,
          // the moment the user created an entity we'll cosider the
          // setup process finished
          finishedSetup: true
        };

        // The reason we need to create the client again is to set the
        // proper parent-child relationship when spawning machines.
        // This way top-level will always be the parent. Also, this is
        // the type of relationship we have when bootstraping the
        // content from the local store
        const c = createClient(event.payload.data);

        const updates = {
          ...commonUpdates,
          // for now `entity` could be `clients` or `providers`
          [event.payload.entity]: {
            // @ts-ignore
            ...ctx[event.payload.entity],
            [event.payload.id]: {
              // @ts-ignore
              ...ctx[event.payload.entity][event.payload.id],
              ...c
            }
          }
        };

        db.set(updates);

        return updates;
      }),
      saveBaseInfo: assign((ctx, event: any) => {
        const bi = createBaseInfo(event.payload);

        db.set({
          baseInfo: bi
        });

        return {
          baseInfo: {
            ...bi,
            ref: spawn(baseInfoMachine.withContext(bi))
          }
        };
      }),
      onCalculateSuccess: send(
        (ctx: any, event: any) =>
          ({
            type: 'PROVIDER.CALCULATE_SUCCESS',
            payload: event.payload
          } as any),
        {
          to: (ctx: any) => {
            return ctx.invoices[ctx.activeId].ref;
          }
        }
      ),
      onCalculateFail: send(
        (ctx: any, event: any) =>
          ({
            type: 'PROVIDER.CALCULATE_FAILURE',
            payload: event.payload
          } as any),
        {
          to: (ctx: any) => {
            return ctx.invoices[ctx.activeId].ref;
          }
        }
      )
    },
    guards: {
      hasFinishedSetup: (ctx: any) =>
        ctx.baseInfo &&
        ctx.baseInfo.firstname &&
        ctx.baseInfo.lastname &&
        Object.keys(ctx.clients).length > 0,
      needBaseInfo: (ctx: any) =>
        !ctx.baseInfo || !ctx.baseInfo.firstname || !ctx.baseInfo.lastname,
      isInitialProcess: (ctx: any) =>
        ctx.baseInfo &&
        ctx.baseInfo.firstname &&
        ctx.baseInfo.lastname,
      noClientsCreated: (ctx: any) => Object.keys(ctx.clients).length === 0
    }
  }
);
