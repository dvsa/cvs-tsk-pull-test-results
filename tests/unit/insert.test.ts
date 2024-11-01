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
    it('GIVEN an event WHEN the eventHandler throws an error THEN return the sqsBatchResponse with failed records', async () => {
      mocked(eventHandler).mockReturnValue(Promise.resolve({ batchItemFailures: [{ itemIdentifier: 'test' }] } as SQSBatchResponse));
      const sqsBatchResponse = await handler(mockEvent);
      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(mockEvent);
      expect(sqsBatchResponse.batchItemFailures.length).toBeGreaterThan(0);
    });
  });
});
