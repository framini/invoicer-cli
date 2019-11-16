import React from 'react';
import { Box, Color, Text, useInput } from 'ink';

import { MainNav } from '../components/main-nav';
import { Divider } from '../components/divider';
import figures from 'figures';
import { TopLevelRouteContext } from '../components/top-level-route-context';

export const ManageClientsScreen = () => {
  const { send } = React.useContext(TopLevelRouteContext);

  useInput((input, key) => {
    if (key.escape) {
      // @ts-ignore
      send('TOP_LEVEL.GO_TO', { value: 'home', id: 'TO_HOME' });
    }
  });

  return (
    <Box flexDirection="column" width={50} paddingLeft={1} paddingRight={1}>
      <MainNav />

      <Divider padding={0} width={70} />

      <Text>
        <Color magenta>{figures.pointerSmall}</Color> Use the{' '}
        <Color cyan>UP/DOWN</Color> arrow keys to select one of the available
        options
      </Text>

      <Divider padding={0} width={70} />
    </Box>
  );
};
