/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import logger from '../observability/logger';
import { TestActivity } from './testActivity';
import {
  ATF_OVERRIDE_TEST_TYPES,
  OverrideTestStations,
  TestResultModel,
  TestStationType,
  VehicleType,
} from './testResult';

export const extractBillableTestResults = (record: TestResultModel, isNonFilteredATF: boolean): TestActivity[] => {
  if (!isNonFilteredATF && process.env.DISABLE_PROCESS_NON_MIGRATED_EVENTS) {
    logger.debug('Event not sent as non filtered ATF and processing on non-migrated ATF turned on');
    return [];
  }

  return record.testTypes.reduce((previous, testType) => {
    const testStationPNumber = isNonFilteredATF
      ? record.testStationPNumber
      : getOverrideTestStation(record.testStationType, testType.testCode);

    if (!testStationPNumber) {
      return previous;
    }

    return previous.concat({
      noOfAxles: record.noOfAxles,
      testTypeStartTimestamp: record.testStartTimestamp,
      testTypeEndTimestamp: record.testEndTimestamp,
      testStationType: record.testStationType,
      testCode: testType.testCode,
      vin: record.vin,
      vrm: record.vehicleType === VehicleType.TRL ? record.trailerId : record.vrm,
      testStationPNumber,
      testResult: testType.testResult,
      certificateNumber: testType.certificateNumber,
      testTypeName: testType.name,
      vehicleType: record.vehicleType,
      testerName: record.testerName,
      testerStaffId: record.testerStaffId,
      testResultId: record.testResultId,
    });
  }, [] as TestActivity[]);
};

/* eslint-disable consistent-return */
export function getOverrideTestStation(testStationType: TestStationType, testCode: string): string | undefined {
  if (testStationType === TestStationType.GVTS) {
    return OverrideTestStations.GVTS;
  }
  if (testStationType === TestStationType.POTF) {
    return OverrideTestStations.POTF;
  }
  if (testStationType === TestStationType.ATF && (ATF_OVERRIDE_TEST_TYPES as readonly string[]).includes(testCode)) {
    return OverrideTestStations.ATF;
  }
}
