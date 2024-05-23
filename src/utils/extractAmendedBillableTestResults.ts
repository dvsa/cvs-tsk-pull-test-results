/* eslint-disable security/detect-object-injection */
import logger from '../observability/logger';
import { FieldChange, TestAmendment } from '../interfaces/TestAmendment';
import { TestResultModel, TestType, VehicleType } from '../interfaces/TestResult';

export const extractAmendedBillableTestResults = (currentRecord: TestResultModel, previousRecord: TestResultModel) => {
  const testResultValues = [
    'testStationPNumber',
    'vin',
    'testStatus',
    currentRecord.vehicleType === VehicleType.TRL ? 'trailerId' : 'vrm',
  ] as const;

  const fieldsChanged: TestAmendment[] = [];
  currentRecord.testTypes.forEach((currentTestType) => {
    const fields: FieldChange[] = [];

    const previousTestType: TestType = previousRecord.testTypes.find(
      (testType) => testType.testNumber === currentTestType.testNumber,
    );
    logger.info(`current test code: ${JSON.stringify(currentTestType.testCode)}`);
    logger.info(`previous test type: ${JSON.stringify(previousTestType)}`);
    logger.info(`previous record test code: ${JSON.stringify(previousTestType.testCode)}`);
    const hasAnyFieldChanged = testResultValues.some((field) => currentRecord[field] !== previousRecord[field])
      || currentTestType.testCode !== previousTestType.testCode;

    if (!hasAnyFieldChanged) {
      logger.info('No fields have changed which are relevant to billing');
      return;
    }
    fields.push({ fieldName: 'testCode', oldValue: previousTestType.testCode, newValue: currentTestType.testCode });
    testResultValues.forEach((field) => fields.push({
      fieldName: field === 'trailerId' ? 'vrm' : field,
      oldValue: previousRecord[field],
      newValue: currentRecord[field],
    }));

    logger.debug(`Fields changed for testResultId: ${currentRecord.testResultId}: ${JSON.stringify(fields)}`);

    fieldsChanged.push({
      reason: currentRecord.reasonForCreation,
      fields,
    });
  });

  return fieldsChanged;
};
