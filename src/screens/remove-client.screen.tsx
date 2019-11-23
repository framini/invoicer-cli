import React from 'react';
import { Box, Color, Text, useInput } from 'ink';

import { Divider } from '../components/divider';
import figures from 'figures';
import { TopLevelRouteContext } from '../components/top-level-route-context';
import { MultiSelectInput } from '../components/select/multi-select-input';

export const RemoveClientScreen = () => {
  const { state, send } = React.useContext(TopLevelRouteContext);
  const clients = React.useMemo(() => {
    return Object.keys(state.context.clients).map(clientId => {
      const c = state.context.clients[clientId];
      return {
        label: c.name,
        value: c.id
      };
    });
  }, [state.context.clients]);

  useInput((input, key) => {
    if (key.escape) {
      // @ts-ignore
      send('TOP_LEVEL.GO_TO', {
        value: 'manage-clients',
        id: 'TO_MANAGE_CLIENTS'
      });
    }
  });

  return (
    <Box flexDirection="column" width={50} paddingLeft={1} paddingRight={1}>
      <Text>Select the client you want to modify: </Text>
      <MultiSelectInput
        items={clients}
        onSelect={items => {
          // @ts-ignore
          send('REMOVE_CLIENT.COMMIT', {
            value: 'action-completed',
            items
          });
        }}
      />

      <Divider padding={0} width={70} />

      <Text>
        <Color magenta>{figures.pointerSmall}</Color> Use the{' '}
        <Color cyan>UP/DOWN</Color> arrow keys to select one of the available
        options
      </Text>

      <Text>
        <Color magenta>{figures.pointerSmall}</Color> Use the{' '}
        <Color cyan>SPACE</Color> key to select the clients to remove
      </Text>

      <Divider padding={0} width={70} />
    </Box>
  );
};
