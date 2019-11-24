import React from 'react';
import { useInput } from 'ink';
import { useService } from '@xstate/react';

import { FormField, getField } from '../components/form-field';
import { BaseScreen } from './base.screen';
import { Title } from '../components/title';
import { Notes, GoBackMessage } from '../components/messages';

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

  return (
    <BaseScreen
      header={
        <>
          <Title>Creating an Invoice:</Title>
          <Notes>
            <GoBackMessage />
          </Notes>
        </>
      }
    >
      {field && (
        <FormField
          field={field}
          context={state.context}
          onSubmit={value => {
            send('INVOICE.NEXT', { key: state.value, value });
          }}
        />
      )}
    </BaseScreen>
  );
};
