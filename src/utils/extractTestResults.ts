import { TestActivity } from '../interfaces/TestActivity';
import { TestResultModel, VehicleType } from '../interfaces/TestResult';

export const extractBillableTestResults = (record: TestResultModel): TestActivity[] => {
  const activities: TestActivity[] = [];

  record.testTypes.forEach((testType) => {
    activities.push({
      noOfAxles: record.noOfAxles,
      testTypeStartTimestamp: record.testStartTimestamp,
      testTypeEndTimestamp: record.testEndTimestamp,
      testStationType: record.testStationType,
      testCode: testType.testCode,
      vin: record.vin,
      vrm: record.vehicleType === VehicleType.TRL ? record.trailerId : record.vrm,
      testStationPNumber: record.testStationPNumber,
      testResult: testType.testResult,
      certificateNumber: testType.certificateNumber,
      testTypeName: testType.name,
      vehicleType: record.vehicleType,
      testerName: record.testerName,
      testerStaffId: record.testerStaffId,
      testResultId: record.testResultId,
    });
  });
  return activities;
};
