import React, { useContext } from 'react';
import {
  State,
  SingleOrArray,
  EventObject,
} from 'xstate';

interface RouteProps {
  children: React.ReactNode;
  section: string;
}

interface BaseRouterContext {
  selected: string;
}

export const useRouter = <
  TContext extends BaseRouterContext,
  TSchema,
  TEvent extends EventObject
>(
  context: React.Context<any>
): {
  state: State<TContext, TEvent>;
  send: (
    event: SingleOrArray<any>,
    payload?:
      | (Record<string, any> & {
          type?: undefined;
        })
      | undefined
  ) => State<TContext, TEvent>;
  Route: (props: RouteProps) => JSX.Element | null;
} => {
  const { state, send } = useContext(context);

  const Route = (props: RouteProps): JSX.Element | null => {
    if (state.context.selected === props.section) {
      return <>{props.children}</>;
    }

    return null;
  };

  return { state, send, Route };
};
