import React from 'react';
import { Color } from 'ink';

import { BaseScreen } from './base.screen';
import { MainNav } from '../components/main-nav';
import { ListItem } from '../components/list-item';
import { Title } from '../components/title';

export const HomeScreen = () => {
  return (
    <BaseScreen
      header={<Title>Home:</Title>}
      footer={
        <>
          <ListItem>
            Use the <Color cyan>UP/DOWN</Color> arrow keys to select one of the
            available options
          </ListItem>
          <ListItem>
            Press <Color cyan>q</Color> to exit.
          </ListItem>
        </>
      }
    >
      <MainNav />
    </BaseScreen>
  );
};
