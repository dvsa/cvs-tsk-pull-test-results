/* eslint-disable import/first */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
process.env.LOG_LEVEL = 'debug';
import { DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { EOL } from 'os';
import { mocked } from 'ts-jest/utils';
import { sendEvents } from '../../src/eventbridge/send';
import { SendResponse } from '../../src/eventbridge/SendResponse';
import { checkNonFilteredATF, eventHandler } from '../../src/eventHandler';
import { extractAmendedBillableTestResults } from '../../src/utils/extractAmendedBillableTestResults';
import { extractBillableTestResults } from '../../src/utils/extractTestResults';
import { getSecret } from '../../src/utils/filterUtils';

jest.mock('../../src/utils/filterUtils');
jest.mock('../../src/eventbridge/send');
jest.mock('../../src/utils/extractTestResults');
jest.mock('../../src/utils/extractAmendedBillableTestResults');

describe('eventHandler', () => {
  let event: DynamoDBStreamEvent;
  const filters = ['foo'];
  mocked(getSecret).mockResolvedValue(filters);
  mocked(extractBillableTestResults).mockReturnValue([]);
  mocked(extractAmendedBillableTestResults).mockReturnValue([]);
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('GIVEN an insert event THEN billable details should be extracted and event sent to eventbridge.', async () => {
    event = {
      Records: [
        {
          eventName: 'INSERT',
          dynamodb: {
            NewImage: {
              testStationPNumber: {
                S: 'foo',
              },
            },
          },
        },
      ],
    };
    const unmarshallSpy = jest.spyOn(DynamoDB.Converter, 'unmarshall');
    const mSendResponse: SendResponse = { SuccessCount: 1, FailCount: 0 };
    mocked(sendEvents).mockResolvedValue(mSendResponse);
    await eventHandler(event);
    expect(sendEvents).toHaveBeenCalledTimes(1);
    expect(unmarshallSpy).toHaveBeenCalledTimes(1);
    expect(extractBillableTestResults).toHaveBeenCalledTimes(1);
    expect(extractBillableTestResults).toHaveBeenCalledWith({ testStationPNumber: 'foo' });
  });
  it('GIVEN an modify event THEN billable details should be extracted and event sent to eventbridge.', async () => {
    event = {
      Records: [
        {
          eventName: 'MODIFY',
          dynamodb: {
            NewImage: {
              testStationPNumber: {
                S: 'foo',
              },
            },
            OldImage: {
              testStationPNumber: {
                S: 'bar',
              },
            },
          },
        },
      ],
    };
    const unmarshallSpy = jest.spyOn(DynamoDB.Converter, 'unmarshall');
    const mSendResponse: SendResponse = { SuccessCount: 1, FailCount: 0 };
    mocked(sendEvents).mockResolvedValue(mSendResponse);
    await eventHandler(event);
    expect(sendEvents).toHaveBeenCalledTimes(1);
    expect(unmarshallSpy).toHaveBeenCalledTimes(2);
    expect(extractAmendedBillableTestResults).toHaveBeenCalledTimes(1);
    expect(extractAmendedBillableTestResults).toHaveBeenCalledWith(
      { testStationPNumber: 'foo' },
      { testStationPNumber: 'bar' },
    );
  });
  it('GIVEN an unhandled event THEN error in logged to the console', async () => {
    event = ({
      Records: [
        {
          eventName: 'foo',
          dynamodb: {
            NewImage: {
              testStationPNumber: {
                S: 'foo',
              },
            },
          },
        },
      ],
    } as unknown) as DynamoDBStreamEvent;
    // @ts-ignore
    const consoleSpy = jest.spyOn(console._stdout, 'write');
    await eventHandler(event);
    expect(sendEvents).not.toHaveBeenCalled();
    expect(extractAmendedBillableTestResults).not.toHaveBeenCalled();
    expect(extractBillableTestResults).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(`error: Unhandled event {event: foo}${EOL}`);
  });
  it('GIVEN a handled event WHEN the event is sent as an unfiltered atf THEN a debug message is logged to the console', async () => {
    event = ({
      Records: [
        {
          eventName: 'foo',
          dynamodb: {
            NewImage: {
              testStationPNumber: {
                S: 'bar',
              },
            },
            OldImage: {
              testStationPNumber: {
                S: 'bar',
              },
            },
          },
        },
      ],
    } as unknown) as DynamoDBStreamEvent;
    // @ts-ignore
    const consoleSpy = jest.spyOn(console._stdout, 'write');
    await eventHandler(event);
    expect(sendEvents).not.toHaveBeenCalled();
    expect(extractAmendedBillableTestResults).not.toHaveBeenCalled();
    expect(extractBillableTestResults).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(`debug: Event not sent as non filtered ATF${EOL}`);
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
  it('should return false if the test station is not defined in the new image and the test station in the old image is not in the secrets', () => {
    const mockRecord = {
      dynamodb: { OldImage: { testStationPNumber: { S: 'foo' } } },
    } as DynamoDBRecord;
    const mockSecrets = ['foobar'];
    expect(checkNonFilteredATF(mockRecord, mockSecrets)).toBe(false);
  });
  it('should return false if the test station is not defined in the old image and the test station is not in the secrets', () => {
    const mockRecord = {
      dynamodb: { NewImage: { testStationPNumber: { S: 'foo' } } },
    } as DynamoDBRecord;
    const mockSecrets = ['foobar'];
    expect(checkNonFilteredATF(mockRecord, mockSecrets)).toBe(false);
  });
  it('should return true if the test station is not defined in the new image and the test station in the old image is in the secrets', () => {
    const mockRecord = {
      dynamodb: { OldImage: { testStationPNumber: { S: 'foo' } } },
    } as DynamoDBRecord;
    const mockSecrets = ['foo'];
    expect(checkNonFilteredATF(mockRecord, mockSecrets)).toBe(true);
  });
  it('should return true if the test station is not defined in the old image and the test station is in the secrets', () => {
    const mockRecord = {
      dynamodb: { NewImage: { testStationPNumber: { S: 'foo' } } },
    } as DynamoDBRecord;
    const mockSecrets = ['foo'];
    expect(checkNonFilteredATF(mockRecord, mockSecrets)).toBe(true);
  });
});
