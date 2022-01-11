/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DynamoDBRecord } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { TestActivity } from './testActivity';

export const formatDynamoData = (record: DynamoDBRecord): TestActivity[] => {
  const data = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
  console.log(data);

  const testActivities: Array<TestActivity> = [];

  data.testTypes.forEach((testType) => {
    const activityEvent: TestActivity = {
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
    };
    testActivities.push(activityEvent);
  });
  return testActivities;
};
