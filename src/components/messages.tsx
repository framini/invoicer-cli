import React from 'react';
import { Box, Color, Text, BoxProps } from 'ink';

export const GoBackMessage = (props: BoxProps) => {
  return (
    <Box paddingTop={1} {...props}>
      <Text italic bold>
        Note: You can cancel by pressing <Color cyan>ESC</Color>
      </Text>
    </Box>
  );
};

export const Notes = (props: BoxProps & { children: React.ReactNode }) => {
  const { children, ...restProps } = props;

  return (
    <Box flexDirection="column" {...restProps}>
      {children}
    </Box>
  );
};
