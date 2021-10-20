<<<<<<< HEAD
function isAbsentDiagnosis(myArray) {
  return (
    myArray.some((el) => el.Name === "DIAGNOSIS") &&
    myArray.some((el) => el.Name === "NEGATION")
  );
}

function isPresentDiagnosis(myArray) {
  return (
    myArray.some((el) => el.Name === "DIAGNOSIS") &&
    !myArray.some((el) => el.Name === "NEGATION")
  );
}

function isPresentSymptom(myArray) {
  return (
    myArray.some((el) => el.Name === "SYMPTOM") &&
    !myArray.some((el) => el.Name === "NEGATION")
  );
}

function isAbsentSymptom(myArray) {
  return (
    myArray.some((el) => el.Name === "SYMPTOM") &&
    !myArray.some((el) => el.Name === "NEGATION")
  );
}

export default function generateSOAPSummary(results) {
=======
function isAbsentDiagnosis (myArray) {
  return myArray.some((el) => el.Name === 'DIAGNOSIS') && myArray.some((el) => el.Name === 'NEGATION');
}

function isPresentDiagnosis (myArray) {
  return myArray.some((el) => el.Name === 'DIAGNOSIS') && !myArray.some((el) => el.Name === 'NEGATION');
}

function isPresentSymptom (myArray) {
  return myArray.some((el) => el.Name === 'SYMPTOM') && !myArray.some((el) => el.Name === 'NEGATION');
}

function isAbsentSymptom (myArray) {
  return myArray.some((el) => el.Name === 'SYMPTOM') && !myArray.some((el) => el.Name === 'NEGATION');
}

export default function generateSOAPSummary (results) {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const presentDiagnosedConditions = [];
  const absentDiagnosedConditions = [];
  const presentSymptomConditions = [];
  const absentSymptomConditions = [];

<<<<<<< HEAD
  const medicalConditions = results.filter(
    (r) => r.Category === "MEDICAL_CONDITION"
  );
=======
  const medicalConditions = results.filter((r) => r.Category === 'MEDICAL_CONDITION');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  for (let index = 0; index < medicalConditions.length; index++) {
    if (isPresentDiagnosis(medicalConditions[index].Traits)) {
      presentDiagnosedConditions.push(medicalConditions[index]);
    } else if (isAbsentDiagnosis(medicalConditions[index].Traits)) {
      absentSymptomConditions.push(medicalConditions[index]);
    } else if (isPresentSymptom(medicalConditions[index].Traits)) {
      presentSymptomConditions.push(medicalConditions[index]);
    } else if (isAbsentSymptom(medicalConditions[index].Traits)) {
      absentSymptomConditions.push(medicalConditions[index]);
    }
  }

<<<<<<< HEAD
  const medications = results.filter((r) => r.Category === "MEDICATION");
  const anatomy = results.filter((r) => r.Category === "ANATOMY");
  const testTreatmentProcedures = results.filter(
    (r) => r.Category === "TEST_TREATMENT_PROCEDURE"
  );

  let summary = "\nAssessment:- \n \nDiagnosis: \n";
  if (presentDiagnosedConditions.length > 0) {
    summary +=
      "Patient is likely suffering from " +
      [...new Set(presentDiagnosedConditions.map((r) => r.Text))].join(", ") +
      ". ";
  }
  if (absentDiagnosedConditions.length > 0) {
    summary +=
      "It is not likely that the patient is suffering from" +
      [...new Set(absentDiagnosedConditions.map((r) => r.Text))].join(", ") +
      ". ";
  }

  summary += "\n\nPlan:-\n";
  if (medications.length > 0) {
    summary +=
      "The suggested plan is to take the following medication(s): " +
      [...new Set(medications.map((r) => r.Text))].join(", ") +
      ". ";
  }
  if (testTreatmentProcedures.length > 0) {
    summary +=
      "The suggested treatment(s) to follow is below: \n" +
      [...new Set(testTreatmentProcedures.map((r) => r.Text))].join(", ") +
      ". ";
  }

  summary += "\n\nSubjective:-\n";

  summary += "Chief Complaint(s):\n";
  if (presentDiagnosedConditions.length > 0) {
    summary +=
      "Patient presents with " +
      presentDiagnosedConditions[presentDiagnosedConditions.length - 1].Text +
      ".\n";
  }

  summary += "History of Present Illness(s):\n";
  if (presentDiagnosedConditions.length > 0) {
    summary +=
      "Patient is here for " +
      [...new Set(presentDiagnosedConditions.map((r) => r.Text))].join(", ") +
      ". ";
  }
  if (anatomy.length > 0) {
    summary +=
      "Patient noted issues with: " +
      [...new Set(anatomy.map((r) => r.Text))].join(", ");
  }
  if (presentSymptomConditions.length > 0) {
    summary +=
      " with symptoms like " +
      [...new Set(presentSymptomConditions.map((r) => r.Text))].join(", ") +
      ". ";
  }
  if (absentSymptomConditions.length > 0) {
    summary +=
      "Additionally , noted no occurrences of " +
      [...new Set(presentSymptomConditions.map((r) => r.Text))].join(", ") +
      ".";
  }
  if (medications.length > 0) {
    summary +=
      "Current medications include " +
      [...new Set(medications.map((r) => r.Text))].join(", ") +
      ". ";
  }

  if (absentDiagnosedConditions.length > 0) {
    summary +=
      "It is not likely that the patient is sufferring from " +
      [...new Set(absentDiagnosedConditions.map((r) => r.Text))].join(", ") +
      ". ";
  }

  summary += "\n\nObjective:-\n";
  summary += "\n";
=======
  const medications = results.filter((r) => r.Category === 'MEDICATION');
  const anatomy = results.filter((r) => r.Category === 'ANATOMY');
  const testTreatmentProcedures = results.filter((r) => r.Category === 'TEST_TREATMENT_PROCEDURE');

  let summary = '\nAssessment:- \n \nDiagnosis: \n';
  if (presentDiagnosedConditions.length > 0) {
    summary +=
      'Patient is likely suffering from ' +
      [...new Set(presentDiagnosedConditions.map((r) => r.Text))].join(', ') +
      '. ';
  }
  if (absentDiagnosedConditions.length > 0) {
    summary +=
      'It is not likely that the patient is suffering from' +
      [...new Set(absentDiagnosedConditions.map((r) => r.Text))].join(', ') +
      '. ';
  }

  summary += '\n\nPlan:-\n';
  if (medications.length > 0) {
    summary +=
      'The suggested plan is to take the following medication(s): ' +
      [...new Set(medications.map((r) => r.Text))].join(', ') +
      '. ';
  }
  if (testTreatmentProcedures.length > 0) {
    summary +=
      'The suggested treatment(s) to follow is below: \n' +
      [...new Set(testTreatmentProcedures.map((r) => r.Text))].join(', ') +
      '. ';
  }

  summary += '\n\nSubjective:-\n';

  summary += 'Chief Complaint(s):\n';
  if (presentDiagnosedConditions.length > 0) {
    summary +=
      'Patient presents with ' + presentDiagnosedConditions[presentDiagnosedConditions.length - 1].Text + '.\n';
  }

  summary += 'History of Present Illness(s):\n';
  if (presentDiagnosedConditions.length > 0) { summary += 'Patient is here for ' + [...new Set(presentDiagnosedConditions.map((r) => r.Text))].join(', ') + '. '; }
  if (anatomy.length > 0) { summary += 'Patient noted issues with: ' + [...new Set(anatomy.map((r) => r.Text))].join(', '); }
  if (presentSymptomConditions.length > 0) { summary += ' with symptoms like ' + [...new Set(presentSymptomConditions.map((r) => r.Text))].join(', ') + '. '; }
  if (absentSymptomConditions.length > 0) {
    summary +=
      'Additionally , noted no occurrences of ' +
      [...new Set(presentSymptomConditions.map((r) => r.Text))].join(', ') +
      '.';
  }
  if (medications.length > 0) { summary += 'Current medications include ' + [...new Set(medications.map((r) => r.Text))].join(', ') + '. '; }

  if (absentDiagnosedConditions.length > 0) {
    summary +=
      'It is not likely that the patient is sufferring from ' +
      [...new Set(absentDiagnosedConditions.map((r) => r.Text))].join(', ') +
      '. ';
  }

  summary += '\n\nObjective:-\n';
  summary += '\n';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  return summary;
}
