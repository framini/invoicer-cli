import React from 'react';
import { Color, Box, useInput, Text } from 'ink';
import figures from 'figures';

import { capitalize, getSingular } from '../utils/general';
import { BaseScreen } from './base.screen';
import { ListItem } from '../components/list-item';

export const ActionCompleted = ({
  actionCompleted,
  onConfirm
}: {
  actionCompleted: string;
  onConfirm: () => void;
}) => {
  useInput((input, key) => {
    if (key.return) {
      onConfirm();
    }
  });

  React.useEffect(() => {
    // we'll automatically leave the screen if no actions were
    // performed
    if (actionCompleted === 'no-action') {
      onConfirm();
    }
  }, [onConfirm, actionCompleted]);

  if (!actionCompleted) {
    return (
      <Box paddingTop={1} paddingBottom={1}>
        <Color red>{figures.cross}</Color>{' '}
        <Text italic bold>
          Seems like something went wrong :/
        </Text>
      </Box>
    );
  }

  const entityName = capitalize(getSingular(actionCompleted));

  return (
    <BaseScreen
      footer={
        <ListItem>
          Press <Color cyan>ENTER</Color> to continue
        </ListItem>
      }
    >
      <Color green>{figures.tick}</Color>{' '}
      {entityName ? (
        <Text italic bold>
          [{entityName}] action performed successfully!
        </Text>
      ) : (
        <Text italic bold>
          action completed!
        </Text>
      )}
    </BaseScreen>
  );
};
