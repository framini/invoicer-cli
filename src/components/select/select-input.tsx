import React from 'react';
import { Box, useInput, Color } from 'ink';
import figures from 'figures';

import { SelectItem, Item } from './item';

const SelectIndicator = ({ isSelected }: { isSelected?: boolean }) => {
  return (
    <Box marginRight={1}>
      {isSelected ? <Color cyan>{figures.pointer}</Color> : ' '}
    </Box>
  );
};

interface SelectInputProps {
  items: Item[];
  onSelect: (item: Item) => void;
  defaultIndex?: number;
  selected?: number;
}

export const SelectInput = (props: SelectInputProps) => {
  const [navigatedIndex, setNavigatedIndex] = React.useState(
    props.selected ?? 0
  );

  useInput((input, key) => {
    if (key.downArrow) {
      setNavigatedIndex(si => {
        if (si >= props.items.length - 1) {
          return 0;
        }

        return si + 1;
      });
    } else if (key.upArrow) {
      setNavigatedIndex(si => {
        if (si === 0) {
          return props.items.length - 1;
        }

        return si - 1;
      });
    } else if (key.return) {
      props.onSelect(props.items[navigatedIndex]);
    }
  });

  React.useEffect(() => {
    if (props.selected && props.selected !== navigatedIndex) {
      setNavigatedIndex(props.selected);
    }
  }, [props.selected, navigatedIndex]);

  return (
    <Box flexDirection="column">
      {props.items.map((item, index) => {
        const isSelected = index === navigatedIndex;

        return (
          <Box key={item.key || item.value}>
            <SelectIndicator isSelected={isSelected} />
            <SelectItem {...item} isSelected={isSelected} />
          </Box>
        );
      })}
    </Box>
  );
};
