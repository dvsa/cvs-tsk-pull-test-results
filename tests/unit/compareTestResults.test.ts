import { formatModifyPayload, isSameRecordDetails } from '../../src/utils/compareTestResults';
import { Differences } from '../../src/utils/differences';
import { TestResultModel } from '../../src/utils/testResult';

describe('isSameRecordDetails', () => {
  it('should return false if the testTypes are not the same length', () => {
    expect(
      isSameRecordDetails({ testTypes: [{}, {}] } as TestResultModel, { testTypes: [{}] } as TestResultModel),
    ).toBe(false);
  });
  it('should return false if the testCodes are different', () => {
    expect(
      isSameRecordDetails(
        { testTypes: [{ testCode: 'foo' }] } as TestResultModel,
        {
          testTypes: [{ testCode: 'bar' }],
        } as TestResultModel,
      ),
    ).toBe(false);
  });
  it('should return false if the testStationPNumber has changed', () => {
    expect(
      isSameRecordDetails(
        { testStationPNumber: 'foo', testTypes: [] } as TestResultModel,
        { testStationPNumber: 'bar', testTypes: [] } as TestResultModel,
      ),
    ).toBe(false);
  });
  it('should return true if the changes are not relevant to billing amendments', () => {
    expect(
      isSameRecordDetails(
        { testTypes: [], testResultId: 'foo' } as TestResultModel,
        { testTypes: [], testResultId: 'bar' } as TestResultModel,
      ),
    ).toBe(true);
  });
});

describe('formatModifyPayload', () => {
  it('should the test types to check values to the payload if they have changed', () => {
    const currentRecord = {
      testTypes: [{ testCode: 'foo', testNumber: 'bar' }],
      reasonForCreation: 'foo',
    } as TestResultModel;
    const previousRecord = {
      testTypes: [{ testCode: 'bar', testNumber: 'bar' }],
      reasonForCreation: 'bar',
    } as TestResultModel;
    const expected: Differences[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldname: 'testCode',
            oldvalue: previousRecord.testTypes[0].testCode,
            newvalue: currentRecord.testTypes[0].testCode,
          },
        ],
      },
    ];
    expect(formatModifyPayload(currentRecord, previousRecord)).toEqual(expected);
  });
  it('should not add the test types to check values to the payload if they have not changed', () => {
    const currentRecord = {
      testTypes: [{ testCode: 'bar', testNumber: 'bar' }],
      reasonForCreation: 'foo',
    } as TestResultModel;
    const previousRecord = {
      testTypes: [{ testCode: 'bar', testNumber: 'bar' }],
      reasonForCreation: 'bar',
    } as TestResultModel;
    const expected: Differences[] = [];
    expect(formatModifyPayload(currentRecord, previousRecord)).toEqual(expected);
  });
  it('should only add the test types values to check for the test types that have changed', () => {
    const currentRecord = {
      testTypes: [
        { testCode: 'foo', testNumber: 'bar' },
        { testCode: 'foo', testNumber: 'foo' },
      ],
      reasonForCreation: 'foo',
    } as TestResultModel;
    const previousRecord = {
      testTypes: [
        { testCode: 'bar', testNumber: 'bar' },
        { testCode: 'foo', testNumber: 'foo' },
      ],
      reasonForCreation: 'bar',
    } as TestResultModel;
    const expected: Differences[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldname: 'testCode',
            oldvalue: previousRecord.testTypes[0].testCode,
            newvalue: currentRecord.testTypes[0].testCode,
          },
        ],
      },
    ];
    expect(formatModifyPayload(currentRecord, previousRecord)).toEqual(expected);
  });

  it('should add the test result values to check if they have changed', () => {
    const currentRecord = { reasonForCreation: 'foo', testStationPNumber: 'foo', testTypes: [{}] } as TestResultModel;
    const previousRecord = { reasonForCreation: 'bar', testStationPNumber: 'bar', testTypes: [{}] } as TestResultModel;
    const expected: Differences[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldname: 'testStationPNumber',
            oldvalue: previousRecord.testStationPNumber,
            newvalue: currentRecord.testStationPNumber,
          },
        ],
      },
    ];
    expect(formatModifyPayload(currentRecord, previousRecord)).toEqual(expected);
  });

  it('should not add the test result values to check if they have not changed', () => {
    const currentRecord = { reasonForCreation: 'foo', testStationPNumber: 'foo', testTypes: [{}] } as TestResultModel;
    const previousRecord = { reasonForCreation: 'bar', testStationPNumber: 'foo', testTypes: [{}] } as TestResultModel;
    const expected: Differences[] = [];
    expect(formatModifyPayload(currentRecord, previousRecord)).toEqual(expected);
  });
  it('should add the test result values to add if they have changed', () => {
    const currentRecord = {
      reasonForCreation: 'foo',
      vin: 'foo',
      testTypes: [{}],
      testStationPNumber: 'foo',
    } as TestResultModel;
    const previousRecord = {
      reasonForCreation: 'bar',
      vin: 'bar',
      testTypes: [{}],
      testStationPNumber: 'bar',
    } as TestResultModel;
    const expected: Differences[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldname: 'vin',
            oldvalue: previousRecord.vin,
            newvalue: currentRecord.vin,
          },
          {
            fieldname: 'testStationPNumber',
            oldvalue: previousRecord.testStationPNumber,
            newvalue: currentRecord.testStationPNumber,
          },
        ],
      },
    ];

    expect(formatModifyPayload(currentRecord, previousRecord)).toEqual(expected);
  });
  it('should add the test result values to add even if they have not changed', () => {
    const currentRecord = {
      reasonForCreation: 'foo',
      vin: 'foo',
      testTypes: [{}],
      testStationPNumber: 'foo',
    } as TestResultModel;
    const previousRecord = {
      reasonForCreation: 'bar',
      vin: 'foo',
      testTypes: [{}],
      testStationPNumber: 'bar',
    } as TestResultModel;
    const expected: Differences[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldname: 'vin',
            oldvalue: previousRecord.vin,
            newvalue: currentRecord.vin,
          },
          {
            fieldname: 'testStationPNumber',
            oldvalue: previousRecord.testStationPNumber,
            newvalue: currentRecord.testStationPNumber,
          },
        ],
      },
    ];
    expect(formatModifyPayload(currentRecord, previousRecord)).toEqual(expected);
  });
});
