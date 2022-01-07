import DynamoDBStreamEvent from 'aws-lambda';
import logger from '../observability/logger';
import TestActivity from './testActivity';

export const dataFormatter = (record): TestActivity => {
    const data = record.dynamodb;

    const activityEvent: TestActivity = {
        noOfAxles: data.noOfAxles,
        testTypeStartTimestamp: data.testTypeStartTimestamp,
        testTypeEndTimestamp: data.testTypeEndTimestamp,
        testStationType: data.testStationType,
        testCode: data.testCode,
        vin: data.vin,
        vrm: data.vrm,
        testStationPNumber: data.testStationPNumber,
        testResult: data.testResult,
        certificateNumber: data.certificateNumber,
        testTypeName: data.testTypeName,
        vehicleType: data.vehicleType,
        testerName: data.testerName,
        testerStaffId: data.testerStaffId,
        testResultId: data.testResultId
    }
    return activityEvent;
}