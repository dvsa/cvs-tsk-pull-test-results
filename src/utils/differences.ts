export interface DifferencesEntries {
  fieldname: string;
  oldValue: string | number;
  newValue: string | number;
}

export interface Differences {
  reason?: string;
  fields: DifferencesEntries[];
}
