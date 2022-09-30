/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
process.env.LOG_LEVEL = 'debug';
import { mocked } from 'ts-jest/utils';
import { handler } from '../../src/insert';
import { eventHandler } from '../../src/eventHandler';

jest.mock('../../src/eventHandler');

describe('Application entry', () => {
  const mockEvent = { Records: [{ awsRegion: 'bar' }] };
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Handler', () => {
    it('should process the data successfully when the event handler resolves', async () => {
      const mockEventHandler = jest.fn().mockReturnValue(Promise.resolve());
      mocked(eventHandler).mockImplementation(mockEventHandler);
      await handler(mockEvent, null, (error: string | Error, result: string) => {
        expect(error).toBeNull();
        expect(result).toEqual('Data processed successfully.');
      });
      expect(mockEventHandler).toHaveBeenCalled();
      expect(mockEventHandler).toHaveBeenCalledWith(mockEvent);
    });

    it('should not process the data successfully when the event handler throws an error', async () => {
      const mockEventHandler = jest.fn().mockReturnValue(Promise.reject());
      mocked(eventHandler).mockImplementation(mockEventHandler);
      await handler(mockEvent, null, (error: string | Error, result: string) => {
        expect(error).toEqual(new Error('Data processed unsuccessfully.'));
        expect(result).toBeUndefined();
      });
      expect(mockEventHandler).toHaveBeenCalled();
      expect(mockEventHandler).toHaveBeenCalledWith(mockEvent);
    });
  });
});
