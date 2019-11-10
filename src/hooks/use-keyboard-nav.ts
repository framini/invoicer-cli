import { useContext } from 'react';
import { useInput, AppContext } from 'ink';

import { useRouter } from './use-router';
import { TopLevelRouteContext } from '../components/top-level-route-context';
import {
  TopLevelRoutesContext,
  TopLevelRoutesSchema,
  TopLevelRoutesEvent
} from '../models/top-level-routes.model';

export const useKeyboardNav = () => {
  const { exit } = useContext(AppContext);

  const { state, send } = useRouter<
    TopLevelRoutesContext,
    TopLevelRoutesSchema,
    TopLevelRoutesEvent
  >(TopLevelRouteContext);

  useInput((input, key) => {
    if (state.context.selected === 'home') {
      if (input === 'q') {
        exit();
      }

      const { menu, navigated } = state.context;
      const navigatedIndex = menu.findIndex(i => i.id === navigated);

      if (key.leftArrow || key.upArrow) {
        const nextIndex =
          // if there's no index selected we'll select the 1st one
          navigatedIndex === -1
            ? 0
            : // if we're on the 1st item
            navigatedIndex === 0
            ? // go the last one
              menu.length - 1
            : // otherwise the previous one
              navigatedIndex - 1;

        send(menu[nextIndex].id);
      } else if (key.rightArrow || key.downArrow) {
        const nextIndex =
          // if there's no index selected we'll select the 1st one
          navigatedIndex === -1
            ? 0
            : // if we're on the last item
            navigatedIndex === menu.length - 1
            ? // go the 1st one
              0
            : // otherwise the next one
              navigatedIndex + 1;

        send(menu[nextIndex].id);
      } else if (key.return) {
        send('SELECT', { value: state.value });
      }
    }
  });
};
