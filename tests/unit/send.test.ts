/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { EventBridge, Request } from 'aws-sdk';
import { mocked } from 'ts-jest/utils';
import { PutEventsResponse, PutEventsRequest, PutEventsResultEntry } from 'aws-sdk/clients/eventbridge';
import { sendEvents } from '../../src/eventbridge/send';
import { SendResponse } from '../../src/eventbridge/SendResponse';
import { TestActivity } from '../../src/utils/testActivity';

jest.mock('aws-sdk', () => {
  const mEventBridgeInstance = {
    putEvents: jest.fn(),
  };
  const mRequestInstance = {
    promise: jest.fn(),
  };
  const mEventBridge = jest.fn(() => mEventBridgeInstance);
  const mRequest = jest.fn(() => mRequestInstance);

  return { EventBridge: mEventBridge, Request: mRequest };
});

type PutEventsWithParams = (params: PutEventsRequest) => AWS.Request<PutEventsResponse, AWS.AWSError>;

const mEventBridgeInstance = new EventBridge();
const mResultInstance = new Request<PutEventsResponse, AWS.AWSError>(null, null);
const mPutEventsResponse = { Entries: Array<PutEventsResultEntry>(1) };
// eslint-disable-next-line @typescript-eslint/unbound-method
mocked(mEventBridgeInstance.putEvents as PutEventsWithParams).mockImplementation(
  (params: PutEventsRequest): AWS.Request<PutEventsResponse, AWS.AWSError> => {
    if (params.Entries[0].Detail.includes('\\"testResultId\\":\\"HandledError\\"')) {
      mPutEventsResponse.Entries[0] = { ErrorMessage: 'Failed to process event.' };
    } else {
      mPutEventsResponse.Entries[0] = { EventId: '2468' };
    }

    if (params.Entries[0].Detail.includes('\\"testResultId\\":\\"UnhandledError\\"')) {
      mResultInstance.promise = jest.fn().mockReturnValue(Promise.reject(new Error('Oh no!')));
    } else {
      mResultInstance.promise = jest.fn().mockReturnValue(Promise.resolve(mPutEventsResponse));
    }

    return mResultInstance;
  },
);

describe('Send events', () => {
  describe('Events sent', () => {
    // @ts-ignore
    const consoleSpy = jest.spyOn(console._stdout, 'write');

    it('GIVEN one event to send WHEN sent THEN one event is returned.', async () => {
      const mTestResult: TestActivity[] = [createTestResult()];
      const mSendResponse: SendResponse = { SuccessCount: 1, FailCount: 0 };
      await expect(sendEvents(mTestResult)).resolves.toEqual(mSendResponse);
    });

    it('GIVEN two events to send WHEN sent THEN two events are returned and two infos logged.', async () => {
      const mTestResult: TestActivity[] = [
        createTestResult('Result1'),
        createTestResult('Result2'),
      ];
      const mSendResponse: SendResponse = { SuccessCount: 2, FailCount: 0 };
      await expect(sendEvents(mTestResult)).resolves.toEqual(mSendResponse);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `info: Result sent to eventbridge (testResultId: 'Result1', vin: '${mTestResult[0].vin}')`,
        ),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `info: Result sent to eventbridge (testResultId: 'Result2', vin: '${mTestResult[0].vin}')`,
        ),
      );
    });

    it('GIVEN event WHEN test that has not been completed THEN log info message and error', async () => {
      const mTestResult: TestActivity[] = [createTestResult('HandledError')];
      await sendEvents(mTestResult);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `info: Failed to send result to eventbridge (testResultId: '${mTestResult[0].testResultId}', vin: '${mTestResult[0].vin}')`,
        ),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Error: Failed to process event.',
        ),
      );
    });

    it('GIVEN an issue with eventbridge WHEN 5 events are sent and 1 fails THEN the failure is in the response.', async () => {
      const mTestResult: TestActivity[] = [
        createTestResult(),
        createTestResult(),
        createTestResult(),
        createTestResult(),
        createTestResult('UnhandledError'),
      ];
      const mSendResponse: SendResponse = { SuccessCount: 4, FailCount: 1 };
      await expect(sendEvents(mTestResult)).resolves.toEqual(mSendResponse);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Error: Oh no!',
        ),
      );
    });
  });
});

function createTestResult(resultId?: string): TestActivity {
  const activityEvent: TestActivity = {
    noOfAxles: 0,
    testTypeStartTimestamp: '',
    testTypeEndTimestamp: '',
    testStationType: '',
    testCode: '',
    vin: '4321',
    vrm: '',
    testStationPNumber: '',
    testResult: '',
    certificateNumber: '',
    testTypeName: '',
    vehicleType: '',
    testerName: '',
    testerStaffId: '',
    testResultId: resultId || '1234',
  };
  return activityEvent;
}
