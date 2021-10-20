import s from './transcriptHighlights.module.css';

// This file defines the CSS class names we add to each category,
// so it can be shared between TranscriptLine and TranscriptPane
const transcriptHighlights = {
  PROTECTED_HEALTH_INFORMATION: s.phi,
  MEDICAL_CONDITION: s.condition,
  ANATOMY: s.anatomy,
  MEDICATION: s.medication,
  TEST_TREATMENT_PROCEDURE: s.treatment,
};

export default transcriptHighlights;
