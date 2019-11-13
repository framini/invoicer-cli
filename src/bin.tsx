#!/usr/bin/env node

import React from 'react';
import { render, Box } from 'ink';

import { useRouter } from './hooks/use-router';
import {
  TopLevelRouteController,
  TopLevelRouteContext
} from './components/top-level-route-context';
import { Stepper, Step, StepDivider } from './components/step';
import { CreateClientScreen } from './screens/create-client.screen';
import { CreateInvoiceScreen } from './screens/create-invoice.screen';
import { ActionCompleted } from './screens/action-completed.screen';
import { HomeScreen } from './screens/home.screen';
import { BaseInfoScreen } from './screens/base-info.screen';
import {
  TopLevelRoutesContext,
  TopLevelRoutesSchema,
  TopLevelRoutesEvent
} from './models/top-level-routes.model';
import { useKeyboardNav } from './hooks/use-keyboard-nav';
import { Divider } from './components/divider';

const App = () => {
  const { state, send, Route } = useRouter<
    TopLevelRoutesContext,
    TopLevelRoutesSchema,
    TopLevelRoutesEvent
  >(TopLevelRouteContext);

  const onActionConfirm = React.useCallback(() => {
    send('TO_HOME');
  }, []);

  useKeyboardNav();

  const noClientsCreated = Object.keys(state.context.clients).every(cId => {
    const c = state.context.clients[cId];

    return !c.name || !c.provider;
  });

  const isInitialSetup =
    state.context.baseInfo?.firstname &&
    state.context.baseInfo?.lastname &&
    noClientsCreated;

  return (
    <>
      {!state.context.finishedSetup && (
        <Stepper>
          <Box
            flexDirection="column"
            alignItems="center"
            width={20}
            paddingTop={1}
          >
            <Divider width={10} title={`Steps`} titleColor="cyan" />
            <Box flexDirection="row">
              <Step
                value={1}
                condition={
                  !state.context.baseInfo?.firstname ||
                  !state.context.baseInfo?.lastname
                }
              />
              <StepDivider />
              <Step value={2} condition={noClientsCreated} />
            </Box>
          </Box>
        </Stepper>
      )}

      <Route section="base-info">
        {state.context.baseInfo.ref && (
          <BaseInfoScreen
            info={state.context.baseInfo}
            isInitialSetup={isInitialSetup}
          />
        )}
      </Route>

      <Route section="home">
        <HomeScreen hasFinishedSetup={state.context.finishedSetup} />
      </Route>

      <Route section="create-client">
        {state.context.activeId && (
          <CreateClientScreen
            client={state.context.clients[state.context.activeId]}
            isInitialSetup={isInitialSetup}
          />
        )}
      </Route>

      <Route section="create-invoice">
        {state.context.activeId && (
          <CreateInvoiceScreen
            invoice={state.context.invoices[state.context.activeId]}
          />
        )}
      </Route>

      <Route section="action-completed">
        <ActionCompleted
          actionCompleted={state.context.actionCompleted}
          onConfirm={onActionConfirm}
        />
      </Route>
    </>
  );
};

render(
  <TopLevelRouteController>
    <App />
  </TopLevelRouteController>,
  {
    // debug: true
  }
);
