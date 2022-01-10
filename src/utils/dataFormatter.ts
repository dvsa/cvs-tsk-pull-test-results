/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DynamoDBRecord } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { TestActivity } from './testActivity';

export const formatDynamoData = (record: DynamoDBRecord): TestActivity => {
  const data = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
  console.log(data);

  const testTypes = data.testTypes.sort((a, b) => Date.parse(a.lastUpdateAt as string) > Date.parse(b.lastUpdateAt as string));
  const latestTest = testTypes[0];

  const activityEvent: TestActivity = {
    noOfAxles: data.noOfAxles as number,
    testTypeStartTimestamp: data.testStartTimestamp,
    testTypeEndTimestamp: data.testEndTimestamp,
    testStationType: data.testStationType,
    testCode: latestTest.testCode,
    vin: data.vin,
    vrm: data.vrm,
    testStationPNumber: data.testStationPNumber,
    testResult: latestTest.testResult,
    certificateNumber: latestTest.certificateNumber,
    testTypeName: latestTest.name,
    vehicleType: data.vehicleType,
    testerName: data.testerName,
    testerStaffId: data.testerStaffId,
    testResultId: data.testResultId,
  };
  return activityEvent;
};
