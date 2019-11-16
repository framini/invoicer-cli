import React from 'react';
import { Box, Color, Text } from 'ink';

import { MainNav } from '../components/main-nav';
import { Divider } from '../components/divider';
import figures from 'figures';

export const ManageClientsScreen = () => {
  return (
    <Box
      flexDirection="column"
      width={50}
      paddingLeft={1}
      paddingRight={1}
    >
      <MainNav />

      <Divider padding={0} width={70} />

      <Text>
        Pepe
        <Color magenta>{figures.pointerSmall}</Color> Use the{' '}
        <Color cyan>UP/DOWN</Color> arrow keys to select one of the available options
      </Text>

      <Divider padding={0} width={70} />
    </Box>
  );
};
