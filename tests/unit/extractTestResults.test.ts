import { extractBillableTestResults } from '../../src/utils/extractTestResults';
import { TestActivity } from '../../src/interfaces/TestActivity';
import { TestResultModel, TestStationType, VehicleType } from '../../src/interfaces/TestResult';

describe('extractTestResults', () => {
  let TEST_ACTIVITY: TestActivity[];

  it('GIVEN data WITHOUT a certificate number issued WHEN the test result is extracted into an event THEN the event doesn\'t have a certificate number', () => {
    const mockRecord: TestResultModel = {
      noOfAxles: 2,
      testStationType: TestStationType.GVTS,
      testEndTimestamp: '2019-01-14T10:36:33.987Z',
      testStartTimestamp: '2019-01-14T10:36:33.987Z',
      vin: 'XMGDE02FS0H012303',
      vrm: 'JY58FPP',
      testerStaffId: '2',
      testStationPNumber: 'P99005',
      vehicleType: VehicleType.PSV,
      testResultId: '9',
      testerName: 'Dorel',
      testStatus: 'submitted',
      testTypes: [
        {
          testCode: 'aas',
          testTypeId: '1',
          testResult: 'fail',
          testTypeEndTimeStamp: '2019-01-14T10:36:33.987Z',
          testTypeStartTimeStamp: '2019-01-14T10:36:33.987Z',
          name: 'Annual test',
          testNumber: 'W084564',
        },
      ],
    };
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
    const mockRecord: TestResultModel = {
      noOfAxles: 2,
      testStationType: TestStationType.GVTS,
      testEndTimestamp: '2019-01-14T10:36:33.987Z',
      testStartTimestamp: '2019-01-14T10:36:33.987Z',
      vin: 'XMGDE02FS0H012303',
      vrm: 'JY58FPP',
      testerStaffId: '2',
      testStationPNumber: 'P99005',
      vehicleType: VehicleType.PSV,
      trailerId: 'PSV123',
      testResultId: '9',
      testerName: 'Dorel',
      testStatus: 'submitted',
      testTypes: [
        {
          certificateNumber: '1234',
          testCode: 'aas',
          testTypeId: '1',
          testResult: 'fail',
          testTypeEndTimeStamp: '2019-01-14T10:36:33.987Z',
          testTypeStartTimeStamp: '2019-01-14T10:36:33.987Z',
          name: 'Annual test',
          testNumber: 'W084564',
        },
      ],
    };
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
    const mockRecord: TestResultModel = {
      noOfAxles: 2,
      testStationType: TestStationType.GVTS,
      testEndTimestamp: 'foo',
      testStartTimestamp: 'bar',
      vin: 'XMGDE02FS0H012303',
      vrm: 'JY58FPP',
      testerStaffId: '2',
      testStationPNumber: 'P99005',
      vehicleType: VehicleType.PSV,
      testResultId: '9',
      testerName: 'Dorel',
      testStatus: 'submitted',
      testTypes: [
        {
          certificateNumber: '1234',
          testCode: 'aas',
          testTypeId: '1',
          testResult: 'fail',
          testTypeEndTimeStamp: '2019-01-14T10:36:33.987Z',
          testTypeStartTimeStamp: '2019-01-14T10:36:33.987Z',
          name: 'Annual test',
          testNumber: 'W084564',
        },
        {
          certificateNumber: '1234',
          testCode: 'aas',
          testTypeId: '1',
          testResult: 'fail',
          testTypeEndTimeStamp: '2019-01-14T10:36:33.987Z',
          testTypeStartTimeStamp: '2019-01-14T10:36:33.987Z',
          name: 'Annual test',
          testNumber: 'W084564',
        },
      ],
    };
    TEST_ACTIVITY = extractBillableTestResults(mockRecord);
    expect(TEST_ACTIVITY).toHaveLength(2);
  });
  it('GIVEN a trailer test result WHEN the test result is extracted into an event THEN the event has the tailer id in the vrm field', () => {
    const mockRecord: TestResultModel = {
      noOfAxles: 2,
      testStationType: TestStationType.GVTS,
      testEndTimestamp: '2019-01-14T10:36:33.987Z',
      testStartTimestamp: '2019-01-14T10:36:33.987Z',
      vin: 'XMGDE02FS0H012303',
      trailerId: 'TRL123',
      testerStaffId: '2',
      testStationPNumber: 'P99005',
      vehicleType: VehicleType.TRL,
      testResultId: '9',
      testerName: 'Dorel',
      testStatus: 'submitted',
      testTypes: [
        {
          certificateNumber: '1234',
          testCode: 'aas',
          testTypeId: '1',
          testResult: 'fail',
          testTypeEndTimeStamp: '2019-01-14T10:36:33.987Z',
          testTypeStartTimeStamp: '2019-01-14T10:36:33.987Z',
          name: 'Annual test',
          testNumber: 'W084564',
        },
      ],
    };
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
