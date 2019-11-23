import React from 'react';
import { Color, Box, useInput, Text } from 'ink';
import figures from 'figures';

import { capitalize, getSingular } from '../utils/general';
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

  const entityName = capitalize(getSingular(actionCompleted));

  return (
    <React.Fragment>
      <Box paddingTop={1} paddingBottom={1}>
        <Color green>{figures.tick}</Color>{' '}
        {entityName ? (
          <Text italic bold>
            {entityName} created successfully!
          </Text>
        ) : (
          <Text italic bold>
            action completed!
          </Text>
        )}
      </Box>

      <Divider padding={0} />

      <Box>
        Press <Color cyan>ENTER</Color> to continue
      </Box>

      <Divider padding={0} />
    </React.Fragment>
  );
};
