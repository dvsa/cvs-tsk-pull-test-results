import { EventBridge } from 'aws-sdk';
import { EventEntry } from './EventEntry';
import { Entries } from './Entries';
import { SendResponse } from './SendResponse';
import logger from '../observability/logger';
import { TestActivity } from '../utils/testActivity';
import { MCRequest } from '../utils/MCRequest';

const eventbridge = new EventBridge();

const sendResponse: SendResponse = {
  SuccessCount: 0,
  FailCount: 0,
};

const sendEvents = async (testResults: TestActivity[]): Promise<SendResponse> => {
  logger.info('sendEvents starting');
  logger.info(`${testResults.length} ${testResults.length === 1 ? 'event' : 'events'} ready to send to eventbridge.`);

  for (let i = 0; i < testResults.length; i++) {
    const entry: EventEntry = {
      Source: process.env.AWS_EVENT_BUS_SOURCE,
      // eslint-disable-next-line security/detect-object-injection
      Detail: `{ "testResult": "${JSON.stringify(testResults[i])?.replace(/"/g, '\\"')}" }`,
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
      if (testResults[i].testTypeEndTimestamp !== '') {
        // eslint-disable-next-line no-await-in-loop
        const result = await eventbridge.putEvents(params).promise();
        logger.info(
          `${result.Entries.length} ${result.Entries.length === 1 ? 'event' : 'events'} sent to eventbridge.`,
        );
        sendResponse.SuccessCount++;
      } else {
        logger.info(`Event not sent as test is not completed { ID: ${testResults[i].testResultId} }`);
      }
    } catch (error) {
      logger.error('', error);
      sendResponse.FailCount++;
    }
  }

  logger.info('sendEvents ending');

  return sendResponse;
};

// eslint-disable-next-line @typescript-eslint/require-await
const sendMCProhibition = async (mcRequests: MCRequest[]): Promise<SendResponse> => {
  for (let i = 0; i < mcRequests.length; i++) {
    const data = {
      VehicleIdentifier: mcRequests[i].vehicleIdentifier,
      testDate: mcRequests[i].testDate,
      vin: mcRequests[i].vin,
      testResult: mcRequests[i].testResult,
      hgvPsvTrailFlag: mcRequests[i].hgvPsvTrailFlag,
    };
    const entry: EventEntry = {
      Source: process.env.AWS_EVENT_BUS_SOURCE_MC,
      Detail: `{ "testResult": "${JSON.stringify(data)?.replace(/"/g, '\\"')}" }`,
      DetailType: 'CVS MC Clear Prohibition',
      EventBusName: process.env.AWS_EVENT_BUS_NAME,
      Time: new Date(),
    };
    const params: Entries = {
      Entries: [],
    };
    params.Entries.push(entry);
    try {
      logger.debug(`event about to be sent: ${JSON.stringify(params)}`);
      if (mcRequests[i].vehicleIdentifier !== '') {
        // TODO comment out when testing
        // eslint-disable-next-line no-await-in-loop
        // const result = await eventbridge.putEvents(params).promise();
        // logger.info(
        //   `${result.Entries.length} ${result.Entries.length === 1 ? 'event' : 'events'} sent to eventbridge.`,
        // );
        sendResponse.SuccessCount++;
      } else {
        logger.info(`Event not sent as test is not completed { ID: ${mcRequests[i].vehicleIdentifier} }`);
      }
    } catch (error) {
      logger.error('', error);
      sendResponse.FailCount++;
    }
  }
  return sendResponse;
};

export { sendEvents, sendMCProhibition };
