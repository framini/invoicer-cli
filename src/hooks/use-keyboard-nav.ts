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

  const { state } = useRouter<
    TopLevelRoutesContext,
    TopLevelRoutesSchema,
    TopLevelRoutesEvent
  >(TopLevelRouteContext);

  useInput((input, key) => {
    if (state.context.selected === 'home') {
      if (input === 'q') {
        exit();
      }
    }
  });
};
