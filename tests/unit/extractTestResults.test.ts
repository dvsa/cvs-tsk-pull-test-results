/* eslint-disable @typescript-eslint/comma-dangle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable quote-props */
import { extractBillableTestResults, getOverrideTestStation } from '../../src/utils/extractTestResults';
import { TestActivity } from '../../src/utils/testActivity';
import {
  ATF_OVERRIDE_TEST_TYPES,
  OverrideTestStations,
  TestResultModel,
  TestStationType,
  VehicleType,
} from '../../src/utils/testResult';

describe('extractTestResults', () => {
  let TEST_ACTIVITY: TestActivity[];

  it(`GIVEN data WITHOUT a certificate number issued WHEN the test result is extracted into an event THEN the event doesn't have a certificate number`, () => {
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
    TEST_ACTIVITY = extractBillableTestResults(mockRecord, true);
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
    TEST_ACTIVITY = extractBillableTestResults(mockRecord, true);
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
    TEST_ACTIVITY = extractBillableTestResults(mockRecord, true);
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
    TEST_ACTIVITY = extractBillableTestResults(mockRecord, true);
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

  const testCases = [
    {
      testStationType: TestStationType.GVTS,
      testStationPNumber: OverrideTestStations.GVTS,
      testCode: 'not a valid test code',
    },
    {
      testStationType: TestStationType.ATF,
      testStationPNumber: OverrideTestStations.ATF,
      testCode: ATF_OVERRIDE_TEST_TYPES[0],
    },
    {
      testStationType: TestStationType.POTF,
      testStationPNumber: OverrideTestStations.POTF,
      testCode: 'not a valid test code',
    },
  ];
  it.each(testCases)(
    'GIVEN data WHEN the test station is not present in the secrets and the toggle is not defined THEN the test station number is changed',
    (testCase) => {
      const { testStationType, testStationPNumber, testCode } = testCase;
      process.env.DISABLE_PROCESS_NON_MIGRATED_EVENTS = '';
      const mockRecord: TestResultModel = {
        noOfAxles: 2,
        testStationType,
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
            testCode,
            testTypeId: '1',
            testResult: 'fail',
            testTypeEndTimeStamp: '2019-01-14T10:36:33.987Z',
            testTypeStartTimeStamp: '2019-01-14T10:36:33.987Z',
            name: 'Annual test',
            testNumber: 'W084564',
          },
        ],
      };
      TEST_ACTIVITY = extractBillableTestResults(mockRecord, false);
      const EXPECTED_TEST_ACTIVITY: TestActivity = {
        noOfAxles: 2,
        testTypeStartTimestamp: '2019-01-14T10:36:33.987Z',
        testTypeEndTimestamp: '2019-01-14T10:36:33.987Z',
        testStationType,
        testCode,
        vin: 'XMGDE02FS0H012303',
        vrm: 'JY58FPP',
        testStationPNumber,
        testResult: 'fail',
        certificateNumber: '1234',
        testTypeName: 'Annual test',
        vehicleType: 'psv',
        testerName: 'Dorel',
        testerStaffId: '2',
        testResultId: '9',
      };
      expect(TEST_ACTIVITY).toContainEqual(EXPECTED_TEST_ACTIVITY);
    },
  );
  it.each(testCases)(
    'GIVEN data WHEN the test station is not present in the secrets and the toggle is defined THEN the events are not sent',
    (testCase) => {
      const { testStationType, testCode } = testCase;
      process.env.DISABLE_PROCESS_NON_MIGRATED_EVENTS = 'defined';
      const mockRecord: TestResultModel = {
        noOfAxles: 2,
        testStationType,
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
            testCode,
            testTypeId: '1',
            testResult: 'fail',
            testTypeEndTimeStamp: '2019-01-14T10:36:33.987Z',
            testTypeStartTimeStamp: '2019-01-14T10:36:33.987Z',
            name: 'Annual test',
            testNumber: 'W084564',
          },
        ],
      };
      TEST_ACTIVITY = extractBillableTestResults(mockRecord, false);
      expect(TEST_ACTIVITY).toHaveLength(0);
    },
  );
  it('GIVEN data WHEN the test station is not present in the secrets AND the toggle is not defined AND the test station is an ATF AND the test code is not in the list THEN activity is not generated', () => {
    process.env.DISABLE_PROCESS_NON_MIGRATED_EVENTS = '';
    const mockRecord: TestResultModel = {
      noOfAxles: 2,
      testStationType: TestStationType.ATF,
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
          testCode: 'not a valid test code',
          testTypeId: '1',
          testResult: 'fail',
          testTypeEndTimeStamp: '2019-01-14T10:36:33.987Z',
          testTypeStartTimeStamp: '2019-01-14T10:36:33.987Z',
          name: 'Annual test',
          testNumber: 'W084564',
        },
      ],
    };
    TEST_ACTIVITY = extractBillableTestResults(mockRecord, false);
    expect(TEST_ACTIVITY).toHaveLength(0);
  });
  it('GIVEN data WHEN the test station is not present in the secrets AND the toggle is not defined AND the test station is an ATF AND one test code is in the list and one is not THEN only one activity is generated', () => {
    process.env.DISABLE_PROCESS_NON_MIGRATED_EVENTS = '';
    const mockRecord: TestResultModel = {
      noOfAxles: 2,
      testStationType: TestStationType.ATF,
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
          testCode: 'not a valid test code',
          testTypeId: '1',
          testResult: 'fail',
          testTypeEndTimeStamp: '2019-01-14T10:36:33.987Z',
          testTypeStartTimeStamp: '2019-01-14T10:36:33.987Z',
          name: 'Annual test',
          testNumber: 'W084564',
        },
        {
          certificateNumber: '1234',
          testCode: ATF_OVERRIDE_TEST_TYPES[0],
          testTypeId: '1',
          testResult: 'fail',
          testTypeEndTimeStamp: '2019-01-14T10:36:33.987Z',
          testTypeStartTimeStamp: '2019-01-14T10:36:33.987Z',
          name: 'Annual test',
          testNumber: 'W084564',
        },
      ],
    };
    TEST_ACTIVITY = extractBillableTestResults(mockRecord, false);
    expect(TEST_ACTIVITY).toHaveLength(1);
    expect(TEST_ACTIVITY[0].testStationPNumber).toEqual(OverrideTestStations.ATF);
  });
});

describe('getOverrideTestStation', () => {
  it('GIVEN an GVTS test station THEN it returns the GTVS test station P Number', () => {
    expect(getOverrideTestStation(TestStationType.GVTS, 'foo')).toBe(OverrideTestStations.GVTS);
  });
  it('GIVEN an POTF test station THEN it returns the POTF test station P Number', () => {
    expect(getOverrideTestStation(TestStationType.POTF, 'foo')).toBe(OverrideTestStations.POTF);
  });

  it('GIVEN an ATF test station AND the test code is in the test codes to override THEN it returns the ATF test station P Number', () => {
    expect(getOverrideTestStation(TestStationType.ATF, ATF_OVERRIDE_TEST_TYPES[0])).toBe(OverrideTestStations.ATF);
  });
  it('GIVEN an ATF test station AND the test code is not in the test codes to override THEN it returns undefined', () => {
    expect(getOverrideTestStation(TestStationType.ATF, 'Not a valid test code')).toBeUndefined();
  });
  it('GIVEN an unknown test station type THEN it returns undefined', () => {
    expect(getOverrideTestStation(('foobar' as unknown) as TestStationType, 'foo')).toBeUndefined();
  });
});
