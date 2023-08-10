/* eslint-disable import/first */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
process.env.LOG_LEVEL = 'debug';
import { DynamoDBStreamEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { EOL } from 'os';
import { mocked } from 'ts-jest/utils';
import { sendEvents } from '../../src/eventbridge/send';
import { SendResponse, EventType } from '../../src/interfaces/EventBridge';
import { eventHandler } from '../../src/eventHandler';
import { extractAmendedBillableTestResults } from '../../src/utils/extractAmendedBillableTestResults';
import { extractBillableTestResults } from '../../src/utils/extractTestResults';
import { TypeOfTest } from '../../src/interfaces/TestResult';

jest.mock('../../src/eventbridge/send');
jest.mock('../../src/utils/extractTestResults');
jest.mock('../../src/utils/extractAmendedBillableTestResults');

describe('eventHandler', () => {
  let event: DynamoDBStreamEvent;
  mocked(extractBillableTestResults).mockReturnValue([]);
  mocked(extractAmendedBillableTestResults).mockReturnValue([]);
  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ['VTA', undefined, EventType.COMPLETION],
    ['contingency', TypeOfTest.CONTINGENCY, EventType.CONTINGENCY],
    ['desk based', TypeOfTest.DESK_BASED, EventType.DESK_BASED],
  ])(
    'GIVEN %p test result insert THEN billable details should be extracted and event sent to eventbridge.',
    async (_scenario, typeOfTest, eventType) => {
      if (typeOfTest === TypeOfTest.CONTINGENCY) process.env.PROCESS_DESK_BASED_TESTS = 'true';
      event = {
        Records: [
          {
            eventName: 'INSERT',
            dynamodb: {
              NewImage: {
                testStationPNumber: {
                  S: 'foo',
                },
                typeOfTest: typeOfTest
                  ? {
                    S: typeOfTest,
                  }
                  : undefined,
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
      expect(sendEvents).toHaveBeenCalledWith([], eventType);
      expect(unmarshallSpy).toHaveBeenCalledTimes(1);
      expect(extractBillableTestResults).toHaveBeenCalledTimes(1);
      expect(extractBillableTestResults).toHaveBeenCalledWith({ testStationPNumber: 'foo', typeOfTest });
    },
  );
  it('GIVEN a desk based test result insert WHEN feature toggle is set to false THEN dont handle event', async () => {
    process.env.PROCESS_DESK_BASED_TESTS = 'false';
    event = {
      Records: [
        {
          eventName: 'INSERT',
          dynamodb: {
            NewImage: {
              testStationPNumber: {
                S: 'foo',
              },
              typeOfTest: {
                S: 'desk-based',
              },
            },
          },
        },
      ],
    };
    const unmarshallSpy = jest.spyOn(DynamoDB.Converter, 'unmarshall');
    await eventHandler(event);
    expect(unmarshallSpy).toHaveBeenCalledTimes(1);
    expect(sendEvents).toHaveBeenCalledTimes(0);
    expect(extractBillableTestResults).toHaveBeenCalledTimes(0);
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

  it.each([
    ['MODIFY', 'INSERT', 'true', 2],
    ['MODIFY', 'INSERT', 'false', 1],
    ['INSERT', 'INSERT', 'true', 2],
    ['INSERT', 'INSERT', 'false', 1],
  ])(
    'GIVEN a handled event contains a contingency %p stream event and a desk-based test %p stream event WHEN PROCESS_DESK_BASED_TESTS is set to %p THEN %p event should be processed',
    async (eventName1, eventName2, processDeskBasedTests, eventsProcessed) => {
      process.env.PROCESS_DESK_BASED_TESTS = processDeskBasedTests;
      event = ({
        Records: [
          {
            eventName: eventName1,
            dynamodb: {
              NewImage: {
                testStationPNumber: {
                  S: 'foo',
                },
                typeOfTest: {
                  S: 'contingency',
                },
              },
              OldImage: {
                testStationPNumber: {
                  S: 'foo',
                },
                typeOfTest: {
                  S: 'contingency',
                },
              },
            },
          },
          {
            eventName: eventName2,
            dynamodb: {
              NewImage: {
                testStationPNumber: {
                  S: 'foo',
                },
                typeOfTest: {
                  S: 'desk-based',
                },
              },
            },
          },
        ],
      } as unknown) as DynamoDBStreamEvent;
      const mSendResponse: SendResponse = { SuccessCount: eventsProcessed, FailCount: 0 };
      mocked(sendEvents).mockResolvedValue(mSendResponse);

      await eventHandler(event);
      expect(sendEvents).toHaveBeenCalledTimes(eventsProcessed);
    },
  );
});
