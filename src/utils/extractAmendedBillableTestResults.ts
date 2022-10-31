import logger from '../observability/logger';
import { Differences, DifferencesEntries } from './differences';
import { TestResultModel, TestType } from './testResult';

export const extractAmendedBillableTestResults = (currentRecord: TestResultModel, previousRecord: TestResultModel) => {
  const testTypeValuesToCheck = ['testCode'] as const;
  const testResultValuesToAdd = ['vin', 'vrm'] as const;
  const testResultValuesToCheck = ['testStationPNumber', ...testResultValuesToAdd] as const;

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
          fieldName: key,
          oldValue: oldTestType[key as TestTypesValues],
          newValue: testType[key as TestTypesValues],
        });
      }
    });

    testResultValuesToCheck.forEach((key) => {
      if (currentRecord[key] !== previousRecord[key]) {
        fields.push({
          fieldName: key,
          oldValue: previousRecord[key as TestResultValues],
          newValue: currentRecord[key as TestResultValues],
        });
      }
    });

    if (fields.length) {
      testResultValuesToAdd.forEach((key) => {
        if (!fields.find((field) => field.fieldName === key)) {
          fields.push({
            fieldName: key,
            oldValue: previousRecord[key as TestResultValues],
            newValue: currentRecord[key as TestResultValues],
          });
        }
      });

      logger.debug(`Fields changed for testResultId: ${currentRecord.testResultId}: ${JSON.stringify(fields)}`);

      fieldsChanged.push({
        reason: currentRecord.reasonForCreation,
        fields,
      });
    } else {
      logger.debug('No fields have changed which are relevant to billing');
    }
  });

  return fieldsChanged;
};
