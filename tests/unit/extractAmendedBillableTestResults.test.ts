import { extractAmendedBillableTestResults } from '../../src/utils/extractAmendedBillableTestResults';
import { TestAmendment } from '../../src/interfaces/TestAmendment';
import { TestResultModel } from '../../src/interfaces/TestResult';

describe('formatModifyPayload', () => {
  it('GIVEN no changes where made to the record WHEN it should return an empty array', () => {
    const currentRecord = { testTypes: [{ testCode: 'foo', testNumber: 'bar' }] } as TestResultModel;
    const previousRecord = { testTypes: [{ testCode: 'foo', testNumber: 'bar' }] } as TestResultModel;
    expect(extractAmendedBillableTestResults(currentRecord, previousRecord)).toEqual([]);
  });
  it('GIVEN changes made to the test record WHEN changes are not relevant to billing THEN it should return an empty array', () => {
    const currentRecord = {
      testResultId: 'foo',
      testTypes: [{ testCode: 'foo', testNumber: 'bar' }],
    } as TestResultModel;
    const previousRecord = {
      testResultId: 'bar',
      testTypes: [{ testCode: 'foo', testNumber: 'bar' }],
    } as TestResultModel;
    expect(extractAmendedBillableTestResults(currentRecord, previousRecord)).toEqual([]);
  });
  it('GIVEN changes to the test types WHEN the changes are not relevant to billing THEN it should return an empty array', () => {
    const currentRecord = {
      testTypes: [{ testCode: 'foo', testNumber: 'bar', name: 'foo' }],
    } as TestResultModel;
    const previousRecord = {
      testTypes: [{ testCode: 'foo', testNumber: 'bar', name: 'bar' }],
    } as TestResultModel;
    expect(extractAmendedBillableTestResults(currentRecord, previousRecord)).toEqual([]);
  });
  it('GIVEN changes to the test record WHEN changes made to the test types are relevant to billing THEN it should add that field to the payload', () => {
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
    const expected: TestAmendment[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldName: 'testCode',
            oldValue: previousRecord.testTypes[0].testCode,
            newValue: currentRecord.testTypes[0].testCode,
          },
          {
            fieldName: 'vin',
            oldValue: previousRecord.vin,
            newValue: currentRecord.vin,
          },
          {
            fieldName: 'vrm',
            oldValue: previousRecord.vrm,
            newValue: currentRecord.vrm,
          },
        ],
      },
    ];
    expect(extractAmendedBillableTestResults(currentRecord, previousRecord)).toEqual(expected);
  });
  it('GIVEN changes to the test record WHEN values relevant to billing have not changed THEN they are not added to payload', () => {
    const currentRecord = {
      testTypes: [{ testCode: 'bar', testNumber: 'bar' }],
      reasonForCreation: 'foo',
    } as TestResultModel;
    const previousRecord = {
      testTypes: [{ testCode: 'bar', testNumber: 'bar' }],
      reasonForCreation: 'bar',
    } as TestResultModel;
    const expected: TestAmendment[] = [];
    expect(extractAmendedBillableTestResults(currentRecord, previousRecord)).toEqual(expected);
  });
  it('GIVEN changes to one test type WHEN one of the values on one of the test types that has changed is relevant to billing THEN they are added to the payload', () => {
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
    const expected: TestAmendment[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldName: 'testCode',
            oldValue: previousRecord.testTypes[0].testCode,
            newValue: currentRecord.testTypes[0].testCode,
          },
          {
            fieldName: 'vin',
            oldValue: previousRecord.vin,
            newValue: currentRecord.vin,
          },
          {
            fieldName: 'vrm',
            oldValue: previousRecord.vrm,
            newValue: currentRecord.vrm,
          },
        ],
      },
    ];
    expect(extractAmendedBillableTestResults(currentRecord, previousRecord)).toEqual(expected);
  });

  it('GIVEN changes to a test record WHEN the changes happen in the test result AND they are relevant to billing THEN it should add those fields to the payload', () => {
    const currentRecord = { reasonForCreation: 'foo', testStationPNumber: 'foo', testTypes: [{}] } as TestResultModel;
    const previousRecord = { reasonForCreation: 'bar', testStationPNumber: 'bar', testTypes: [{}] } as TestResultModel;
    const expected: TestAmendment[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldName: 'testStationPNumber',
            oldValue: previousRecord.testStationPNumber,
            newValue: currentRecord.testStationPNumber,
          },
          {
            fieldName: 'vin',
            oldValue: previousRecord.vin,
            newValue: currentRecord.vin,
          },
          {
            fieldName: 'vrm',
            oldValue: previousRecord.vrm,
            newValue: currentRecord.vrm,
          },
        ],
      },
    ];
    expect(extractAmendedBillableTestResults(currentRecord, previousRecord)).toEqual(expected);
  });

  it('GIVEN changes to a test record WHEN the changes happen in the test result AND they are not relevant to billing THEN it should return empty array', () => {
    const currentRecord = { reasonForCreation: 'foo', testStationPNumber: 'foo', testTypes: [{}] } as TestResultModel;
    const previousRecord = { reasonForCreation: 'bar', testStationPNumber: 'foo', testTypes: [{}] } as TestResultModel;
    const expected: TestAmendment[] = [];
    expect(extractAmendedBillableTestResults(currentRecord, previousRecord)).toEqual(expected);
  });
  it('GIVEN changes to a test record WHEN the changes are relevant to billing THEN it should add required fields even if they have not changed', () => {
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
    const expected: TestAmendment[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldName: 'testStationPNumber',
            oldValue: previousRecord.testStationPNumber,
            newValue: currentRecord.testStationPNumber,
          },
          {
            fieldName: 'vin',
            oldValue: previousRecord.vin,
            newValue: currentRecord.vin,
          },
          {
            fieldName: 'vrm',
            oldValue: previousRecord.vrm,
            newValue: currentRecord.vrm,
          },
        ],
      },
    ];
    expect(extractAmendedBillableTestResults(currentRecord, previousRecord)).toEqual(expected);
  });
  it('GIVEN changes to the vrm THEN it should the vrm and the vin to the payload', () => {
    const currentRecord = {
      reasonForCreation: 'foo',
      vin: 'foo',
      testTypes: [{}],
      vrm: 'bar',
      testStationPNumber: 'foo',
    } as TestResultModel;
    const previousRecord = {
      reasonForCreation: 'bar',
      vin: 'foo',
      testTypes: [{}],
      vrm: 'foo',
      testStationPNumber: 'foo',
    } as TestResultModel;
    const expected: TestAmendment[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldName: 'vrm',
            oldValue: previousRecord.vrm,
            newValue: currentRecord.vrm,
          },
          {
            fieldName: 'vin',
            oldValue: previousRecord.vin,
            newValue: currentRecord.vin,
          },
        ],
      },
    ];
    expect(extractAmendedBillableTestResults(currentRecord, previousRecord)).toEqual(expected);
  });
});
