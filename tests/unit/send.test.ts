/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable jest/unbound-method */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-assignment */
import {
  EventBridgeClient, PutEventsCommand, PutEventsCommandInput, PutEventsCommandOutput, PutEventsResultEntry,
} from '@aws-sdk/client-eventbridge';
import { mockClient } from 'aws-sdk-client-mock';
import { SendResponse, EventType } from '../../src/interfaces/EventBridge';
import { TestActivity } from '../../src/interfaces/TestActivity';
import { sendEvents } from '../../src/eventbridge/send';
import { TestAmendment } from '../../src/interfaces/TestAmendment';

const mEventBridgeInstance = mockClient(EventBridgeClient);

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
mEventBridgeInstance.on(PutEventsCommand).callsFake(
  (params: PutEventsCommandInput): PutEventsCommandOutput => {
    const mPutEventsResponse: PutEventsCommandOutput = {
      FailedEntryCount: 0,
      Entries: Array<PutEventsResultEntry>(params.Entries.length),
      $metadata: undefined,
    };
    if (params.Entries[0].Detail.includes('\\":\\"HandledError\\"')) {
      mPutEventsResponse.Entries[0] = { ErrorMessage: 'Failed to process event.' };
    } else {
      mPutEventsResponse.Entries[0] = { EventId: '2468' };
    }
    if (params.Entries[0].Detail.includes('\\":\\"UnhandledError\\"')) {
      throw new Error('Oh no!');
    } else {
      return mPutEventsResponse;
    }
  },
);

describe('Send events', () => {
  describe('Events sent as test activities', () => {
    // @ts-ignore
    const consoleSpy = jest.spyOn(console._stdout, 'write');

    it('GIVEN one activities event to send WHEN sent THEN one event is returned.', async () => {
      const mTestResult: TestActivity[] = [createTestResult()];
      const mSendResponse: SendResponse = { SuccessCount: 1, FailCount: 0 };
      await expect(sendEvents(mTestResult, EventType.COMPLETION)).resolves.toEqual(mSendResponse);
    });

    it('GIVEN two activities events to send WHEN sent THEN two events are returned and two infos logged.', async () => {
      const mTestResult: TestActivity[] = [createTestResult('Result1'), createTestResult('Result2')];
      const mSendResponse: SendResponse = { SuccessCount: 2, FailCount: 0 };
      await expect(sendEvents(mTestResult, EventType.COMPLETION)).resolves.toEqual(mSendResponse);
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

    it('GIVEN an activities event WHEN eventbridge could not process it THEN log info message and error', async () => {
      const mTestResult: TestActivity[] = [createTestResult('HandledError')];
      await sendEvents(mTestResult, EventType.COMPLETION);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `info: Failed to send to eventbridge (testResultId: '${mTestResult[0].testResultId}', vin: '${mTestResult[0].vin}')`,
        ),
      );
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error: Failed to process event.'));
    });

    it('GIVEN an issue with eventbridge WHEN 5 activities events are sent and 1 fails THEN the failure is in the response and an error is logged.', async () => {
      const mTestResult: TestActivity[] = [
        createTestResult(),
        createTestResult(),
        createTestResult(),
        createTestResult(),
        createTestResult('UnhandledError'),
      ];
      const mSendResponse: SendResponse = { SuccessCount: 4, FailCount: 1 };
      await expect(sendEvents(mTestResult, EventType.COMPLETION)).resolves.toEqual(mSendResponse);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error: Oh no!'));
    });
  });

  describe('Events sent as differences', () => {
    it('GIVEN one differences event to send WHEN sent THEN one event is returned.', async () => {
      const mDifferences: TestAmendment[] = [createDifferences(1)];
      const mSendResponse: SendResponse = { SuccessCount: 1, FailCount: 0 };
      await expect(sendEvents(mDifferences, EventType.AMENDMENT)).resolves.toEqual(mSendResponse);
    });

    it('GIVEN two differences events to send WHEN sent THEN two events are returned.', async () => {
      const mDifferences: TestAmendment[] = [createDifferences(1), createDifferences(2)];
      const mSendResponse: SendResponse = { SuccessCount: 2, FailCount: 0 };
      await expect(sendEvents(mDifferences, EventType.AMENDMENT)).resolves.toEqual(mSendResponse);
    });

    it('GIVEN an issue with eventbridge WHEN 6 differences events are sent and 1 fails THEN the failure is in the response.', async () => {
      const mDifferences: TestAmendment[] = [
        createDifferences(1),
        createDifferences(1),
        createDifferences(1),
        createDifferences(1),
        createDifferences(1, 'HandledError'),
      ];
      const mSendResponse: SendResponse = { SuccessCount: 4, FailCount: 1 };
      await expect(sendEvents(mDifferences, EventType.AMENDMENT)).resolves.toEqual(mSendResponse);
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

function createDifferences(qty: number, reasonForCreation = 'foo'): TestAmendment {
  const fields = [];
  for (let i = 0; i < qty; i++) {
    fields.push({
      fieldName: 'foo',
      oldvalue: 'bar',
      newValue: 'foobar',
    });
  }
  return { reason: reasonForCreation, fields };
}
