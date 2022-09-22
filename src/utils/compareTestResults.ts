import { Differences, DifferencesEntries } from './differences';
import { TestResultModel, TestType } from './testResult';

export const isSameRecordDetails = (currentRecord: TestResultModel, previousRecord: TestResultModel): boolean => {
  if (currentRecord.testTypes.length !== previousRecord.testTypes.length) {
    return false;
  }

  const currentTestCodeArray: string[] = currentRecord.testTypes.map((testType) => testType.testCode).sort();
  const previousTestCodeArray: string[] = previousRecord.testTypes.map((testType) => testType.testCode).sort();

  const testTypeSame: boolean = currentTestCodeArray.every((val, idx) => val === previousTestCodeArray[idx])
    && currentTestCodeArray.length === previousTestCodeArray.length;

  return testTypeSame && currentRecord.testStationPNumber === previousRecord.testStationPNumber;
};

export const formatModifyPayload = (currentRecord: TestResultModel, previousRecord: TestResultModel) => {
  if (isSameRecordDetails(currentRecord, previousRecord)) {
    return [];
  }
  const testTypeValuesToCheck = ['testCode'] as const;
  const testResultValuesToCheck = ['testStationPNumber', 'testStationType'] as const;
  const testResultValuesToAdd = ['vin', 'vrm'] as const;

  type TestTypesValues = typeof testTypeValuesToCheck[number];
  type TestResultValues = typeof testResultValuesToCheck[number] | typeof testResultValuesToAdd[number];

  const fieldsChanged: Differences[] = [];
  currentRecord.testTypes.forEach((testType) => {
    const fields: DifferencesEntries[] = [];

    Object.keys(testType).forEach((key) => {
      if ((testTypeValuesToCheck as readonly string[]).includes(key)) {
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
      }
    });

    Object.keys(currentRecord).forEach((key) => {
      if (
        ((testResultValuesToCheck as readonly string[]).includes(key) && currentRecord[key] !== previousRecord[key])
        || (testResultValuesToAdd as readonly string[]).includes(key)
      ) {
        fields.push({
          fieldname: key,
          oldvalue: previousRecord[key as TestResultValues],
          newvalue: currentRecord[key as TestResultValues],
        });
      }
    });

    if (fields.length) {
      fieldsChanged.push({
        reason: currentRecord.reasonForCreation,
        fields,
      });
    }
  });

  return fieldsChanged;
};
