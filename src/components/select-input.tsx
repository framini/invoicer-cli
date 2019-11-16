import React from 'react';
import { Box, Color, useInput } from 'ink';
import figures from 'figures';

const SelectIndicator = ({ isSelected }: { isSelected?: boolean }) => {
  return (
    <Box marginRight={1}>
      {isSelected ? <Color cyan>{figures.pointer}</Color> : ' '}
    </Box>
  );
};

const SelectItem = ({
  isSelected,
  label
}: {
  isSelected?: boolean;
  label: string;
}) => {
  return <Color cyan={isSelected}>{label}</Color>;
};

interface Item {
  label: string;
  value: React.Key;
  key?: React.Key;
}

interface SelectInputProps {
  items: Item[];
  onSelect: (item: Item) => void;
  defaultIndex?: number;
  selectedIndex?: number;
}

export const SelectInput = (props: SelectInputProps) => {
  const [selectedIndex, setSelectedIndex] = React.useState(
    props.selectedIndex ?? 0
  );

  useInput((input, key) => {
    if (key.downArrow) {
      setSelectedIndex(si => {
        if (si >= props.items.length - 1) {
          return 0;
        }

        return si + 1;
      });
    } else if (key.upArrow) {
      setSelectedIndex(si => {
        if (si === 0) {
          return props.items.length - 1;
        }

        return si - 1;
      });
    } else if (key.return) {
      props.onSelect(props.items[selectedIndex]);
    }
  });

  React.useEffect(() => {
    if (props.selectedIndex && props.selectedIndex !== selectedIndex) {
      setSelectedIndex(props.selectedIndex);
    }
  }, [props.selectedIndex, selectedIndex]);

  return (
    <Box flexDirection="column">
      {props.items.map((item, index) => {
        const isSelected = index === selectedIndex;

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
