export interface TestResultModel {
  testTypes: TestType[];
  noOfAxles: number;
  testStationType: string;
  vin: string;
  vrm: string;
  testStationPNumber: string;
  testStartTimestamp: string;
  testEndTimestamp: string;
  vehicleType: string;
  testerStaffId: string;
  testResultId: string;
  testerName: string;
  testStatus: string;
  reasonForCreation?: string;
  typeOfTest?: TypeOfTest;
}

export interface TestType {
  testTypeId: string;
  testResult: string;
  testCode: string;
  testTypeStartTimeStamp: string;
  testTypeEndTimeStamp: string;
  name: string;
  certificateNumber?: string;
  testNumber: string;
}

export enum TypeOfTest {
  CONTINGENCY = 'contingency',
  DESK_BASED = 'desk-based',
}
