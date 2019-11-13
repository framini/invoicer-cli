import React from 'react';
import InkSelectInput, {
  ItemProps,
  IndicatorProps,
  InkSelectInputProps
} from 'ink-select-input';
import { Box, Color } from 'ink';
import figures from 'figures';

const SelectIndicator = ({ isSelected }: IndicatorProps) => {
  return (
    <Box marginRight={1}>
      {isSelected ? <Color cyan>{figures.pointer}</Color> : ' '}
    </Box>
  );
};

const SelectItem = ({ isSelected, label }: ItemProps) => {
  return <Color cyan={isSelected}>{label}</Color>;
};

export const SelectInput = (props: InkSelectInputProps) => {
  return (
    <InkSelectInput
      indicatorComponent={SelectIndicator}
      itemComponent={SelectItem}
      {...props}
    />
  );
};
