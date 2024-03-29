import React from 'react';
import { Box } from 'ink';

import { TopLevelRouteContext } from './top-level-route-context';
import { SelectInput } from './select/select-input';

export const MainNav = () => {
  const { state, send } = React.useContext(TopLevelRouteContext);

  return (
    <Box flexDirection="column">
      <SelectInput
        items={state.context.menu}
        onSelect={(item: any) => {
          // @ts-ignore
          send('TOP_LEVEL.GO_TO', { value: item.value, id: item.id });
        }}
      />
    </Box>
  );
};
