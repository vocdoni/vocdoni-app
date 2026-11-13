import { act } from '@testing-library/react'
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import { defaultProcessValues, defaultQuestion, Process, SelectorTypes } from '../common'
import SelectionLimits, { isValidMaxChoices } from './SelectionLimits'

const threeOptions = [{ option: 'A' }, { option: 'B' }, { option: 'C' }]

let form: UseFormReturn<Process>

const SelectionLimitsHarness = ({ min, max }: { min: number | null; max: number | null }) => {
  form = useForm<Process>({
    defaultValues: {
      ...defaultProcessValues,
      questions: [
        {
          ...defaultQuestion,
          type: SelectorTypes.Multiple,
          options: threeOptions,
          minNumberOfChoices: min,
          maxNumberOfChoices: max,
        },
      ],
    },
  })

  return (
    <FormProvider {...form}>
      <SelectionLimits index={0} />
    </FormProvider>
  )
}

const validate = async () => {
  let valid = false
  await act(async () => {
    valid = await form.trigger('questions.0.maxNumberOfChoices')
  })
  return valid
}

describe('SelectionLimits', () => {
  it('accepts a max equal to the min ("choose exactly N")', async () => {
    render(<SelectionLimitsHarness min={2} max={2} />)

    expect(await validate()).toBe(true)
  })

  it('shows a max of 1 instead of an empty-looking select', () => {
    render(<SelectionLimitsHarness min={1} max={1} />)

    expect(screen.queryByText('Select...')).not.toBeInTheDocument()
    expect(screen.getAllByText('1')).toHaveLength(2)
  })

  it('explains the error in text, not only with a red outline', async () => {
    render(<SelectionLimitsHarness min={2} max={3} />)

    act(() => {
      form.setError('questions.0.maxNumberOfChoices', { message: 'Max must be greater than or equal to Min' })
    })

    expect(await screen.findByText('Max must be greater than or equal to Min')).toBeInTheDocument()
  })
})

describe('isValidMaxChoices', () => {
  it.each([
    [null, null, true],
    [null, 2, true],
    [0, 2, true],
    [2, null, true],
    [2, 2, true],
    [3, 2, true],
    [1, 2, false],
  ])('max %s with min %s is valid: %s', (max, min, expected) => {
    expect(isValidMaxChoices(max, min)).toBe(expected)
  })
})
