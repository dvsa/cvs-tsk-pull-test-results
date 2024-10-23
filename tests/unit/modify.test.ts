/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-call */
import {
  SQSBatchResponse, SQSEvent, SQSMessageAttributes, SQSRecordAttributes,
} from 'aws-lambda';

process.env.LOG_LEVEL = 'debug';
import { mocked } from 'jest-mock';
import { handler } from '../../src/modify';
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
      process.env.PROCESS_MODIFY_EVENTS = 'true';
      mocked(eventHandler).mockReturnValue(Promise.resolve({ batchItemFailures: [] } as SQSBatchResponse));
      await handler(mockEvent, null, (error: string | Error, result: string) => {
        expect(error).toBeNull();
        expect(result).toBe('Data processed successfully.');
      });
      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(mockEvent);
    });

    it('GIVEN an event WHEN the eventHandler throws an THEN a callback error is returned', async () => {
      process.env.PROCESS_MODIFY_EVENTS = 'true';
      mocked(eventHandler).mockReturnValue(Promise.reject());
      await handler(mockEvent, null, (error: string | Error, result: string) => {
        expect(error).toEqual(new Error('Data processed unsuccessfully.'));
        expect(result).toBeUndefined();
      });
      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(mockEvent);
    });

    it("GIVEN an event WHEN the environment variable PROCESS_MODIFY_EVENTS is not set to 'true' THEN a callback result is returned AND the eventHandler is not called", async () => {
      process.env.PROCESS_MODIFY_EVENTS = 'false';
      mocked(eventHandler).mockReturnValue(Promise.resolve({ batchItemFailures: [] } as SQSBatchResponse));
      await handler(mockEvent, null, (error: string | Error, result: string) => {
        expect(error).toBeNull();
        expect(result).toBe('Data processed successfully.');
      });
      expect(eventHandler).not.toHaveBeenCalled();
    });
  });
});
