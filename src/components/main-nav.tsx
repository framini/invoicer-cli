import React from 'react';
import { Box } from 'ink';

import { TopLevelRouteContext } from './top-level-route-context';
import { useRouter } from '../hooks/use-router';
import {
  TopLevelRoutesContext,
  TopLevelRoutesSchema,
  TopLevelRoutesEvent
} from '../models/top-level-routes.model';
import { SelectInput } from './select-input';

export const MainNav = () => {
  const { state, send } = useRouter<
    TopLevelRoutesContext,
    TopLevelRoutesSchema,
    TopLevelRoutesEvent
  >(TopLevelRouteContext);

  return (
    <>
      <Box paddingTop={1} paddingBottom={1} flexDirection="column">
        <SelectInput
          items={state.context.menu}
          onSelect={(item: any) => {
            send('TOP_LEVEL.GO_TO', { value: item.value, id: item.id })
          }}
        />
      </Box>
    </>
  );
};
