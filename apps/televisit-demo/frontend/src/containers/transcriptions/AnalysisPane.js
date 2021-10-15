import React, { useMemo, useState } from 'react'

import s from './AnalysisPane.module.css'
import cs from 'clsx'

import displayNames from './displayNames'
import { VStack, Box, Flex, IconButton, Select, Input, FormControl, VisuallyHidden } from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { DeleteIcon } from './DeleteIcon'
import highlightClasses from './transcriptHighlights'
import { getSelectedConcept } from './conceptUtils'

const CATEGORIES = [
  'MEDICAL_CONDITION',
  'MEDICATION',
  'TEST_TREATMENT_PROCEDURE',
  'ANATOMY',
  'PROTECTED_HEALTH_INFORMATION'
]

const CONFIDENCE_THRESHOLD = 0.5

function ResultRow ({
  result,
  onDeleteClick,
  onSelectedConceptChange
}) {
  const closeIcon = (
    <IconButton
      aria-label='Delete'
      icon={<DeleteIcon />}
      onClick={onDeleteClick}
      size='xs'
      isRound
      border='1px solid #545b64'
      _hover={{ bg: '#545b64' }}
      sx={{
        '&:hover svg': {
          color: '#fff'
        }
      }}
    />
  )

  const attrs = useMemo(() => {
    const a = [];

    (result.Attributes || []).forEach((attr) => {
      a.push([displayNames[attr.Type], attr.Text])
    })
    return a
  }, [result])

  const conceptsPresent = result.ICD10CMConcepts || result.RxNormConcepts
  const attributesPresent = result.Attributes && result.Attributes.length !== 0

  if (!conceptsPresent && !attributesPresent) {
    return (
      <Flex width='100%' alignItems='center'>
        <Flex
          flex='1'
          mr={2}
          height='2.5rem'
          border={result.Score && result.Score < CONFIDENCE_THRESHOLD ? '2px solid #B30000' : '1px solid grey'}
          bg='white'
          px={4}
          alignItems='center'
        >
          {result.Text} {result.Type && '|'} {displayNames[result.Type]}
        </Flex>
        {closeIcon}
      </Flex>
    )
  }

  if (!conceptsPresent && attributesPresent) {
    return (
      <Flex width='100%' alignItems='center'>
        <Flex
          flex='1'
          mr={2}
          height='2.5rem'
          border={result.Score && result.Score < CONFIDENCE_THRESHOLD ? '2px solid #B30000' : '1px solid grey'}
          bg='white'
          px={4}
          alignItems='center'
        >
          {attrs.map(([key, value]) => (
            <React.Fragment key={key}>
              {result.Text} {value && '|'} {value}
            </React.Fragment>
          ))}
        </Flex>

        {closeIcon}
      </Flex>
    )
  }

  const concepts = [...(result.ICD10CMConcepts ? result.ICD10CMConcepts : result.RxNormConcepts)]
  const selectedConcept = getSelectedConcept(result)
  const borderColor = concepts[0].Score < CONFIDENCE_THRESHOLD ? '#B30000 ' : 'grey'

  return (
    <Flex width='100%' alignItems='center'>
      <Select
        mr={2}
        border={selectedConcept.Score < CONFIDENCE_THRESHOLD ? '2px solid' : '1px solid'}
        borderColor={borderColor}
        borderRadius='0'
        bg='white'
        value={result.selectedConceptCode}
        onChange={(e) => onSelectedConceptChange(result.id, e.target.value)}
        _hover={{ borderColor: borderColor, boxShadow: 'none' }}
      >
        {concepts.map(({ Code, Description, Score }) => (
          <option key={Code} value={Code}>
            {result.Text} {Code && ' | '} {Code} {Description && ' | '}
            {Description} &nbsp;&nbsp; {(Score * 100).toPrecision(4)}%
          </option>
        ))}
      </Select>

      {closeIcon}
    </Flex>
  )
}

function ResultTable ({
  results,
  category,
  onResultDelete,
  onResultAdd,
  onSelectedConceptChange
}) {
  const filteredResults = useMemo(() => results.filter((r) => r.Category === category), [results, category])
  const [inputValue, setInputValue] = useState('')
  const handleInputChange = (event) => setInputValue(event.target.value)

  const handleSubmit = (event) => {
    event.preventDefault()
    const input = inputValue.trim()
    if (input !== '') {
      onResultAdd(input, category)
      setInputValue('')
    }
  }

  const addEntityInputId = `add-${displayNames[category]}`

  const addIcon = (
    <IconButton
      aria-label='Add'
      type='submit'
      icon={<AddIcon />}
      size='xs'
      isRound
      border='1px solid #545b64'
      _hover={{ bg: '#545b64' }}
      sx={{
        '&:hover svg': {
          color: '#fff'
        }
      }}
    />
  )

  return (
    <Box mb={4} mx='3em' _first={{ marginTop: '1em' }} _last={{ marginBottom: '1em' }}>
      <Box
        as='h1'
        mb={4}
        textAlign='left'
        width='max-content'
        fontWeight='bold'
        fontSize='1.2rem'
        className={highlightClasses[category]}
      >
        {displayNames[category]}
      </Box>

      <VStack spacing={2}>
        <FormControl as='form' onSubmit={handleSubmit}>
          <Flex width='100%' mb={4} alignItems='center'>
            <VisuallyHidden as='label' htmlFor={addEntityInputId}>
              Add {displayNames[category]}
            </VisuallyHidden>
            <Input
              id={addEntityInputId}
              mr={2}
              border='1px solid'
              borderColor='grey'
              borderRadius='0'
              bg='white'
              placeholder={`Add ${displayNames[category]}`}
              value={inputValue}
              onChange={handleInputChange}
            />
            {addIcon}
          </Flex>
        </FormControl>

        {filteredResults.map((r) => (
          <ResultRow
            result={r}
            key={r.id}
            onDeleteClick={() => onResultDelete(r)}
            onSelectedConceptChange={onSelectedConceptChange}
          />
        ))}
      </VStack>
    </Box>
  )
}

export default function AnalysisPane ({
  resultChunks,
  onResultDelete,
  onResultAdd,
  onSelectedConceptChange
}) {
  const allResults = useMemo(() => [].concat(...resultChunks), [resultChunks])

  return (
    <div className={cs(s.base)}>
      {CATEGORIES.map((cat) => (
        <ResultTable
          key={cat}
          results={allResults}
          category={cat}
          onResultDelete={onResultDelete}
          onResultAdd={onResultAdd}
          onSelectedConceptChange={onSelectedConceptChange}
        />
      ))}
    </div>
  )
}
