import React from 'react';
import { Box, useInput, Color } from 'ink';
import figures from 'figures';

import { SelectItem, Item } from './item';

const SelectIndicator = ({
  status
}: {
  status: 'selected' | 'navigated' | 'navigated-selected' | '';
}) => {
  if (status === 'navigated-selected') {
    return (
      <Box>
        <Color cyan>{figures.pointer}</Color>
        <Color red>{figures.cross}</Color>
        {' '}
      </Box>
    );
  }

  return (
    <Box marginRight={1}>
      {status === 'navigated' ? <Color cyan>{figures.pointer}</Color> : ' '}
      {status === 'selected' ? <Color red>{figures.cross}</Color> : ' '}
    </Box>
  );
};

interface MultiSelectInputProps {
  items: Item[];
  onSelect: (items: Item[]) => void;
  selected?: number[];
}

export const MultiSelectInput = (props: MultiSelectInputProps) => {
  const [navigated, setNavigatedIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number[]>([]);

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
    } else if (input === ' ') {
      setSelected(state => {
        if (state.includes(navigated)) {
          return state.filter(i => i !== navigated);
        }

        return [...state, navigated];
      });
    } else if (key.return) {
      props.onSelect(props.items.filter((_, i) => selected.includes(i)));
    }
  });

  React.useEffect(() => {
    if (
      props.selected &&
      JSON.stringify(props.selected) !== JSON.stringify(selected)
    ) {
      setSelected(props.selected);
    }
  }, [props.selected, navigated]);

  return (
    <Box flexDirection="column">
      {props.items.map((item, index) => {
        const isNavigated = index === navigated;
        const isSelected = selected.includes(index);
        const status =
          isSelected && isNavigated
            ? 'navigated-selected'
            : isSelected
            ? 'selected'
            : isNavigated
            ? 'navigated'
            : '';

        return (
          <Box key={item.key || item.value}>
            <SelectIndicator status={status} />
            <SelectItem {...item} isSelected={isNavigated} />
          </Box>
        );
      })}
    </Box>
  );
};
