/* eslint-disable import/no-unresolved */
import { TestStationTypes } from '@dvsa/cvs-type-definitions/types/v1/enums/testStationType.enum';
import { TestResultSchema, VehicleType } from '@dvsa/cvs-type-definitions/types/v1/test-result';
import { TestTypeSchema } from '@dvsa/cvs-type-definitions/types/v1/test-type';
import { TestResults } from '@dvsa/cvs-type-definitions/types/v1/enums/testResult.enum';
import { TestStatus } from '@dvsa/cvs-type-definitions/types/v1/enums/testStatus.enum';
import { extractBillableTestResults } from '../../src/utils/extractTestResults';
import { TestActivity } from '../../src/interfaces/TestActivity';

describe('extractTestResults', () => {
  let TEST_ACTIVITY: TestActivity[];

  it('GIVEN data WITHOUT a certificate number issued WHEN the test result is extracted into an event THEN the event doesn\'t have a certificate number', () => {
    const mockRecord: TestResultSchema = {
      noOfAxles: 2,
      testStationType: TestStationTypes.GVTS,
      testEndTimestamp: '2019-01-14T10:36:33.987Z',
      testStartTimestamp: '2019-01-14T10:36:33.987Z',
      vin: 'XMGDE02FS0H012303',
      vrm: 'JY58FPP',
      testerStaffId: '2',
      testStationPNumber: 'P99005',
      vehicleType: 'psv' as VehicleType,
      testResultId: '9',
      testerName: 'Dorel',
      testStatus: TestStatus.SUBMITTED,
      testTypes: [
        {
          testCode: 'aas',
          testTypeId: '1',
          testResult: TestResults.FAIL,
          testTypeEndTimestamp: '2019-01-14T10:36:33.987Z',
          testTypeStartTimestamp: '2019-01-14T10:36:33.987Z',
          name: 'Annual test',
          testNumber: 'W084564',
        } as TestTypeSchema,
      ],
    } as TestResultSchema;
    TEST_ACTIVITY = extractBillableTestResults(mockRecord);
    const EXPECTED_TEST_ACTIVITY: TestActivity = {
      noOfAxles: 2,
      testTypeStartTimestamp: '2019-01-14T10:36:33.987Z',
      testTypeEndTimestamp: '2019-01-14T10:36:33.987Z',
      testStationType: 'gvts',
      testCode: 'aas',
      vin: 'XMGDE02FS0H012303',
      vrm: 'JY58FPP',
      testStationPNumber: 'P99005',
      testResult: 'fail',
      testTypeName: 'Annual test',
      vehicleType: 'psv',
      testerName: 'Dorel',
      testerStaffId: '2',
      testResultId: '9',
    };
    expect(TEST_ACTIVITY[0].vrm).not.toEqual(mockRecord.trailerId);
    expect(TEST_ACTIVITY).toContainEqual(EXPECTED_TEST_ACTIVITY);
  });

  it('GIVEN data WITH a certificate number issued WHEN the test result is extracted into an event THEN the event has certificate number', () => {
    const mockRecord: TestResultSchema = {
      noOfAxles: 2,
      testStationType: TestStationTypes.GVTS,
      testEndTimestamp: '2019-01-14T10:36:33.987Z',
      testStartTimestamp: '2019-01-14T10:36:33.987Z',
      vin: 'XMGDE02FS0H012303',
      vrm: 'JY58FPP',
      testerStaffId: '2',
      testStationPNumber: 'P99005',
      vehicleType: 'psv' as VehicleType,
      trailerId: 'PSV123',
      testResultId: '9',
      testerName: 'Dorel',
      testStatus: TestStatus.SUBMITTED,
      testTypes: [
        {
          certificateNumber: '1234',
          testCode: 'aas',
          testTypeId: '1',
          testResult: TestResults.FAIL,
          testTypeEndTimestamp: '2019-01-14T10:36:33.987Z',
          testTypeStartTimestamp: '2019-01-14T10:36:33.987Z',
          name: 'Annual test',
          testNumber: 'W084564',
        } as TestTypeSchema,
      ],
    } as TestResultSchema;
    TEST_ACTIVITY = extractBillableTestResults(mockRecord);
    const EXPECTED_TEST_ACTIVITY: TestActivity = {
      noOfAxles: 2,
      testTypeStartTimestamp: '2019-01-14T10:36:33.987Z',
      testTypeEndTimestamp: '2019-01-14T10:36:33.987Z',
      testStationType: 'gvts',
      testCode: 'aas',
      vin: 'XMGDE02FS0H012303',
      vrm: 'JY58FPP',
      testStationPNumber: 'P99005',
      testResult: 'fail',
      certificateNumber: '1234',
      testTypeName: 'Annual test',
      vehicleType: 'psv',
      testerName: 'Dorel',
      testerStaffId: '2',
      testResultId: '9',
    };
    expect(TEST_ACTIVITY).toContainEqual(EXPECTED_TEST_ACTIVITY);
  });

  it('GIVEN data with two test types WHEN test results are extracted into events THEN expect two events to be generated', () => {
    const mockRecord: TestResultSchema = {
      noOfAxles: 2,
      testStationType: TestStationTypes.GVTS,
      testEndTimestamp: 'foo',
      testStartTimestamp: 'bar',
      vin: 'XMGDE02FS0H012303',
      vrm: 'JY58FPP',
      testerStaffId: '2',
      testStationPNumber: 'P99005',
      vehicleType: 'psv' as VehicleType,
      testResultId: '9',
      testerName: 'Dorel',
      testStatus: TestStatus.SUBMITTED,
      testTypes: [
        {
          certificateNumber: '1234',
          testCode: 'aas',
          testTypeId: '1',
          testResult: TestResults.FAIL,
          testTypeEndTimestamp: '2019-01-14T10:36:33.987Z',
          testTypeStartTimestamp: '2019-01-14T10:36:33.987Z',
          name: 'Annual test',
          testNumber: 'W084564',
        } as TestTypeSchema,
        {
          certificateNumber: '1234',
          testCode: 'aas',
          testTypeId: '1',
          testResult: TestResults.FAIL,
          testTypeEndTimestamp: '2019-01-14T10:36:33.987Z',
          testTypeStartTimestamp: '2019-01-14T10:36:33.987Z',
          name: 'Annual test',
          testNumber: 'W084564',
        } as TestTypeSchema,
      ],
    } as TestResultSchema;
    TEST_ACTIVITY = extractBillableTestResults(mockRecord);
    expect(TEST_ACTIVITY).toHaveLength(2);
  });
  it('GIVEN a trailer test result WHEN the test result is extracted into an event THEN the event has the tailer id in the vrm field', () => {
    const mockRecord: TestResultSchema = {
      noOfAxles: 2,
      testStationType: TestStationTypes.GVTS,
      testEndTimestamp: '2019-01-14T10:36:33.987Z',
      testStartTimestamp: '2019-01-14T10:36:33.987Z',
      vin: 'XMGDE02FS0H012303',
      trailerId: 'TRL123',
      testerStaffId: '2',
      testStationPNumber: 'P99005',
      vehicleType: 'trl' as VehicleType,
      testResultId: '9',
      testerName: 'Dorel',
      testStatus: TestStatus.SUBMITTED,
      testTypes: [
        {
          certificateNumber: '1234',
          testCode: 'aas',
          testTypeId: '1',
          testResult: TestResults.FAIL,
          testTypeEndTimestamp: '2019-01-14T10:36:33.987Z',
          testTypeStartTimestamp: '2019-01-14T10:36:33.987Z',
          name: 'Annual test',
          testNumber: 'W084564',
        } as TestTypeSchema,
      ],
    } as TestResultSchema;
    TEST_ACTIVITY = extractBillableTestResults(mockRecord);
    const EXPECTED_TEST_ACTIVITY: TestActivity = {
      noOfAxles: 2,
      testTypeStartTimestamp: '2019-01-14T10:36:33.987Z',
      testTypeEndTimestamp: '2019-01-14T10:36:33.987Z',
      testStationType: 'gvts',
      testCode: 'aas',
      vin: 'XMGDE02FS0H012303',
      vrm: 'TRL123',
      testStationPNumber: 'P99005',
      testResult: 'fail',
      certificateNumber: '1234',
      testTypeName: 'Annual test',
      vehicleType: 'trl',
      testerName: 'Dorel',
      testerStaffId: '2',
      testResultId: '9',
    };
    expect(TEST_ACTIVITY[0].vrm).toEqual(mockRecord.trailerId);
    expect(TEST_ACTIVITY).toContainEqual(EXPECTED_TEST_ACTIVITY);
  });
});
