/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { TestActivity } from './testActivity';
import { TestResultModel } from './testResult';

export const extractBillableTestResults = (record: TestResultModel): TestActivity[] => {
  const testActivities: TestActivity[] = record.testTypes.map((testType) => ({
    noOfAxles: record.noOfAxles,
    testTypeStartTimestamp: record.testStartTimestamp,
    testTypeEndTimestamp: record.testEndTimestamp,
    testStationType: record.testStationType,
    testCode: testType.testCode,
    vin: record.vin,
    vrm: record.vrm,
    testStationPNumber: record.testStationPNumber,
    testResult: testType.testResult,
    certificateNumber: testType.certificateNumber,
    testTypeName: testType.name,
    vehicleType: record.vehicleType,
    testerName: record.testerName,
    testerStaffId: record.testerStaffId,
    testResultId: record.testResultId,
  }));
  return testActivities;
};
