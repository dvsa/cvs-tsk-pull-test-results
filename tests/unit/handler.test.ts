/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { mocked } from 'ts-jest/utils';
import { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';
import { handler, getTestStationNumber } from '../../src/handler';
import { sendEvents } from '../../src/eventbridge/send';
import { SendResponse } from '../../src/eventbridge/SendResponse';
import { formatDynamoData } from '../../src/utils/dataFormatter';
import { TestActivity } from '../../src/utils/testActivity';
import { getSecret } from '../../src/utils/filterUtils';
import dynamoRecord from './data/dynamoEventWithCert.json';

jest.mock('../../src/eventbridge/send');
jest.mock('../../src/utils/dataFormatter');
jest.mock('../../src/utils/filterUtils');

describe('Application entry', () => {
  let event: DynamoDBStreamEvent;
  const filters: string[] = new Array<string>('100', 'P99006');
  mocked(formatDynamoData).mockReturnValue(Array<TestActivity>());
  mocked(getSecret).mockResolvedValue(filters);

  beforeEach(() => {
    event = {
      Records: [],
    };
  });

  afterEach(() => {
    jest.resetAllMocks().restoreAllMocks();
  });

  describe('Handler', () => {
    it('GIVEN a call to the function WHEN events are processed succesfully THEN a callback result is returned.', async () => {
      const mSendResponse: SendResponse = { SuccessCount: 1, FailCount: 0 };
      mocked(sendEvents).mockResolvedValue(mSendResponse);
      await handler(event, null, (error: string | Error, result: string) => {
        expect(result).toEqual('Data processed successfully.');
        expect(error).toBeNull();
      });
    });
    it('GIVEN a call to the function WHEN events are processed unsuccesfully THEN a callback error is returned.', async () => {
      mocked(sendEvents).mockRejectedValue(new Error('Oh no!'));
      await handler(event, null, (error: string | Error, result: string) => {
        expect(error).toEqual(new Error('Data processed unsuccessfully.'));
        expect(result).toBeUndefined();
      });
    });
  });
  describe('GetTestStationNumber', () => {
    it('GIVEN a valid record to the function WHEN getTestStationNumber is called THEN expect valid testStationPNumber to be returned', () => {
      const testStationPNumber = getTestStationNumber(dynamoRecord as DynamoDBRecord);
      expect(testStationPNumber).toEqual('P99006');
    });
  });
});
