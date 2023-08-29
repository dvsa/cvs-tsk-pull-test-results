/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-call */
process.env.LOG_LEVEL = 'debug';
import { mocked } from 'jest-mock';
import { handler } from '../../src/insert';
import { eventHandler } from '../../src/eventHandler';

jest.mock('../../src/eventHandler');

describe('Application entry', () => {
  const mockEvent = { Records: [{ awsRegion: 'bar' }] };
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Handler', () => {
    it('GIVEN an event WHEN the eventHandler resolves THEN a callback result is returned', async () => {
      mocked(eventHandler).mockReturnValue(Promise.resolve());
      await handler(mockEvent, null, (error: string | Error, result: string) => {
        expect(error).toBeNull();
        expect(result).toBe('Data processed successfully.');
      });
      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(mockEvent);
    });

    it('GIVEN an event WHEN the eventHandler throws an error THEN a call back error is returned', async () => {
      mocked(eventHandler).mockReturnValue(Promise.reject());
      await handler(mockEvent, null, (error: string | Error, result: string) => {
        expect(error).toEqual(new Error('Data processed unsuccessfully.'));
        expect(result).toBeUndefined();
      });
      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(mockEvent);
    });
  });
});
