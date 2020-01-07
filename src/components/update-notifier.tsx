import React from 'react';
import { Box, Text, Color } from 'ink';
import updateNotifier from 'update-notifier';
import figures from 'figures';

import pkg from '../../package.json';

interface PackageInfo {
  latest: string;
  current: string;
  type: string;
  name: string;
}

const UpdateDetails = (props: PackageInfo) => {
  return (
    <Box>
      <Text>
        Update available: <Color grey>{props.current}</Color>{' '}
        {figures.arrowRight} <Color greenBright>{props.latest}</Color>
      </Text>
      <Text> {figures.line} </Text>
      <Text>
        Run <Color cyan>npm i -g @framini/invoicer-cli</Color>
      </Text>
    </Box>
  );
};

export const UpdateNotifier = React.memo(() => {
  const [update, setUpdate] = React.useState<PackageInfo | null>(null);
  const notifier = updateNotifier({ pkg });

  React.useEffect(() => {
    // @ts-ignore
    notifier.fetchInfo().then((a: any) => {
      if (a.type !== 'latest') {
        setUpdate(a);
      }
    });
  }, []);

  return (
    <Box>
      {update !== null ? <UpdateDetails {...update} /> : <Text> </Text>}
    </Box>
  );
});
