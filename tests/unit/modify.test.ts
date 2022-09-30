/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
process.env.LOG_LEVEL = 'debug';
import { mocked } from 'ts-jest/utils';
import { handler } from '../../src/modify';
import { eventHandler } from '../../src/eventHandler';

jest.mock('../../src/eventHandler');

describe('Application entry', () => {
  const mockEvent = { Records: [{ awsRegion: 'bar' }] };
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Handler', () => {
    it('GIVEN an event WHEN the eventHandler resolves THEN a callback result is returned', async () => {
      process.env.NO_MODIFY = '';
      mocked(eventHandler).mockReturnValue(Promise.resolve());
      await handler(mockEvent, null, (error: string | Error, result: string) => {
        expect(error).toBeNull();
        expect(result).toEqual('Data processed successfully.');
      });
      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(mockEvent);
    });

    it('GIVEN an event WHEN the eventHandler throws an THEN a callback error is returned', async () => {
      process.env.NO_MODIFY = '';
      mocked(eventHandler).mockReturnValue(Promise.reject());
      await handler(mockEvent, null, (error: string | Error, result: string) => {
        expect(error).toEqual(new Error('Data processed unsuccessfully.'));
        expect(result).toBeUndefined();
      });
      expect(eventHandler).toHaveBeenCalled();
      expect(eventHandler).toHaveBeenCalledWith(mockEvent);
    });

    it('GIVEN an event WHEN the environment variable NO_MODIFY is truthy THEN a callback result is returned AND the eventHandler is not called', async () => {
      process.env.NO_MODIFY = 'foo';
      mocked(eventHandler).mockReturnValue(Promise.resolve());
      await handler(mockEvent, null, (error: string | Error, result: string) => {
        expect(error).toBeNull();
        expect(result).toEqual('Data processed successfully.');
      });
      expect(eventHandler).not.toHaveBeenCalled();
    });
  });
});
