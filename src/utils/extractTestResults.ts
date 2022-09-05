/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DynamoDBRecord } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { DateTime } from 'luxon';
import { TestActivity } from './testActivity';
import { MCRequest } from './MCRequest';

export const extractBillableTestResults = (record: DynamoDBRecord): TestActivity[] => {
  const data = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
  const testActivities: TestActivity[] = data.testTypes
    .filter(() => data.testStatus !== 'cancelled')
    .map((testType) => ({
      noOfAxles: data.noOfAxles as number,
      testTypeStartTimestamp: data.testStartTimestamp,
      testTypeEndTimestamp: data.testEndTimestamp,
      testStationType: data.testStationType,
      testCode: testType.testCode,
      vin: data.vin,
      vrm: data.vrm,
      testStationPNumber: data.testStationPNumber,
      testResult: testType.testResult,
      certificateNumber: testType.certificateNumber,
      testTypeName: testType.name,
      vehicleType: data.vehicleType,
      testerName: data.testerName,
      testerStaffId: data.testerStaffId,
      testResultId: data.testResultId,
    }));
  return testActivities;
};

/**
 * This is used to extract the relevant fields from the test record that is
 * required to be sent to MC in order to  clear prohibitions
 * @param record
 */
export const extractMCTestResults = (record: DynamoDBRecord): MCRequest[] => {
  try {
    console.log('Extracting the fields for MC prohibition clearance from dynamo record');
    const data = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
    const mcRequest: MCRequest[] = data.testTypes
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .filter((x) => x.testTypeName.toLowerCase().includes('prohibition clearance'))
      .filter((x) => (x.testResult === ('pass') || x.testResult === ('prs')))
      .filter(() => data.testStatus === 'submitted')
      .map((x) => ({
        vehicleIdentifier: data.vrm,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        testDate: isoDateFormatter(x.testTypeEndTimestamp),
        vin: data.vin,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        testResult: calculateTestResult(x),
        hgvPsvTrailFlag: data.vehicleType.toUpperCase(),
      }));
    return mcRequest;
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`ERROR ${e}`);
    return [];
  }
};

/**
 * This method is used to change th e test result to be a single, uppercase character
 * @param testActivity
 */
export const calculateTestResult = (testActivity: TestActivity): string => {
  console.log('Converting the test result into a single character.');
  return testActivity.testResult.toLowerCase() === 'pass' ? 'S' : 'R';
  // if(testActivity.testResult.toLowerCase() == 'pass') {
  //   return 'S'
  // } else if (testActivity.testResult.toLowerCase() == 'pass')
  //   case 'prs':
  //     return 'R';
  // default:
  //   return '';
  // }
};

/**
 * This method is used to change the format of an iso string to be formatted as yyyy/MM/dd
 * @param date
 */
export const isoDateFormatter = (date: string): string => {
  console.log('entered iso date formatter');
  return DateTime.fromISO(date).toFormat('dd/MM/yyyy');
};
