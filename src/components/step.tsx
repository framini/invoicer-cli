import React from 'react';
import { Color, Text, Box } from 'ink';
import figures from 'figures';

interface StepContextState {
  activeStep: number;
  setActiveStep: (n: number) => void;
  stepsRef: any;
  completedSteps: number[];
}

const StepContext = React.createContext<StepContextState>({
  activeStep: 0,
  setActiveStep: (n: number) => {},
  stepsRef: [],
  completedSteps: []
});

interface StepperProps {
  children: React.ReactNode;
}

export const Stepper = (props: StepperProps) => {
  const stepsRef = React.useRef([]);
  const [activeStep, setActiveStep] = React.useState(-1);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (Array.isArray(stepsRef.current) && stepsRef.current.length > 0) {
      const firstMatchingIndex = stepsRef.current.findIndex((item: any) => {
        return item.condition;
      });

      if (firstMatchingIndex > -1) {
        // @ts-ignore
        setActiveStep(stepsRef.current[firstMatchingIndex].value);
      } else {
        setActiveStep(stepsRef.current.length);
      }
    }
  });

  React.useEffect(() => {
    const firstMatchingIndex = stepsRef.current.findIndex((item: any) => {
      return item.value === activeStep;
    });
    const nextCompletedSteps = stepsRef.current
      .slice(0, firstMatchingIndex)
      .map((i: any) => i.value);

    if (nextCompletedSteps.length) {
      setCompletedSteps(nextCompletedSteps);
    }
  }, [activeStep]);

  return (
    <StepContext.Provider
      value={{
        activeStep,
        setActiveStep,
        stepsRef,
        completedSteps
      }}
    >
      {props.children}
    </StepContext.Provider>
  );
};

type StepStatus = 'active' | 'completed' | 'idle';

interface StepProps {
  value: number;
  condition: boolean;
}

export const Step = (props: StepProps) => {
  const { stepsRef, activeStep, completedSteps } = React.useContext(
    StepContext
  );
  const { value, condition } = props;

  React.useEffect(() => {
    if (stepsRef.current.some((i: any) => i.value === value)) {
      stepsRef.current = stepsRef.current.map((item: any) => {
        if (item.value === value) {
          return { value, condition };
        }

        return item;
      });
    } else {
      stepsRef.current.push({
        value,
        condition
      });
    }
  }, [value, condition]);

  const status: StepStatus =
    activeStep === value
      ? 'active'
      : completedSteps.includes(value)
      ? 'completed'
      : 'idle';

  if (status === 'active') {
    return (
      <Text bold>
        <Color cyan underline>
          {props.value}
        </Color>
      </Text>
    );
  } else if (status === 'completed') {
    return (
      <Text>
        <Color green>{figures.tick}</Color> {props.value}
      </Text>
    );
  }

  return <Text>{props.value}</Text>;
};

export const StepDivider = ({ dividerChar = '─' }) => {
  const line = dividerChar.repeat(5);

  return (
    <Box paddingLeft={1} paddingRight={1}>
      {line}
    </Box>
  );
};
