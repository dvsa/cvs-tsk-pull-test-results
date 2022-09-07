/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DynamoDBRecord } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { TestActivity } from './testActivity';
import { TestResultModel } from './testResult';

export const extractBillableTestResults = (record: DynamoDBRecord): TestActivity[] => {
  if (record.eventName === 'MODIFY' && isSameRecordDetails(record)) {
    return [];
  }
  const data = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as TestResultModel;

  const testActivities: TestActivity[] = data.testTypes
    .filter(() => data.testStatus !== 'cancelled')
    .map((testType) => ({
      noOfAxles: data.noOfAxles,
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

function isSameRecordDetails(record: DynamoDBRecord): boolean {
  const data = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as TestResultModel;
  const previousdata = DynamoDB.Converter.unmarshall(record.dynamodb.OldImage) as TestResultModel;

  if (data.testTypes.length !== previousdata.testTypes.length) {
    return false;
  }

  const currentTestTypeIdArray: string[] = data.testTypes.map((testType) => testType.testCode).sort();
  const previousTestTypeIdArray: string[] = previousdata.testTypes.map((testType) => testType.testCode).sort();

  const testTypeSame: boolean =
    currentTestTypeIdArray.every((val, idx) => val === previousTestTypeIdArray[idx]) &&
    currentTestTypeIdArray.length === previousTestTypeIdArray.length;

  return testTypeSame && data.testStationPNumber === previousdata.testStationPNumber;
}
