/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
process.env.LOG_LEVEL = 'debug';
import { mocked } from 'ts-jest/utils';
import { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';
import { EOL } from 'os';
import { handler, getTestStationNumber } from '../../src/handler';
import { sendEvents } from '../../src/eventbridge/send';
import { SendResponse } from '../../src/eventbridge/SendResponse';
import { extractBillableTestResults } from '../../src/utils/extractTestResults';
import { TestActivity } from '../../src/utils/testActivity';
import { getSecret } from '../../src/utils/filterUtils';
import dynamoRecordFiltered from './data/dynamoEventWithCert.json';
import dynamoRecordNonFiltered from './data/dynamoEventWithoutCert.json';

jest.mock('../../src/eventbridge/send');
jest.mock('../../src/utils/extractTestResults');
jest.mock('../../src/utils/filterUtils');

describe('Application entry', () => {
  let event: DynamoDBStreamEvent;
  const filters: string[] = new Array<string>('100', 'P99006');
  mocked(extractBillableTestResults).mockReturnValue(Array<TestActivity>());
  mocked(getSecret).mockResolvedValue(filters);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Handler', () => {
    it('GIVEN event with filtered PNumber WHEN events are processed succesfully THEN a callback result is returned.', async () => {
      event = {
        Records: [dynamoRecordFiltered as DynamoDBRecord],
      };
      const mSendResponse: SendResponse = { SuccessCount: 1, FailCount: 0 };
      mocked(sendEvents).mockResolvedValue(mSendResponse);
      await handler(event, null, (error: string | Error, result: string) => {
        expect(result).toEqual('Data processed successfully.');
        expect(error).toBeNull();
        expect(sendEvents).toBeCalledTimes(1);
      });
    });
    it('GIVEN event with filtered PNumber WHEN events are processed unsuccesfully THEN a callback error is returned.', async () => {
      event = {
        Records: [dynamoRecordFiltered as DynamoDBRecord],
      };
      mocked(sendEvents).mockRejectedValue(new Error('Oh no!'));
      await handler(event, null, (error: string | Error, result: string) => {
        expect(error).toEqual(new Error('Data processed unsuccessfully.'));
        expect(result).toBeUndefined();
        expect(sendEvents).toBeCalledTimes(1);
      });
    });
    it('GIVEN event with non filtered PNumber WHEN events are processed THEN log outputted.', async () => {
      event = {
        Records: [dynamoRecordNonFiltered as DynamoDBRecord],
      };
      // @ts-ignore
      const consoleSpy = jest.spyOn(console._stdout, 'write');
      await handler(event, null, (error: string | Error, result: string) => {
        expect(error).toBeNull();
        expect(result).toEqual('Data processed successfully.');
        expect(consoleSpy).toHaveBeenNthCalledWith(2, `debug: Event not sent as non filtered ATF { PNumber: P99005 }${EOL}`);
      });
    });
  });
  describe('GetTestStationNumber', () => {
    it('GIVEN a valid record to the function WHEN getTestStationNumber is called THEN expect valid testStationPNumber to be returned', () => {
      const testStationPNumber = getTestStationNumber(dynamoRecordFiltered as DynamoDBRecord);
      expect(testStationPNumber).toEqual('P99006');
    });
  });
});
