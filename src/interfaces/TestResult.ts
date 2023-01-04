export interface TestResultModel {
  testTypes: TestType[];
  noOfAxles: number;
  testStationType: TestStationType;
  vin: string;
  vrm?: string;
  trailerId?: string;
  testStationPNumber: string;
  testStartTimestamp: string;
  testEndTimestamp: string;
  vehicleType: VehicleType;
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

export enum VehicleType {
  PSV = 'psv',
  HGV = 'hgv',
  TRL = 'trl',
  CAR = 'car',
  LGV = 'lgv',
  MOTORCYCLE = 'motorcycle',
}

export const OverrideTestStations: Record<Exclude<TestStationType, TestStationType.HQ>, string> = {
  atf: 'P50975',
  gvts: 'H00313',
  potf: 'H00314',
};

export const ATF_OVERRIDE_TEST_TYPES = [
  'art',
  'arv',
  'cdv',
  'cnv',
  'ddt',
  'ddv',
  'drt',
  'drv',
  'nft',
  'nfv',
  'nnt',
  'nnv',
  'npt',
  'npv',
  'nvt',
  'nvv',
  'tit',
  'tiv',
  'trt',
  'trv',
  'wbl',
  'wbs',
] as const;

export enum TestStationType {
  ATF = 'atf',
  GVTS = 'gvts',
  HQ = 'hq',
  POTF = 'potf',
}
