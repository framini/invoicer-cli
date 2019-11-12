import React from 'react';
import { Box, Text, Color } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput, { ItemProps, IndicatorProps } from 'ink-select-input';
import Table from 'ink-table';
import Spinner from 'ink-spinner';
import figures from 'figures';

import { Divider } from './divider';
import { FormFieldValue } from '../types/types';
import { colors } from '../config'

interface FormFieldProps<T> {
  onSubmit: (s: string) => void;
  field: FormFieldValue;
  context: T;
  value?: string;
}

export function getField<T, K>(
  fields: T,
  field: keyof K
): FormFieldValue | null {
  if (field in fields) {
    // @ts-ignore
    return fields[field];
  }

  return null;
}

const objToTableItem = (obj: any) => {
  return Object.keys(obj).map(key => {
    return {
      label: key,
      value: obj[key]
    };
  });
};

const findPath = (src: any, paths: string[]): any => {
  const p = paths.slice();
  const firstPath = p[0];

  if (!firstPath) {
    return;
  }

  if (paths.length <= 1 && src[firstPath]) {
    return src[firstPath];
  }

  return findPath(src[firstPath], p.slice(1));
};

// We support multiple formats for displaying content inside columns:
// 1. Direct children context: { label: 'Some label', value:
//    'direct-child-key' } where `direct-child-key` exists in
//    `context`
// 2. Nested tables: { label: 'Some label', value:
//    'direct-child-key' } where `direct-child-key` represents a
//    direct context child whose value is an object
// 3. Nested values: { label: 'Some label', value:
//    'direct-child-key.nested-key' } where `direct-child-key` exists
//    in `context` and `nested-key` is a key of `direct-child-key`
const parseTableData = (
  columns: any,
  context: any,
  acc: any = [],
  index = 0
): any[] => {
  return columns.reduce((reducer: any, column: any) => {
    if (!reducer[index]) {
      reducer[index] = {};
    }

    if (column.value) {
      let valueSrc;
      if (Array.isArray(column.value)) {
        valueSrc = column.value;
      } else {
        const keys = column.value.split('.');
        valueSrc = findPath(context, keys);
      }

      // This is to avoid showing empty cells
      if (valueSrc) {
        reducer[index][column.label] = valueSrc;
      }
    } else if (column.src) {
      const keys = column.src.split('.');
      const dataSrc = findPath(context, keys);

      // this is when we're dealing with nested tables: (i.e src:
      // formatted.report)
      if (Array.isArray(dataSrc)) {
        return parseTableData(
          objToTableItem({
            [column.label]: dataSrc
          }),
          context,
          acc,
          index + 1
        );
      }

      if (context[column.src]) {
        return parseTableData(
          objToTableItem(context[column.src]),
          context,
          acc,
          index + 1
        );
      }
    }

    return reducer;
  }, acc);
};

const getTableContent = (tableItem: any) => {
  const tableItemKeys = Object.keys(tableItem);
  const isNestedTable = tableItemKeys.some(k => Array.isArray(tableItem[k]));

  if (tableItemKeys.length === 1 && isNestedTable) {
    const [tableItemLabel] = tableItemKeys;
    return tableItem[tableItemLabel];
  }

  return [tableItem];
};

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

const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <>
      <Divider padding={0} dividerColor={colors.red} width={60} />
      <Text bold>
        <Color hex={colors.red}>{figures.cross}</Color> {message}
      </Text>
      <Divider padding={0} dividerColor={colors.red} width={60} />
    </>
  );
};

export const FormField = <T extends any>({
  onSubmit,
  field,
  context,
  value: propsValue
}: FormFieldProps<T>) => {
  const [value, setValue] = React.useState('');

  if (field.kind === 'select-input') {
    const index = field.values.findIndex(item => item.value === propsValue);
    const initialIndex = index > -1 ? index : 0;
    // @ts-ignore
    const error = context[field.errorSrc];

    return (
      <Box flexDirection="column">
        <Text>{field.label}:</Text>
        {error && <ErrorMessage message={error} />}
        <SelectInput
          items={field.values}
          onSelect={item => onSubmit(item.value as string)}
          initialIndex={initialIndex}
          indicatorComponent={SelectIndicator}
          itemComponent={SelectItem}
        />
      </Box>
    );
  } else if (field.kind === 'table') {
    const data = parseTableData(field.columns, context);

    return (
      <Box flexDirection="column">
        {field.label && <Text>{field.label}:</Text>}
        {data.map((t, i) => {
          return <Table data={getTableContent(t)} key={i} />;
        })}
        <Text>Press "Enter" to continue:</Text>
        <TextInput
          value={''}
          onChange={() => {}}
          onSubmit={() => {
            onSubmit('');
          }}
        />
      </Box>
    );
  } else if (field.kind === 'select-input-dynamic') {
    const src = context[field.src];

    if (!src) {
      return null;
    }

    const items = Object.keys(src).map(key => {
      return {
        label: src[key].name,
        value: src[key].id
      };
    });

    return (
      <Box flexDirection="column">
        <Text>{field.label}:</Text>
        <SelectInput
          items={items}
          onSelect={item => onSubmit(item.value as string)}
          indicatorComponent={SelectIndicator}
          itemComponent={SelectItem}
        />
      </Box>
    );
  } else if (field.kind === 'loading') {
    return (
      <Box>
        <Color green>
          <Spinner type="dots" />
        </Color>{' '}
        {field.label}
      </Box>
    );
  }

  // @ts-ignore
  const placeholder = context[field.value];

  return (
    <Box>
      <Text>{field.label}: </Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChange={value => {
          setValue(value);
        }}
        onSubmit={value => {
          setValue('');
          onSubmit(value || placeholder);
        }}
      />
    </Box>
  );
};
