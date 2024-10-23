import {
  SQSBatchResponse, SQSEvent, SQSMessageAttributes, SQSRecordAttributes,
} from 'aws-lambda';

process.env.LOG_LEVEL = 'debug';
import { mocked } from 'jest-mock';
import { handler } from '../../src/insert';
import { eventHandler } from '../../src/eventHandler';

jest.mock('../../src/eventHandler');

describe('Application entry', () => {
  const mockEvent : SQSEvent = {
    Records: [
      {
        awsRegion: 'bar',
        eventSource: '',
        eventSourceARN: '',
        md5OfBody: '',
        messageId: 'test',
        receiptHandle: 'test',
        attributes: {} as SQSRecordAttributes,
        messageAttributes: {} as SQSMessageAttributes,
        body: JSON.stringify({
          eventName: 'foobar',
          dynamodb: {
            NewImage: {
              testStationPNumber: {
                S: 'foo',
              },
            },
          },
        }),
      },
    ],
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Handler', () => {
    it('GIVEN an event WHEN the eventHandler resolves THEN a callback result is returned', async () => {
      mocked(eventHandler).mockReturnValue(Promise.resolve({ batchItemFailures: [] } as SQSBatchResponse));
      await handler(mockEvent, null, (error: string | Error, result: string) => {
        expect(error).toBeNull();
        expect(result).toBe('Data processed successfully.');
      });
      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(mockEvent);
    });

    it('GIVEN an event WHEN the eventHandler throws an error THEN a call back error is returned and', async () => {
      mocked(eventHandler).mockReturnValue(Promise.reject());
      await handler(mockEvent, null, (error: string | Error, result: string) => {
        expect(error).toEqual(new Error('Data processed unsuccessfully.'));
        expect(result).toBeUndefined();
      });
      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(mockEvent);
    });
  });
});
