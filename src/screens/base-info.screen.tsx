import React from 'react';
import { Text, useInput, Color } from 'ink';
import { useService } from '@xstate/react';

import { BaseScreen } from './base.screen';
import { getField, FormField } from '../components/form-field';
import {
  BaseMachineContext,
  BaseMachineEvents
} from '../models/base-info.model';
import { ListItem } from '../components/list-item';
import { Title } from '../components/title';
import { Notes } from '../components/messages';

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
      send('BASE_INFO.LOCAL_DISCARD');
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
    <BaseScreen
      header={
        <>
          <Title>Setup personal details:</Title>

          {isInitialSetup && (
            <Notes>
              <Text italic>We'll start by setting up of your basic info.</Text>
              <Text italic>
                This is a one time only process and what we gather here
              </Text>
              <Text italic>is gonna be used for generating the invoices</Text>
            </Notes>
          )}
        </>
      }
      footer={
        <>
          <ListItem>
            Press <Color cyan>ENTER</Color> to move to the next field.
          </ListItem>
          {!isInitialSetup && (
            <ListItem>
              Leaving the placeholder unchanged will leave the field as it is.
            </ListItem>
          )}
        </>
      }
    >
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
    </BaseScreen>
  );
};
