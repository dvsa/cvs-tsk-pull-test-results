import { extractAmendedBillableTestResults } from '../../src/utils/extractAmendedBillableTestResults';
import { Differences } from '../../src/utils/differences';
import { TestResultModel, VehicleType } from '../../src/utils/testResult';

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
  it('GIVEN changes to a test record WHEN the changes happen in the test result AND they are not relevant to billing THEN it should return empty array', () => {
    const currentRecord = { reasonForCreation: 'foo', testStationPNumber: 'foo', testTypes: [{}] } as TestResultModel;
    const previousRecord = { reasonForCreation: 'bar', testStationPNumber: 'foo', testTypes: [{}] } as TestResultModel;
    const expected: Differences[] = [];
    expect(extractAmendedBillableTestResults(currentRecord, previousRecord)).toEqual(expected);
  });
  it('GIVEN changes to the test record WHEN changes made to the test types are relevant to billing THEN it should add required fields to the payload', () => {
    const currentRecord = {
      vin: '123',
      vrm: 'B18 123',
      testStationPNumber: '123',
      testTypes: [{ testCode: 'foo', testNumber: 'bar' }],
      reasonForCreation: 'foo',
    } as TestResultModel;
    const previousRecord = {
      vin: '123',
      vrm: 'B18 123',
      testStationPNumber: '123',
      testTypes: [{ testCode: 'bar', testNumber: 'bar' }],
      reasonForCreation: 'bar',
    } as TestResultModel;
    const expected: Differences[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldName: 'testCode',
            oldValue: previousRecord.testTypes[0].testCode,
            newValue: currentRecord.testTypes[0].testCode,
          },
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
    const expected: Differences[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldName: 'testCode',
            oldValue: previousRecord.testTypes[0].testCode,
            newValue: currentRecord.testTypes[0].testCode,
          },
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
  it('GIVEN changes to two test types WHEN one of the values on both of the test types that have changed is relevant to billing THEN they are both added to the payload', () => {
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
        { testCode: 'foobar', testNumber: 'foo' },
      ],
      reasonForCreation: 'bar',
    } as TestResultModel;
    const expected: Differences[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldName: 'testCode',
            oldValue: previousRecord.testTypes[0].testCode,
            newValue: currentRecord.testTypes[0].testCode,
          },
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
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldName: 'testCode',
            oldValue: previousRecord.testTypes[1].testCode,
            newValue: currentRecord.testTypes[1].testCode,
          },
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

  it('GIVEN changes to a test record WHEN the changes happen in the test result AND they are relevant to billing THEN it should add those fields to the payload', () => {
    const currentRecord = { reasonForCreation: 'foo', testStationPNumber: 'foo', testTypes: [{}] } as TestResultModel;
    const previousRecord = { reasonForCreation: 'bar', testStationPNumber: 'bar', testTypes: [{}] } as TestResultModel;
    const expected: Differences[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldName: 'testCode',
            oldValue: previousRecord.testTypes[0].testCode,
            newValue: currentRecord.testTypes[0].testCode,
          },
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
  it('GIVEN changes to a trl test record WHEN the changes happen in the test result AND they are relevant to billing THEN should add the trailer Id to the VRM field', () => {
    const currentRecord = {
      reasonForCreation: 'foo',
      testStationPNumber: 'foo',
      vehicleType: VehicleType.TRL,
      trailerId: 'TRL123',
      vrm: 'wrongVRM123',
      testTypes: [{}],
    } as TestResultModel;
    const previousRecord = {
      reasonForCreation: 'bar',
      testStationPNumber: 'bar',
      vehicleType: VehicleType.TRL,
      trailerId: 'TRL1',
      vrm: 'wrongVRM1',
      testTypes: [{}],
    } as TestResultModel;
    const expected: Differences[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldName: 'testCode',
            oldValue: previousRecord.testTypes[0].testCode,
            newValue: currentRecord.testTypes[0].testCode,
          },
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
            oldValue: previousRecord.trailerId,
            newValue: currentRecord.trailerId,
          },
        ],
      },
    ];
    const BILLING_AMENDMENTS = extractAmendedBillableTestResults(currentRecord, previousRecord);
    const VRM = BILLING_AMENDMENTS[0].fields.find((field) => field.fieldName === 'vrm');
    expect(VRM.newValue).toEqual(currentRecord.trailerId);
    expect(VRM.oldValue).toEqual(previousRecord.trailerId);
    expect(VRM.newValue).not.toEqual(currentRecord.vrm);
    expect(VRM.oldValue).not.toEqual(previousRecord.vrm);
    expect(BILLING_AMENDMENTS).toEqual(expected);
  });
  it('GIVEN changes to a test record for a vehicle other than a trailer WHEN the changes happen in the test result AND they are relevant to billing THEN the vrm field should not equal the trailerId field', () => {
    const currentRecord = {
      reasonForCreation: 'foo',
      testStationPNumber: 'foo',
      vehicleType: VehicleType.PSV,
      trailerId: 'TRL123',
      vrm: 'PSV123',
      testTypes: [{}],
    } as TestResultModel;
    const previousRecord = {
      reasonForCreation: 'bar',
      testStationPNumber: 'bar',
      vehicleType: VehicleType.PSV,
      trailerId: 'TRL1',
      vrm: 'PSV1',
      testTypes: [{}],
    } as TestResultModel;
    const expected: Differences[] = [
      {
        reason: currentRecord.reasonForCreation,
        fields: [
          {
            fieldName: 'testCode',
            oldValue: previousRecord.testTypes[0].testCode,
            newValue: currentRecord.testTypes[0].testCode,
          },
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
    const BILLING_AMENDMENTS = extractAmendedBillableTestResults(currentRecord, previousRecord);
    const VRM = BILLING_AMENDMENTS[0].fields.find((field) => field.fieldName === 'vrm');
    expect(VRM.newValue).not.toEqual(currentRecord.trailerId);
    expect(VRM.oldValue).not.toEqual(previousRecord.trailerId);
    expect(VRM.newValue).toEqual(currentRecord.vrm);
    expect(VRM.oldValue).toEqual(previousRecord.vrm);
    expect(BILLING_AMENDMENTS).toEqual(expected);
  });
});
