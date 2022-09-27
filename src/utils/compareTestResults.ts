import logger from '../observability/logger';
import { Differences, DifferencesEntries } from './differences';
import { TestResultModel, TestType } from './testResult';

export const formatModifyPayload = (currentRecord: TestResultModel, previousRecord: TestResultModel) => {
  const testTypeValuesToCheck = ['testCode'] as const;
  const testResultValuesToCheck = ['testStationPNumber', 'testStationType'] as const;
  const testResultValuesToAdd = ['vin', 'vrm'] as const;

  type TestTypesValues = typeof testTypeValuesToCheck[number];
  type TestResultValues = typeof testResultValuesToCheck[number] | typeof testResultValuesToAdd[number];

  const fieldsChanged: Differences[] = [];
  currentRecord.testTypes.forEach((testType) => {
    const fields: DifferencesEntries[] = [];

    testTypeValuesToCheck.forEach((key) => {
      const oldTestType: TestType = previousRecord.testTypes.find(
        (previousTestType) => previousTestType.testNumber === testType.testNumber,
      );
      if (oldTestType[key] !== testType[key]) {
        fields.push({
          fieldname: key,
          oldvalue: oldTestType[key as TestTypesValues],
          newvalue: testType[key as TestTypesValues],
        });
      }
    });

    testResultValuesToCheck.forEach((key) => {
      if (currentRecord[key] !== previousRecord[key]) {
        fields.push({
          fieldname: key,
          oldvalue: previousRecord[key as TestResultValues],
          newvalue: currentRecord[key as TestResultValues],
        });
      }
    });

    if (fields.length) {
      testResultValuesToAdd.forEach((key) => {
        fields.push({
          fieldname: key,
          oldvalue: previousRecord[key as TestResultValues],
          newvalue: currentRecord[key as TestResultValues],
        });
      });

      logger.debug(`Fields changed for testResultId: ${currentRecord.testResultId}: ${JSON.stringify(fields)}`);

      fieldsChanged.push({
        reason: currentRecord.reasonForCreation,
        fields,
      });
    }
  });
  logger.debug(`Fields have changed: ${JSON.stringify(fieldsChanged)}`);

  return fieldsChanged;
};
