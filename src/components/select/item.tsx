import React from 'react';
import { Color } from 'ink';

export const SelectItem = ({
  isSelected,
  label
}: {
  isSelected?: boolean;
  label: string;
}) => {
  return <Color cyan={isSelected}>{label}</Color>;
};

export interface Item {
  label: string;
  value: React.Key;
  key?: React.Key;
}
