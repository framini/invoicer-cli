import React from 'react';
import { Color, useInput } from 'ink';

import { MainNav } from '../components/main-nav';
import { TopLevelRouteContext } from '../components/top-level-route-context';
import { BaseScreen } from './base.screen';
import { ListItem } from '../components/list-item';
import { Title } from '../components/title';

export const ManageClientsScreen = () => {
  const { send } = React.useContext(TopLevelRouteContext);

  useInput((input, key) => {
    if (key.escape) {
      // @ts-ignore
      send('TOP_LEVEL.GO_TO', { value: 'home', id: 'TO_HOME' });
    }
  });

  return (
    <BaseScreen
      header={
        <Title>Manage clients:</Title>
      }
      footer={
        <ListItem>
          Use the <Color cyan>UP/DOWN</Color> arrow keys to select one of the
          available options
        </ListItem>
      }
    >
      <MainNav />
    </BaseScreen>
  );
};
