import { Machine, assign, spawn, send } from 'xstate';

import { clientMachine, createClient } from './client.model';
import { invoiceMachine, createInvoice } from './invoice.model';
import { baseInfoMachine, createBaseInfo } from './base-info.model';
import { Client } from '../types/types';
import { db } from '../utils/db';

// db.clear();

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
  text: string;
  id: TopLevelRoutesEvent['type'];
}

interface Clients {
  [id: string]: Client;
}

interface Invoices {
  [id: string]: any;
}

export interface TopLevelRoutesContext {
  navigated: string;
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
  | { type: 'BASE_INFO.SAVE'; payload: any };

export const topLevelRoutesMachine = Machine<
  TopLevelRoutesContext,
  TopLevelRoutesSchema,
  TopLevelRoutesEvent
>(
  {
    id: 'main-nav',
    initial: 'initializing',
    context: {
      // the user enter here by using the arrows
      // Values are event types, like 'TO_CREATE_CLIENT'
      navigated: '',
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
            target: 'home',
            actions: 'navigateTo'
          },
          TO_CREATE_INVOICE: {
            target: 'create-invoice',
            actions: 'navigateTo'
          },
          TO_CREATE_CLIENT: {
            target: 'create-client',
            actions: 'navigateTo'
          },
          SELECT: {
            actions: 'selectRoute'
          }
        }
      },
      home: {
        entry: 'onHomeEntry',
        on: {
          TO_CREATE_INVOICE: {
            target: 'create-invoice',
            actions: 'navigateTo'
          },
          TO_CREATE_CLIENT: {
            target: 'create-client',
            actions: 'navigateTo'
          },
          TO_BASE_INFO: {
            target: 'base-info',
            actions: 'navigateTo'
          },
          SELECT: {
            actions: 'selectRoute'
          }
        }
      },
      'create-invoice': {
        on: {
          TO_HOME: {
            target: 'home',
            actions: 'navigateTo'
          },
          TO_CREATE_CLIENT: {
            target: 'create-client',
            actions: 'navigateTo'
          },
          TO_BASE_INFO: {
            target: 'base-info',
            actions: 'navigateTo'
          },
          SELECT: {
            actions: ['selectRoute', 'createEmptyInvoice'],
            cond: ctx => ctx.finishedSetup
          }
        }
      },
      'create-client': {
        on: {
          // This should only happens during the initial setup. Right
          // after setting up the 'base-info' the user will get
          // redirected here
          '': [
            {
              cond: 'noClientsCreated',
              actions: 'createEmptyClient'
            }
          ],
          TO_CREATE_INVOICE: {
            target: 'create-invoice',
            actions: 'navigateTo'
          },
          TO_HOME: {
            target: 'home',
            actions: 'navigateTo'
          },
          TO_BASE_INFO: {
            target: 'base-info',
            actions: 'navigateTo'
          },
          SELECT: {
            actions: ['selectRoute', 'createEmptyClient']
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
      ]
    }
  },
  {
    actions: {
      onHomeEntry: assign(ctx => {
        if (ctx.finishedSetup) {
          return {
            menu: [
              {
                id: 'TO_CREATE_CLIENT',
                text: 'Create Client'
              },
              {
                id: 'TO_CREATE_INVOICE',
                text: 'Create Invoice'
              },
              {
                id: 'TO_BASE_INFO',
                text: 'Change Base Info'
              }
            ]
          };
        }

        // if the user hasn't finished the setup we'll show only the
        // option to create a client
        return {
          menu: [
            {
              id: 'TO_CREATE_CLIENT',
              text: 'Create Client'
            }
          ]
        };
      }),
      afterActionCompleted: assign({
        actionCompleted: '',
        activeId: '',
        selected: 'home',
        navigated: 'home'
      }),
      toBaseInfo: assign({
        selected: 'base-info',
        navigated: ''
      }),
      toCreateClient: assign({
        selected: 'create-client',
        navigated: 'TO_CREATE_CLIENT'
      }),
      toHome: assign({
        selected: 'home',
        navigated: 'TO_HOME'
      }),
      // used when navigating menu items using the arrow keys
      navigateTo: assign((ctx, event) => {
        return {
          navigated: event.type
        };
      }),
      // used when selecting one of the available menu items with the
      // `return` key
      selectRoute: assign((ctx, event) => {
        if (event.type === 'SELECT') {
          return {
            // @ts-ignore
            selected: event.value,
            menu: []
          };
        }

        return ctx;
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
          navigated: 'home'
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
          navigated: 'action-completed',
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
        ctx.baseInfo.lastname &&
        ctx.navigateTo === '',
      noClientsCreated: (ctx: any) => Object.keys(ctx.clients).length === 0,
    }
  }
);
