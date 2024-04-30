import { EventBridge } from '@aws-sdk/client-eventbridge';
import logger from '../observability/logger';
import { TestAmendment } from '../interfaces/TestAmendment';
import { TestActivity } from '../interfaces/TestActivity';
import {
  EventType, Entries, EventEntry, SendResponse,
} from '../interfaces/EventBridge';

const eventbridge = new EventBridge();
const sendEvents = async (events: Array<TestAmendment | TestActivity>, type: EventType): Promise<SendResponse> => {
  logger.info('sendEvents starting');
  logger.info(`${events.length} ${events.length === 1 ? 'event' : 'events'} ready to send to eventbridge.`);

  const sendResponse: SendResponse = {
    SuccessCount: 0,
    FailCount: 0,
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const event of events) {
    const entry: EventEntry = {
      Source: process.env.AWS_EVENT_BUS_SOURCE,
      Detail: `{ "testResult": "${JSON.stringify(event)?.replace(/"/g, '\\"')}" , "type": "${type}"}`,
      DetailType: 'CVS ATF Test Result',
      EventBusName: process.env.AWS_EVENT_BUS_NAME,
      Time: new Date(),
    };

    const params: Entries = {
      Entries: [],
    };
    params.Entries.push(entry);

    try {
      logger.debug(`event about to be sent: ${JSON.stringify(params)}`);
      // eslint-disable-next-line no-await-in-loop
      const putResponse = await eventbridge.putEvents(params);
      if (putResponse.Entries[0].EventId) {
        logger.info(`Result sent to eventbridge${buildDebugMessage(event)}`);
        sendResponse.SuccessCount++;
      } else {
        throw new Error(putResponse.Entries[0].ErrorMessage);
      }
    } catch (error) {
      logger.info(`Failed to send to eventbridge${buildDebugMessage(event)}`);
      logger.error('', error);
      sendResponse.FailCount++;
    }
  }

  logger.info('sendEvents ending');

  return sendResponse;
};

const buildDebugMessage = (event: TestAmendment | TestActivity): string => (isActivity(event)
  ? ` (testResultId: '${event.testResultId}', vin: '${event.vin}').`
  : ` (reasonForCreation: '${event.reason}').`);

// eslint-disable-next-line no-prototype-builtins
const isActivity = (event: TestAmendment | TestActivity): event is TestActivity => event.hasOwnProperty('vin');

export { sendEvents };
