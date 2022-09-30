import { EventBridge } from 'aws-sdk';
import { EventEntry } from './EventEntry';
import { Entries } from './Entries';
import { SendResponse } from './SendResponse';
import logger from '../observability/logger';
import { Differences } from '../utils/differences';
import { TestActivity } from '../utils/testActivity';

const eventbridge = new EventBridge();
const sendEvents = async (events: Array<Differences | TestActivity>, type: string): Promise<SendResponse> => {
  logger.info('sendEvents starting');
  logger.info(`${events.length} ${events.length === 1 ? 'event' : 'events'} ready to send to eventbridge.`);

  const sendResponse: SendResponse = {
    SuccessCount: 0,
    FailCount: 0,
  };

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const entry: EventEntry = {
      Source: process.env.AWS_EVENT_BUS_SOURCE,
      Detail: `{ "testResult": "${JSON.stringify(event)?.replace(/"/g, '\\"')}" }, type: ${type}`,
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
      const putResponse = await eventbridge.putEvents(params).promise();
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

const buildDebugMessage = (event: Differences | TestActivity): string => (isActivity(event)
  ? ` (testResultId: '${event.testResultId}', vin: '${event.vin}).`
  : ` (reasonForCreation: '${event.reason}').`);

// eslint-disable-next-line no-prototype-builtins
const isActivity = (event: Differences | TestActivity): event is TestActivity => event.hasOwnProperty('vin');

export { sendEvents };
