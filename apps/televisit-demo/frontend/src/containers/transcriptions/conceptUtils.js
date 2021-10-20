export const sortByScoreDescending = (concepts) =>
  [...concepts].sort((concept1, concept2) => concept2.Score - concept1.Score);

<<<<<<< HEAD
export function getSelectedConcept(result) {
  const concepts = [
    ...(result.ICD10CMConcepts
      ? result.ICD10CMConcepts
      : result.RxNormConcepts),
  ];
  return concepts.find(
    (concept) => concept.Code === result.selectedConceptCode
  );
=======
export function getSelectedConcept (result) {
  const concepts = [...(result.ICD10CMConcepts ? result.ICD10CMConcepts : result.RxNormConcepts)];
  return concepts.find((concept) => concept.Code === result.selectedConceptCode);
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
}
