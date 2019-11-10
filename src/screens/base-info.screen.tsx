import React from 'react';
import { Box, Text } from 'ink';
import { useService } from '@xstate/react';

import { getField, FormField } from '../components/form-field';
import { Divider } from '../components/divider';
import {
  BaseMachineContext,
  BaseMachineEvents
} from '../models/base-info.model';
import { Color } from 'ink';

export const BaseInfoScreen = ({ info }: { info: any }) => {
  const [state, send] = useService<BaseMachineContext, BaseMachineEvents>(
    info.ref
  );

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
        <Text bold><Color magenta>Setup personal details:</Color></Text>
        <Text italic>
          We'll start by setting up of your basic info.
        </Text>
        <Text italic>
          This is a one time only process.
        </Text>
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
