import React from 'react';
import { Box, useInput, Text, Color } from 'ink';
import { useService } from '@xstate/react';

import { FormField, getField } from '../components/form-field';
import { Divider } from '../components/divider';

export const CreateInvoiceScreen = ({ invoice }: { invoice: any }) => {
  const [state, send] = useService<any, any>(invoice.ref);

  useInput((input, key) => {
    if (key.escape) {
      send('INVOICE.DISCARD');
    }
  });

  if (state.value === 'success' || state.value === 'failure') {
    return null;
  }

  const field = getField(
    state.context.fields,
    // @ts-ignore
    state.value
  );

  // @ts-ignore
  const value = state.context[state.value];

  return (
    <>
      <Box paddingTop={1} flexDirection="column">
        <Text bold>
          <Color magenta>Creating an Invoice:</Color>
        </Text>
      </Box>
      <Box paddingTop={1}>
        <Text italic bold>
          Note: You can cancel by pressing <Color cyan>ESC</Color>
        </Text>
      </Box>
      <Divider padding={0} />
      {field && (
        <FormField
          field={field}
          context={state.context}
          onSubmit={value => {
            send('INVOICE.NEXT', { key: state.value, value });
          }}
          value={value}
        />
      )}
    </>
  );
};
