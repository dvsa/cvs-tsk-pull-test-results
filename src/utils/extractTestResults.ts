// eslint-disable-next-line import/no-unresolved
import { TestResultSchema, VehicleType } from '@dvsa/cvs-type-definitions/types/v1/test-result';
import { TestResults } from '@dvsa/cvs-type-definitions/types/v1/enums/testResult.enum';
import { TestActivity } from '../interfaces/TestActivity';

export const extractBillableTestResults = (record: TestResultSchema): TestActivity[] => {
  const activities: TestActivity[] = [];

  record.testTypes.forEach((testType) => {
    activities.push({
      noOfAxles: record.noOfAxles,
      testTypeStartTimestamp: record.testStartTimestamp,
      testTypeEndTimestamp: record.testEndTimestamp,
      testStationType: record.testStationType,
      testCode: testType.testCode,
      vin: record.vin,
      vrm: record.vehicleType === 'trl' as VehicleType ? record.trailerId : record.vrm,
      testStationPNumber: record.testStationPNumber,
      testResult: testType.testResult as TestResults,
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
