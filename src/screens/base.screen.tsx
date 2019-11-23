import React from 'react';
import { Box } from 'ink';

import { Divider } from '../components/divider';

interface BaseScreenProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
}

export const BaseScreen = (props: BaseScreenProps) => {
  return (
    <Box
      flexDirection="column"
      width={50}
      paddingTop={1}
      paddingLeft={1}
      paddingRight={1}
    >
      {props.header && (
        <Box flexDirection="column">
          {props.header}
          <Divider padding={0} width={70} dividerColor="#5d35a5" />
        </Box>
      )}

      <Box paddingTop={1} paddingBottom={1}>
        {props.children}
      </Box>

      {props.footer && (
        <Box flexDirection="column">
          <Divider padding={0} width={70} />
          {props.footer}
          <Divider padding={0} width={70} />
        </Box>
      )}
    </Box>
  );
};
