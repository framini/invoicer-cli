import React from 'react';
import { Color, useInput } from 'ink';

import { TopLevelRouteContext } from '../components/top-level-route-context';
import { MultiSelectInput } from '../components/select/multi-select-input';
import { BaseScreen } from './base.screen';
import { ListItem } from '../components/list-item';
import { Title } from '../components/title';

export const RemoveClientScreen = () => {
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
      header={<Title>Select the clients you want to remove:</Title>}
      footer={
        <>
          <ListItem>
            Use the <Color cyan>SPACE</Color> key to select the clients to
            remove
          </ListItem>
          <ListItem>
            Press <Color cyan>ENTER</Color> to confirm
          </ListItem>
        </>
      }
    >
      <MultiSelectInput
        items={clients}
        onSelect={items => {
          // @ts-ignore
          send('REMOVE_CLIENT.COMMIT', {
            value: 'action-completed',
            items
          });
        }}
      />
    </BaseScreen>
  );
};
