import { formatModifyPayload } from '../../src/utils/compareTestResults';
import { Differences } from '../../src/utils/differences';
import { TestResultModel } from '../../src/utils/testResult';

describe('formatModifyPayload', () => {
  it('should return an empty array if nothing has changed', () => {
    const currentRecord = { testTypes: [{ testCode: 'foo', testNumber: 'bar' }] } as TestResultModel;
    expect(formatModifyPayload(currentRecord, currentRecord)).toEqual([]);
  });
  it('should return an empty array if the changes in the testResult are not relevant to billing', () => {
    const currentRecord = {
      testResultId: 'foo',
      testTypes: [{ testCode: 'foo', testNumber: 'bar' }],
    } as TestResultModel;
    const previousRecord = {
      testResultId: 'bar',
      testTypes: [{ testCode: 'foo', testNumber: 'bar' }],
    } as TestResultModel;
    expect(formatModifyPayload(currentRecord, previousRecord)).toEqual([]);
  });
  it('should return an empty array if the changes in the testTypes are not relevant to billing', () => {
    const currentRecord = {
      testTypes: [{ testCode: 'foo', testNumber: 'bar', name: 'foo' }],
    } as TestResultModel;
    const previousRecord = {
      testTypes: [{ testCode: 'foo', testNumber: 'bar', name: 'bar' }],
    } as TestResultModel;
    expect(formatModifyPayload(currentRecord, previousRecord)).toEqual([]);
  });
  it('should the test types to check values to the payload if they have changed', () => {
    const currentRecord = {
      vin: '123',
      vrm: 'B18 123',
      testTypes: [{ testCode: 'foo', testNumber: 'bar' }],
      reasonForCreation: 'foo',
    } as TestResultModel;
    const previousRecord = {
      vin: '123',
      vrm: 'B18 123',
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
          {
            fieldname: 'vin',
            oldvalue: previousRecord.vin,
            newvalue: currentRecord.vin,
          },
          {
            fieldname: 'vrm',
            oldvalue: previousRecord.vrm,
            newvalue: currentRecord.vrm,
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
          {
            fieldname: 'vin',
            oldvalue: previousRecord.vin,
            newvalue: currentRecord.vin,
          },
          {
            fieldname: 'vrm',
            oldvalue: previousRecord.vrm,
            newvalue: currentRecord.vrm,
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
          {
            fieldname: 'vin',
            oldvalue: previousRecord.vin,
            newvalue: currentRecord.vin,
          },
          {
            fieldname: 'vrm',
            oldvalue: previousRecord.vrm,
            newvalue: currentRecord.vrm,
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
            fieldname: 'testStationPNumber',
            oldvalue: previousRecord.testStationPNumber,
            newvalue: currentRecord.testStationPNumber,
          },
          {
            fieldname: 'vin',
            oldvalue: previousRecord.vin,
            newvalue: currentRecord.vin,
          },
          {
            fieldname: 'vrm',
            oldvalue: previousRecord.vrm,
            newvalue: currentRecord.vrm,
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
            fieldname: 'testStationPNumber',
            oldvalue: previousRecord.testStationPNumber,
            newvalue: currentRecord.testStationPNumber,
          },
          {
            fieldname: 'vin',
            oldvalue: previousRecord.vin,
            newvalue: currentRecord.vin,
          },
          {
            fieldname: 'vrm',
            oldvalue: previousRecord.vrm,
            newvalue: currentRecord.vrm,
          },
        ],
      },
    ];
    expect(formatModifyPayload(currentRecord, previousRecord)).toEqual(expected);
  });
});
