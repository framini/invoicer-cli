export interface BaseClient {
  id: string;
  name: string;
  provider: '' | 'fixed_rate' | 'harvest';
  flat_rate?: string;
  token?: string;
  accountId?: string;
  providers: any
}

export type FormFieldKind =
  | 'input'
  | 'select-input'
  | 'table'
  | 'select-input-dynamic'
  | 'loading';

export type FormFields<T> = Record<keyof T, FormFieldValue>;

export interface FieldOption {
  label: string;
  value: string;
}

export type Cell =
  | FieldOption
  | {
      label: string;
      src: string;
    };

export type FormFieldValue =
  | {
      kind: Extract<FormFieldKind, 'input'>;
      value?: string;
      label: string;
      required?: boolean
    }
  | {
      kind: Extract<FormFieldKind, 'select-input'>;
      values: FieldOption[];
      label: string;
      errorSrc?: string;
    }
  | {
      kind: Extract<FormFieldKind, 'table'>;
      columns: Cell[];
      label: string;
    }
  | {
      kind: Extract<FormFieldKind, 'select-input-dynamic'>;
      label: string;
      src: string;
    }
  | {
      kind: Extract<FormFieldKind, 'loading'>;
      label: string;
    };

export type Client = BaseClient & {
  ref: any;
};
