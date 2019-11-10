import React from 'react';
import { Box, Text, Color } from 'ink';
import figures from 'figures';

import { TopLevelRouteContext } from './top-level-route-context';
import { useRouter } from '../hooks/use-router';
import {
  TopLevelRoutesContext,
  TopLevelRoutesSchema,
  TopLevelRoutesEvent
} from '../models/top-level-routes.model';

const Cursor = ({ isActive }: { isActive: boolean }) => {
  if (isActive) {
    return <Color cyan>{figures.radioOn} </Color>
  }

  return <Text>{figures.radioOff} </Text>
}

const MainNavItem = (props: {
  navigatedSection: any;
  active: string;
  section: string;
  children: React.ReactNode;
}) => {
  const isActive = props.navigatedSection === props.section;

  return (
    <Box marginRight={5}>
      <Cursor isActive={isActive} />
      <Text underline={isActive} bold={isActive}>
        {isActive ? <Color cyan>{props.children}</Color> : props.children}
      </Text>
    </Box>
  );
};

export const MainNav = () => {
  const { state } = useRouter<
    TopLevelRoutesContext,
    TopLevelRoutesSchema,
    TopLevelRoutesEvent
  >(TopLevelRouteContext);

  const options = {
    active: state.context.selected,
    navigatedSection: state.context.navigated
  };

  return (
    <>
      <Box paddingTop={2} paddingBottom={2} flexDirection="column">
        {state.context.menu.map(menuItem =>
          menuItem.id ? (
            <MainNavItem {...options} section={menuItem.id} key={menuItem.id}>
              {menuItem.text}
            </MainNavItem>
          ) : null
        )}
      </Box>
    </>
  );
};
