import React from 'react';
import { Color, useInput } from 'ink';

import { TopLevelRouteContext } from '../components/top-level-route-context';
import { SelectInput } from '../components/select/select-input';
import { GoBackMessage, Notes } from '../components/messages';
import { BaseScreen } from './base.screen';
import { Title } from '../components/title';
import { ListItem } from '../components/list-item';

export const EditClientScreen = () => {
  const { state, send } = React.useContext(TopLevelRouteContext);
  const clients = React.useMemo(() => {
    return Object.keys(state.context.clients).map(clientId => {
      const c = state.context.clients[clientId];
      return {
        label: c.name,
        value: c.id
      };
    });
  }, [state.context.clients]);

  useInput((input, key) => {
    if (key.escape) {
      // @ts-ignore
      send('TOP_LEVEL.GO_TO', {
        value: 'manage-clients',
        id: 'TO_MANAGE_CLIENTS'
      });
    }
  });

  return (
    <BaseScreen
      header={
        <>
          <Title>Select the client you want to modify:</Title>
          <Notes>
            <GoBackMessage />
          </Notes>
        </>
      }
      footer={
        <ListItem>
          Use the <Color cyan>UP/DOWN</Color> arrow keys to select one of the
          available options
        </ListItem>
      }
    >
      <SelectInput
        items={clients}
        onSelect={item => {
          // @ts-ignore
          send('EDIT_CLIENT.SELECT', {
            value: 'create-client',
            id: 'TO_CREATE_CLIENT',
            activeId: item.value
          });
        }}
      />
    </BaseScreen>
  );
};
