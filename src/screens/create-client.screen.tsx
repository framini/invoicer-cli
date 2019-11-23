import React from 'react';
import { Box, Color, useInput, Text } from 'ink';
import { useService } from '@xstate/react';
import Spinner from 'ink-spinner';

import {
  ClientContext,
  ClientEvent,
  ClientState
} from '../models/client.model';
import { FormField, getField } from '../components/form-field';
import { Divider } from '../components/divider';
import { GoBackMessage, Notes } from '../components/messages';
import { BaseScreen } from './base.screen';
import { Title } from '../components/title';

const ClientProvider = ({
  provider,
  onSuccess,
  onFailure
}: {
  provider: any;
  onSuccess: (ctx: any) => void;
  onFailure: (ctx: any) => void;
}) => {
  const [state, send] = useService<any, any>(provider.ref);

  const field = getField(
    state.context.fields,
    state.value as keyof ClientState
  );

  React.useEffect(() => {
    if (state.value === 'success') {
      onSuccess(state.context);
    } else if (state.value === 'failure') {
      onFailure(state.context);
    }
  }, [state.value]);

  if (field) {
    return (
      <FormField
        field={field}
        context={state.context as any}
        onSubmit={value => {
          send('CLIENT_PROVIDER.NEXT', { key: state.value, value });
        }}
      />
    );
  }

  if (state.value === 'loading') {
    return (
      <Box>
        <Color green>
          <Spinner type="dots" />
        </Color>
        {' Loading'}
      </Box>
    );
  }

  return null;
};

export const CreateClientScreen = ({
  client,
  isInitialSetup
}: {
  client: any;
  isInitialSetup: boolean;
}) => {
  const [state, send] = useService<ClientContext, ClientEvent>(client.ref);

  useInput((input, key) => {
    if (key.escape) {
      send('CREATE_CLIENT.DISCARD');
    }
  });

  if (state.value === 'complete') {
    return null;
  }

  // @ts-ignore
  const provider = state.context.providers[state.value];

  if (provider) {
    return (
      <>
        <Box paddingTop={1} flexDirection="column">
          <Text bold>
            <Color magenta>Creating a client:</Color>
          </Text>
          <Box paddingTop={1}>
            <Text bold underline>
              <Color cyan>Provider:</Color>
            </Text>
          </Box>
          <Text italic>
            The provider defines the details (report) of our invoices.
          </Text>
        </Box>
        <Divider padding={0} />
        <ClientProvider
          provider={provider}
          onSuccess={data => {
            send('CREATE_CLIENT.NEXT', {
              provider: state.value,
              confirmed: true,
              data
            });
          }}
          onFailure={data => {
            send('CREATE_CLIENT.NEXT', {
              provider: state.value,
              confirmed: false,
              data
            });
          }}
        />
      </>
    );
  }

  const field = getField(
    state.context.fields,
    state.value as keyof ClientState
  );

  return (
    <BaseScreen
      header={
        <>
          <Title>Creating a client:</Title>
          {isInitialSetup && (
            <Notes>
              <Text italic>A client represents the target of our invoice.</Text>
              <Text italic>
                For now we'll create one but you can create as many as needed
              </Text>
            </Notes>
          )}
          {!isInitialSetup && <GoBackMessage />}
        </>
      }
    >
      {field && (
        <Box paddingBottom={1}>
          <FormField
            field={field}
            context={state.context}
            onSubmit={value => {
              send('CREATE_CLIENT.NEXT', { key: state.value, value });
            }}
          />
        </Box>
      )}
    </BaseScreen>
  );
};
