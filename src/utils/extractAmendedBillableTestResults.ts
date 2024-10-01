/* eslint-disable security/detect-object-injection */
/* eslint-disable import/no-unresolved */
import { TestResultSchema, VehicleType } from '@dvsa/cvs-type-definitions/types/v1/test-result';
import { TestTypeSchema } from '@dvsa/cvs-type-definitions/types/v1/test-type';
import logger from '../observability/logger';
import { FieldChange, TestAmendment } from '../interfaces/TestAmendment';

export const extractAmendedBillableTestResults = (currentRecord: TestResultSchema, previousRecord: TestResultSchema) => {
  const testResultValues = [
    'testStationPNumber',
    'vin',
    'testStatus',
    currentRecord.vehicleType === 'trl' as VehicleType ? 'trailerId' : 'vrm',
  ] as const;

  const fieldsChanged: TestAmendment[] = [];
  currentRecord.testTypes.forEach((currentTestType) => {
    const fields: FieldChange[] = [];

    const previousTestType: TestTypeSchema = previousRecord.testTypes.find(
      (testType) => testType.testNumber === currentTestType.testNumber,
    );
    if (previousTestType) {
      const hasAnyFieldChanged = testResultValues.some((field) => currentRecord[field] !== previousRecord[field])
      || currentTestType.testCode !== previousTestType.testCode;

      if (!hasAnyFieldChanged) {
        logger.debug('No fields have changed which are relevant to billing');
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
    }
  });

  return fieldsChanged;
};
