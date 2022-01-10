/* eslint-disable @typescript-eslint/comma-dangle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable quote-props */
import { DynamoDBRecord } from 'aws-lambda';
import { formatDynamoData } from '../../src/utils/dataFormatter';
import { TestActivity } from '../../src/utils/testActivity';
import dynamoEvent from './data/dynamoEvent.json';

describe('DataFormatter', () => {
  let DYNAMO_DATA: DynamoDBRecord;
  let TEST_AVTIVITY: TestActivity;

  beforeEach(() => {
    DYNAMO_DATA = dynamoEvent as DynamoDBRecord;
    TEST_AVTIVITY = formatDynamoData(DYNAMO_DATA);
  });

  describe('formatDynamoData', () => {
    it('should return a correctly formatted test activity with latest test result information', () => {
      const EXPECTED_TEST_AVTIVITY: TestActivity = {
        noOfAxles: 2,
        testTypeStartTimestamp: '2019-01-14T10:36:33.987Z',
        testTypeEndTimestamp: '2019-01-14T10:36:33.987Z',
        testStationType: 'gvts',
        testCode: 'aas',
        vin: 'XMGDE02FS0H012303',
        vrm: 'JY58FPP',
        testStationPNumber: 'P99006',
        testResult: 'pass',
        certificateNumber: '1234',
        testTypeName: 'Annual test',
        vehicleType: 'psv',
        testerName: 'Dorel',
        testerStaffId: '2',
        testResultId: '9',
      };
      expect(TEST_AVTIVITY).toEqual(EXPECTED_TEST_AVTIVITY);
    });
  });
});
