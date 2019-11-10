export const colors = {
  red: '#e57373'
};

interface SupportedVariable {
  name: string;
  required: boolean;
}

const SUPPORTED_VARIABLES: SupportedVariable[] = [
  {
    name: 'report',
    required: true
  },
  {
    name: 'totalHours',
    required: false
  },
  {
    name: 'hourlyRate',
    required: false
  },
  {
    name: 'flatSalary',
    required: false
  },
  {
    name: 'payment_method',
    required: true
  },
  {
    name: 'month',
    required: true
  },
  {
    name: 'year',
    required: true
  }
];

export const app = {
  templatePath: 'template.xlsx',
  variables: SUPPORTED_VARIABLES
};
