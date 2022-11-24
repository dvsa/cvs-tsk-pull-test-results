export interface FieldChange {
  fieldName: string;
  oldValue: string | number;
  newValue: string | number;
}

export interface TestAmendment {
  reason?: string;
  fields: FieldChange[];
}
