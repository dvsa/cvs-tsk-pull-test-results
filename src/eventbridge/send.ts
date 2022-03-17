import { EventBridge } from 'aws-sdk';
import { EventEntry } from './EventEntry';
import { Entries } from './Entries';
import { SendResponse } from './SendResponse';
import logger from '../observability/logger';
import { TestActivity } from '../utils/testActivity';

const eventbridge = new EventBridge();
const sendEvents = async (testResults: TestActivity[]): Promise<SendResponse> => {
  logger.info('sendEvents starting');
  logger.info(`${testResults.length} ${testResults.length === 1 ? 'event' : 'events'} ready to send to eventbridge.`);

  const sendResponse: SendResponse = {
    SuccessCount: 0,
    FailCount: 0,
  };

  for (let i = 0; i < testResults.length; i++) {
    const result = testResults[i];
    const entry: EventEntry = {
      Source: process.env.AWS_EVENT_BUS_SOURCE,
      // eslint-disable-next-line security/detect-object-injection
      Detail: `{ "testResult": "${JSON.stringify(result)?.replace(/"/g, '\\"')}" }`,
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
        logger.info(`Result sent to eventbridge (testResultId: '${result.testResultId}', vin: '${result.vin}')`);
        sendResponse.SuccessCount++;
      } else {
        throw new Error(putResponse.Entries[0].ErrorMessage);
      }
    } catch (error) {
      logger.info(`Failed to send result to eventbridge (testResultId: '${result.testResultId}', vin: '${result.vin}')`);
      logger.error('', error);
      sendResponse.FailCount++;
    }
  }

  logger.info('sendEvents ending');

  return sendResponse;
};

export { sendEvents };
