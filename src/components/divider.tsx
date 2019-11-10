import React from 'react';
import { Box, Color } from 'ink';

const getColorProps = (color: string) => {
  return color.startsWith('#')
    ? {
        hex: color
      }
    : {
        keyword: color
      };
};

export const Divider = ({
  dividerChar = '─',
  dividerColor = 'grey',
  titleColor = 'white',
  width = 50,
  padding = 1,
  title = ''
}: {
  dividerChar?: string;
  dividerColor?: string;
  width?: number;
  padding?: number;
  title?: string;
  titleColor?: string;
}) => {
  const dividerColorProps = getColorProps(dividerColor);

  if (title) {
    const line = dividerChar.repeat(Math.floor(width / 2));
    const titleColorProps = getColorProps(titleColor);

    return (
      <Box paddingLeft={padding} paddingRight={padding}>
        <Color {...dividerColorProps}>{line}</Color>{' '}
        <Color {...titleColorProps}>{title}</Color>{' '}
        <Color {...dividerColorProps}>{line}</Color>
      </Box>
    );
  }

  const line = dividerChar.repeat(width);

  return (
    <Box paddingLeft={padding} paddingRight={padding}>
      <Color {...dividerColorProps}>{line}</Color>
    </Box>
  );
};
