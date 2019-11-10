import React from 'react';
import { Box, Color, Text } from 'ink';

import { MainNav } from '../components/main-nav';
import { Divider } from '../components/divider';

export const HomeScreen = ({
  hasFinishedSetup
}: {
  hasFinishedSetup: boolean;
}) => {
  return (
    <Box
      flexDirection="column"
      alignItems="center"
      width={50}
      paddingLeft={1}
      paddingRight={1}
    >
      {!hasFinishedSetup && (
        <>
          <Color magenta>
            <Text bold>Welcome! Before being able to create an invoice</Text>
          </Color>
          <Color magenta>
            <Text bold>you must create a client first.</Text>
          </Color>
        </>
      )}

      <MainNav />

      <Divider padding={0} />

      <Text>
        Use the <Color cyan>UP/DOWN</Color> arrow keys to select
      </Text>
      <Text>one of the available options</Text>
      <Text>
        Press <Color cyan>q</Color> to exit.
      </Text>

      <Divider padding={0} />
    </Box>
  );
};
