import React from 'react';
import { useMachine } from '@xstate/react';

import { topLevelRoutesMachine, TopLevelRoutesEvent, TopLevelRoutesContext } from '../models/top-level-routes.model';
import { db } from '../utils/db';
import { State } from 'xstate';

const dbData = db.store;
const machine = topLevelRoutesMachine.withContext({
  activeId: '',
  clients: {},
  finishedSetup: false,
  invoices: {},
  menu: [],
  ...dbData,
  selected: 'home'
});

export const TopLevelRouteContext = React.createContext<{
  state: State<TopLevelRoutesContext, TopLevelRoutesEvent>,
  send: (e: TopLevelRoutesEvent) => {}
}>({} as any);
TopLevelRouteContext.displayName = 'TopLevelRouteContext';

export const TopLevelRouteController = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [state, send] = useMachine(machine);

  return (
    <TopLevelRouteContext.Provider
      value={{
        state,
        send
      }}
    >
      {children}
    </TopLevelRouteContext.Provider>
  );
};
