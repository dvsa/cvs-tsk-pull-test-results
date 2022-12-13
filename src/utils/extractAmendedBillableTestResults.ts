import logger from '../observability/logger';
import { Differences, DifferencesEntries } from './differences';
import { TestResultModel, TestType } from './testResult';

export const extractAmendedBillableTestResults = (currentRecord: TestResultModel, previousRecord: TestResultModel) => {
  const testTypeValues = ['testCode'] as const;
  const testResultValues = ['testStationPNumber', 'vin', 'vrm'] as const;

  const fieldsChanged: Differences[] = [];
  currentRecord.testTypes.forEach((currentTestType) => {
    const fields: DifferencesEntries[] = [];

    const previousTestType: TestType = previousRecord.testTypes.find(
      (testType) => testType.testNumber === currentTestType.testNumber,
    );

    const hasAnyFieldChanged = testResultValues.some((field) => currentRecord[field] !== previousRecord[field])
      || testTypeValues.some((field) => currentTestType[field] !== previousTestType[field]);

    if (!hasAnyFieldChanged) {
      logger.debug('No fields have changed which are relevant to billing');
      return;
    }

    testTypeValues.forEach((field) => fields.push({ fieldName: field, oldValue: previousTestType[field], newValue: currentTestType[field] }));
    testResultValues.forEach((field) => fields.push({ fieldName: field, oldValue: previousRecord[field], newValue: currentRecord[field] }));

    logger.debug(`Fields changed for testResultId: ${currentRecord.testResultId}: ${JSON.stringify(fields)}`);

    fieldsChanged.push({
      reason: currentRecord.reasonForCreation,
      fields,
    });
  });

  return fieldsChanged;
};
