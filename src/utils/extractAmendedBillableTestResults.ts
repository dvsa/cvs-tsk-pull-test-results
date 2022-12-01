import logger from '../observability/logger';
import { FieldChange, TestAmendment } from '../interfaces/TestAmendment';
import { TestResultModel, TestType } from '../interfaces/TestResult';

export const extractAmendedBillableTestResults = (currentRecord: TestResultModel, previousRecord: TestResultModel) => {
  const testTypeValuesToCheck = ['testCode'] as const;
  const testResultValuesToAdd = ['vin', 'vrm'] as const;
  const testResultValuesToCheck = ['testStationPNumber', ...testResultValuesToAdd] as const;

  const fieldsChanged: TestAmendment[] = [];
  currentRecord.testTypes.forEach((testType) => {
    const fields: FieldChange[] = [];

    testTypeValuesToCheck.forEach((key) => {
      const oldTestType: TestType = previousRecord.testTypes.find(
        (previousTestType) => previousTestType.testNumber === testType.testNumber,
      );
      if (oldTestType[key] !== testType[key]) {
        fields.push({
          fieldName: key,
          oldValue: oldTestType[key],
          newValue: testType[key],
        });
      }
    });

    testResultValuesToCheck.forEach((key) => {
      if (currentRecord[key] !== previousRecord[key]) {
        fields.push({
          fieldName: key,
          oldValue: previousRecord[key],
          newValue: currentRecord[key],
        });
      }
    });

    if (fields.length) {
      testResultValuesToAdd.forEach((key) => {
        if (!fields.find((field) => field.fieldName === key)) {
          fields.push({
            fieldName: key,
            oldValue: previousRecord[key],
            newValue: currentRecord[key],
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
