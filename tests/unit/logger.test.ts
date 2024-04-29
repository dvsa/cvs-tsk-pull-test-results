/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-assignment */
process.env.LOG_LEVEL = 'debug';
import { EOL } from 'os';
import logger from '../../src/observability/logger';

describe('logger functions', () => {
  it('GIVEN a logger WHEN an info is logged THEN the console message is correct.', () => {
    // @ts-ignore
    const consoleSpy = jest.spyOn(console._stdout, 'write');
    logger.info('I am an info message!');
    expect(consoleSpy).toHaveBeenCalledWith(`info: I am an info message!${EOL}`);
  });

  it('GIVEN a logger WHEN a debug is logged THEN the console message is correct.', () => {
    // @ts-ignore
    const consoleSpy = jest.spyOn(console._stdout, 'write');
    logger.debug('I am a debug message!');
    expect(consoleSpy).toHaveBeenCalledWith(`debug: I am a debug message!${EOL}`);
  });

  it('GIVEN a logger WHEN an error is logged THEN the console message is correct.', () => {
    // @ts-ignore
    const consoleSpy = jest.spyOn(console._stdout, 'write');
    logger.error('I am an error message!');
    expect(consoleSpy).toHaveBeenCalledWith(`error: I am an error message!${EOL}`);
  });
});
