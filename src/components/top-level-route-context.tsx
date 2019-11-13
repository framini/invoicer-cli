import React from 'react';
import { useMachine } from '@xstate/react';

import { topLevelRoutesMachine } from '../models/top-level-routes.model';
import { db } from '../utils/db';

const dbData = db.store;

export const TopLevelRouteContext = React.createContext({});
TopLevelRouteContext.displayName = 'TopLevelRouteContext';

export const TopLevelRouteController = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [state, send] = useMachine(
    topLevelRoutesMachine.withContext({
      activeId: '',
      clients: {},
      finishedSetup: false,
      invoices: {},
      menu: [],
      ...dbData,
      selected: 'home',
    })
  );

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
