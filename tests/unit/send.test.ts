/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { EventBridge, Request } from 'aws-sdk';
import { mocked } from 'ts-jest/utils';
import { PutEventsResponse, PutEventsRequest, PutEventsResultEntry } from 'aws-sdk/clients/eventbridge';
import { EOL } from 'os';
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
// eslint-disable-next-line @typescript-eslint/unbound-method
mocked(mEventBridgeInstance.putEvents as PutEventsWithParams).mockImplementation(
  (params: PutEventsRequest): AWS.Request<PutEventsResponse, AWS.AWSError> => {
    const mPutEventsResponse: PutEventsResponse = {
      FailedEntryCount: 0,
      Entries: Array<PutEventsResultEntry>(params.Entries.length),
    };
    if (
      params.Entries[0].Detail
      === '{ "testResult": "{\\"noOfAxles\\":-1,\\"testTypeStartTimestamp\\":\\"\\",\\"testTypeEndTimestamp\\":\\"A\\",\\"testStationType\\":\\"\\",\\"testCode\\":\\"\\",\\"vin\\":\\"\\",\\"vrm\\":\\"\\",\\"testStationPNumber\\":\\"\\",\\"testResult\\":\\"\\",\\"certificateNumber\\":\\"\\",\\"testTypeName\\":\\"\\",\\"vehicleType\\":\\"\\",\\"testerName\\":\\"\\",\\"testerStaffId\\":\\"\\",\\"testResultId\\":\\"\\"}" }'
    ) {
      mResultInstance.promise = jest.fn().mockReturnValue(Promise.reject(new Error('Oh no!')));
    } else {
      mResultInstance.promise = jest.fn().mockReturnValue(Promise.resolve(mPutEventsResponse));
    }
    return mResultInstance;
  },
);

describe('Send events', () => {
  describe('Events sent', () => {
    it('GIVEN one event to send WHEN sent THEN one event is returned.', async () => {
      const mTestResult: TestActivity[] = [createTestResult(0, 'A Real Date!')];
      const mSendResponse: SendResponse = { SuccessCount: 1, FailCount: 0 };
      await expect(sendEvents(mTestResult)).resolves.toEqual(mSendResponse);
    });

    it('GIVEN two events to send WHEN sent THEN two events are returned.', async () => {
      const mTestResult: TestActivity[] = [
        createTestResult(0, 'A Real Date!'),
        createTestResult(0, 'Another real Date!'),
      ];
      const mSendResponse: SendResponse = { SuccessCount: 2, FailCount: 0 };
      await expect(sendEvents(mTestResult)).resolves.toEqual(mSendResponse);
    });

    it('GIVEN event WHEN test that has not been completed THEN log info message', async () => {
      // @ts-ignore
      const consoleSpy = jest.spyOn(console._stdout, 'write');
      const mTestResult: TestActivity[] = [createTestResult(0)];
      await sendEvents(mTestResult);
      expect(consoleSpy).toHaveBeenCalledWith(`info: Event not sent as test is not completed { ID:  }${EOL}`);
    });

    it('GIVEN an issue with eventbridge WHEN 6 events are sent and 1 fails THEN the failure is in the response.', async () => {
      const mTestResult: TestActivity[] = [
        createTestResult(0, 'A Real Date!'),
        createTestResult(0, 'A Real Date!'),
        createTestResult(0, 'A Real Date!'),
        createTestResult(0, 'A Real Date!'),
        createTestResult(-1, 'A'),
      ];
      const mSendResponse: SendResponse = { SuccessCount: 4, FailCount: 1 };
      await expect(sendEvents(mTestResult)).resolves.toEqual(mSendResponse);
    });
  });
});

function createTestResult(axels?: number, testTypeEndTimestamp?: string): TestActivity {
  const activityEvent: TestActivity = {
    noOfAxles: axels || 0,
    testTypeStartTimestamp: '',
    testTypeEndTimestamp: testTypeEndTimestamp || '',
    testStationType: '',
    testCode: '',
    vin: '',
    vrm: '',
    testStationPNumber: '',
    testResult: '',
    certificateNumber: '',
    testTypeName: '',
    vehicleType: '',
    testerName: '',
    testerStaffId: '',
    testResultId: '',
  };
  return activityEvent;
}
