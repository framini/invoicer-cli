import React from 'react';
import { Text, Color } from 'ink';

interface TitleProps {
  children: React.ReactNode;
}

export const Title = (props: TitleProps) => {
  return (
    <Text bold>
      <Color magenta>{props.children}</Color>
    </Text>
  );
};
