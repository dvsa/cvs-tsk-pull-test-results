/* eslint-disable @typescript-eslint/comma-dangle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable quote-props */
import { DynamoDBRecord } from 'aws-lambda';
import { extractBillableTestResults } from '../../src/utils/extractTestResults';
import { TestActivity } from '../../src/utils/testActivity';
import dynamoEventWOCert from './data/dynamoEventWithoutCert.json';
import dynamoEventWCert from './data/dynamoEventWithCert.json';
import dynamoEventMultipleTests from './data/dynamoEventMultipleTestTypes.json';
import dynamoEventCancelled from './data/dynamoEventCancelled.json';

describe('extractTestResults', () => {
  let DYNAMO_DATA: DynamoDBRecord;
  let TEST_ACTIVITY: TestActivity[];

  it(`GIVEN data WITHOUT a certificate number issued WHEN the test result is extracted into an event THEN the event doesn't have a certificate number`, () => {
    DYNAMO_DATA = dynamoEventWOCert as DynamoDBRecord;
    TEST_ACTIVITY = extractBillableTestResults(DYNAMO_DATA);
    const EXPECTED_TEST_AVTIVITY: TestActivity = {
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
    expect(TEST_ACTIVITY).toContainEqual(EXPECTED_TEST_AVTIVITY);
  });

  it(`GIVEN data WITH a certificate number issued WHEN the test result is extracted into an event THEN the event has certificate number`, () => {
    DYNAMO_DATA = dynamoEventWCert as DynamoDBRecord;
    TEST_ACTIVITY = extractBillableTestResults(DYNAMO_DATA);
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

  it(`GIVEN data with two test types WHEN test results are extracted into events THEN expect two events to be generated`, () => {
    DYNAMO_DATA = dynamoEventMultipleTests as DynamoDBRecord;
    TEST_ACTIVITY = extractBillableTestResults(DYNAMO_DATA);
    expect(TEST_ACTIVITY).toHaveLength(2);
  });

  it(`GIVEN data WHEN it has a status of cancelled THEN expect no events to be generated`, () => {
    DYNAMO_DATA = dynamoEventCancelled as DynamoDBRecord;
    TEST_ACTIVITY = extractBillableTestResults(DYNAMO_DATA);
    expect(TEST_ACTIVITY).toHaveLength(0);
  });
});
