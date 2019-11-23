import React from 'react';
import { Text, Color } from 'ink';
import figures from 'figures';

interface ListItemProps {
  children: React.ReactNode;
}

export const ListItem = (props: ListItemProps) => {
  return (
    <Text>
      <Color magenta>{figures.pointerSmall}</Color> {props.children}
    </Text>
  );
};
