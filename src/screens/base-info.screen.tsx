import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useService } from '@xstate/react';

import { getField, FormField } from '../components/form-field';
import { Divider } from '../components/divider';
import {
  BaseMachineContext,
  BaseMachineEvents
} from '../models/base-info.model';
import { Color } from 'ink';

export const BaseInfoScreen = ({
  info,
  isInitialSetup
}: {
  info: any;
  isInitialSetup: boolean;
}) => {
  const [state, send] = useService<BaseMachineContext, BaseMachineEvents>(
    info.ref
  );

  useInput((input, key) => {
    if (key.escape && !isInitialSetup) {
      // @ts-ignore
      send('BASE_INFO.DISCARD');
    }
  });

  if (state.value === 'success') {
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
          <Color magenta>Setup personal details:</Color>
        </Text>
        {isInitialSetup && (
          <>
            <Text italic>We'll start by setting up of your basic info.</Text>
            <Text italic>
              This is a one time only process and what we gather here
            </Text>
            <Text italic>is gonna be used for generating the invoices</Text>
          </>
        )}
      </Box>
      <Divider padding={0} />
      <Box paddingBottom={1}>
        {field && (
          <FormField
            field={field}
            context={state.context}
            onSubmit={value => {
              send('BASE_INFO.NEXT', { key: state.value, value });
            }}
            value={value}
          />
        )}
      </Box>
    </>
  );
};
