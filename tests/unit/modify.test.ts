/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
process.env.LOG_LEVEL = 'debug';
import { mocked } from 'ts-jest/utils';
import { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';
import { checkNonFilteredATF, handler } from '../../src/modify';
import { sendModifyEvents } from '../../src/eventbridge/sendmodify';
import { SendResponse } from '../../src/eventbridge/SendResponse';
import { getSecret } from '../../src/utils/filterUtils';
import dynamoRecordFiltered from './data/CREATE/dynamoEventWithCertCreate.json';
import { formatModifyPayload } from '../../src/utils/compareTestResults';
import { Differences } from '../../src/utils/differences';

jest.mock('../../src/eventbridge/sendmodify');
jest.mock('../../src/utils/compareTestResults');
jest.mock('../../src/utils/filterUtils');

describe('Application entry', () => {
  let event: DynamoDBStreamEvent;
  const filters: string[] = new Array<string>('100', 'P99006');
  mocked(formatModifyPayload).mockReturnValue(Array<Differences>());
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
      mocked(sendModifyEvents).mockResolvedValue(mSendResponse);
      await handler(event, null, (error: string | Error, result: string) => {
        expect(result).toEqual('Data processed successfully.');
        expect(error).toBeNull();
        expect(sendModifyEvents).toBeCalledTimes(1);
      });
    });
    it('GIVEN event with filtered PNumber WHEN events are processed unsuccesfully THEN a callback error is returned.', async () => {
      event = {
        Records: [dynamoRecordFiltered as DynamoDBRecord],
      };
      mocked(sendModifyEvents).mockRejectedValue(new Error('Oh no!'));
      await handler(event, null, (error: string | Error, result: string) => {
        expect(error).toEqual(new Error('Data processed unsuccessfully.'));
        expect(result).toBeUndefined();
        expect(sendModifyEvents).toBeCalledTimes(1);
      });
    });
  });

  describe('checkNonFilteredATF', () => {
    it('should return true if the current station is in the secrets', () => {
      const mockRecord = { dynamodb: { NewImage: { testStationPNumber: { S: 'foo' } } } } as DynamoDBRecord;
      const mockSecrets = ['foo'];
      expect(checkNonFilteredATF(mockRecord, mockSecrets)).toBe(true);
    });
    it('should return true if the previous station is in the secrets', () => {
      const mockRecord = {
        dynamodb: { OldImage: { testStationPNumber: { S: 'foo' } }, NewImage: { testStationPNumber: { S: 'bar' } } },
      } as DynamoDBRecord;
      const mockSecrets = ['foo'];
      expect(checkNonFilteredATF(mockRecord, mockSecrets)).toBe(true);
    });

    it('should return false if the current and the previous station are not in the secrets', () => {
      const mockRecord = {
        dynamodb: { OldImage: { testStationPNumber: { S: 'foo' } }, NewImage: { testStationPNumber: { S: 'bar' } } },
      } as DynamoDBRecord;
      const mockSecrets = ['foobar'];
      expect(checkNonFilteredATF(mockRecord, mockSecrets)).toBe(false);
    });
  });
});
