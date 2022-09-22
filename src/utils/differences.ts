export interface DifferencesEntries {
  fieldname: string;
  oldvalue: string | number;
  newvalue: string | number;
}

export interface Differences {
  reason?: string;
  fields: DifferencesEntries[];
}
