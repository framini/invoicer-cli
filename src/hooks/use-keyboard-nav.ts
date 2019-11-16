import React from 'react';
import { useInput, AppContext } from 'ink';

import { TopLevelRouteContext } from '../components/top-level-route-context';

export const useKeyboardNav = () => {
  const { exit } = React.useContext(AppContext);
  const { state } = React.useContext(TopLevelRouteContext);

  useInput((input, key) => {
    if (state.context.selected === 'home') {
      if (input === 'q') {
        exit();
      }
    }
  });
};
