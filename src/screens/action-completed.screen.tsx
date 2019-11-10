import React from 'react';
import pluralize from 'pluralize';
import { Color, Box, useInput, Text } from 'ink';
import figures from 'figures';

import { capitalize } from '../utils/general';
import { Divider } from '../components/divider';

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

  const entityName = capitalize(pluralize(actionCompleted, 1));

  return (
    <React.Fragment>
      <Box paddingTop={1} paddingBottom={1}>
        <Color green>{figures.tick}</Color>{' '}
        <Text italic bold>
          {entityName} created successfully!
        </Text>
      </Box>

      <Divider padding={0} />

      <Box>
        Press <Color cyan>ENTER</Color> to continue
      </Box>

      <Divider padding={0} />
    </React.Fragment>
  );
};
