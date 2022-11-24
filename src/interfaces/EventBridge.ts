export enum EventType {
  DESK_BASED = 510720003,
  CONTINGENCY = 510720002,
  AMENDMENT = 510720001,
  COMPLETION = 510720000,
}

export interface EventEntry {
  Source: string;
  EventBusName: string;
  DetailType: string;
  Time: Date;
  Detail: string;
}

export interface Entries {
  Entries: EventEntry[];
}

export interface SendResponse {
  SuccessCount: number;
  FailCount: number;
}
