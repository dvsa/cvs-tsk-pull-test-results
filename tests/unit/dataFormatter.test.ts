/* eslint-disable @typescript-eslint/comma-dangle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable quote-props */
import { DynamoDBRecord } from 'aws-lambda';
import { formatDynamoData } from '../../src/utils/dataFormatter';
import { TestActivity } from '../../src/utils/testActivity';
import dynamoEventWOCert from './data/dynamoEventWithoutCert.json';
import dynamoEventWCert from './data/dynamoEventWithCert.json';
import dynamoEventMultipleTests from './data/dynamoEventMultipleTestTypes.json';

describe('DataFormatter', () => {
  let DYNAMO_DATA: DynamoDBRecord;
  let TEST_ACTIVITY: TestActivity[];

  describe('formatDynamoData', () => {
    it(`GIVEN test result WITHOUT certificate number issued WHEN data is formatted into event THEN event doesn't have certificate number`, () => {
      DYNAMO_DATA = dynamoEventWOCert as DynamoDBRecord;
      TEST_ACTIVITY = formatDynamoData(DYNAMO_DATA);
      const EXPECTED_TEST_AVTIVITY: TestActivity = {
        noOfAxles: 2,
        testTypeStartTimestamp: '2019-01-14T10:36:33.987Z',
        testTypeEndTimestamp: '2019-01-14T10:36:33.987Z',
        testStationType: 'gvts',
        testCode: 'aas',
        vin: 'XMGDE02FS0H012303',
        vrm: 'JY58FPP',
        testStationPNumber: 'P99006',
        testResult: 'fail',
        testTypeName: 'Annual test',
        vehicleType: 'psv',
        testerName: 'Dorel',
        testerStaffId: '2',
        testResultId: '9',
      };
      expect(TEST_ACTIVITY).toContainEqual(EXPECTED_TEST_AVTIVITY);
    });
    it(`GIVEN test result WITH certificate number issued WHEN data is formatted into event THEN event has certificate number`, () => {
      DYNAMO_DATA = dynamoEventWCert as DynamoDBRecord;
      TEST_ACTIVITY = formatDynamoData(DYNAMO_DATA);
      const EXPECTED_TEST_AVTIVITY: TestActivity = {
        noOfAxles: 2,
        testTypeStartTimestamp: '2019-01-14T10:36:33.987Z',
        testTypeEndTimestamp: '2019-01-14T10:36:33.987Z',
        testStationType: 'gvts',
        testCode: 'aas',
        vin: 'XMGDE02FS0H012303',
        vrm: 'JY58FPP',
        testStationPNumber: 'P99006',
        testResult: 'fail',
        certificateNumber: '1234',
        testTypeName: 'Annual test',
        vehicleType: 'psv',
        testerName: 'Dorel',
        testerStaffId: '2',
        testResultId: '9',
      };
      expect(TEST_ACTIVITY).toContainEqual(EXPECTED_TEST_AVTIVITY);
    });
    it(`GIVEN two test types WHEN data is formated into events THEN expect two events to be generated within an array`, () => {
      DYNAMO_DATA = dynamoEventMultipleTests as DynamoDBRecord;
      TEST_ACTIVITY = formatDynamoData(DYNAMO_DATA);
      expect(TEST_ACTIVITY.length).toEqual(2);
    });
  });
});
