import { Machine, assign, sendParent } from 'xstate';

import { FormFields } from '../types/types';

type BaseMachineState = {
  firstname: {};
  lastname: {};
  review: {};
  success: {};
};

interface BaseMachineSchema {
  states: BaseMachineState;
}

export type BaseMachineEvents =
  | {
      type: 'BASE_INFO.NEXT';
      payload: any;
    }
  | {
      type: 'BASE_INFO.LOCAL_DISCARD';
    };

type BaseInfoFormFields = FormFields<
  Pick<BaseMachineState, 'firstname' | 'lastname' | 'review'>
>;

export interface BaseMachineContext {
  firstname: string;
  lastname: string;
  fields: BaseInfoFormFields;
}

const defaultContext: BaseMachineContext = {
  firstname: '',
  lastname: '',
  fields: {
    firstname: {
      label: 'First Name',
      kind: 'input',
      value: 'firstname',
      required: true
    },
    lastname: {
      label: 'Last Name',
      kind: 'input',
      value: 'lastname',
      required: true
    },
    review: {
      label: 'Review',
      kind: 'table',
      columns: [
        { label: 'First Name', value: 'firstname' },
        { label: 'Last Name', value: 'lastname' }
      ]
    }
  }
};

export const createBaseInfo = (initialState?: BaseMachineContext) => {
  return {
    ...defaultContext,
    ...initialState
  };
};

export const baseInfoMachine = Machine<
  BaseMachineContext,
  BaseMachineSchema,
  BaseMachineEvents
>(
  {
    id: 'base-info',
    initial: 'firstname',
    states: {
      firstname: {
        on: {
          'BASE_INFO.NEXT': {
            target: 'lastname',
            actions: ['updateContextKey'],
          }
        }
      },
      lastname: {
        on: {
          'BASE_INFO.NEXT': {
            target: 'review',
            actions: ['updateContextKey']
          }
        }
      },
      review: {
        on: {
          'BASE_INFO.NEXT': {
            target: 'success',
            actions: ['saveBaseInfo']
          }
        }
      },
      success: {
        type: 'final'
      }
    },
    on: {
      'BASE_INFO.LOCAL_DISCARD': {
        actions: 'discard'
      }
    }
  },
  {
    actions: {
      discard: sendParent(
        // @ts-ignore
        (ctx: BaseMachineContext, event: BaseMachineEvents) => {
          return {
            type: 'BASE_INFO.DISCARD',
          };
        }
      ),
      updateContextKey: assign((ctx, event: any) => {
        return {
          [event.key]: event.value
        };
      }),
      saveBaseInfo: sendParent(
        // @ts-ignore
        (ctx: BaseMachineContext, event: BaseMachineEvents) => {
          return {
            type: 'BASE_INFO.SAVE',
            payload: {
              firstname: ctx.firstname,
              lastname: ctx.lastname
            }
          };
        }
      )
    }
  }
);
