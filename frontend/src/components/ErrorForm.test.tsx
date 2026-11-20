import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ErrorForm from './ErrorForm'
import { parseTags, toFormValues, toInput, validate, type FormValues } from './errorFormModel'

describe('parseTags', () => {
  it('trims, lowercases and removes duplicates and blanks', () => {
    expect(parseTags(' NPE, spring ,, npe ,')).toEqual(['npe', 'spring'])
    expect(parseTags('')).toEqual([])
  })
})

describe('validate', () => {
  const empty: FormValues = toFormValues()

  it('requires title and error message', () => {
    expect(validate(empty)).toEqual({
      title: 'Title is required',
      errorMessage: 'Error message is required',
    })
  })

  it('limits the number of tags and tag length', () => {
    const tooMany = { ...empty, title: 'T', errorMessage: 'M', tags: 'a,b,c,d,e,f,g,h,i,j,k' }
    expect(validate(tooMany).tags).toMatch(/at most 10 tags/)
    const tooLong = { ...empty, title: 'T', errorMessage: 'M', tags: 'x'.repeat(41) }
    expect(validate(tooLong).tags).toMatch(/40 characters/)
  })

  it('accepts a valid record', () => {
    expect(validate({ ...empty, title: 'T', errorMessage: 'M', tags: 'npe' })).toEqual({})
  })
})

describe('toInput', () => {
  it('converts blank optional fields to null and parses tags', () => {
    const input = toInput({
      ...toFormValues(),
      title: '  Title  ',
      errorMessage: 'msg',
      tags: 'A, b',
    })
    expect(input).toMatchObject({
      title: 'Title',
      errorMessage: 'msg',
      stackTrace: null,
      source: null,
      tags: ['a', 'b'],
    })
  })
})

describe('ErrorForm', () => {
  it('shows validation messages and does not submit when invalid', async () => {
    const onSubmit = vi.fn()
    render(
      <ErrorForm submitLabel="Save" submitting={false} onSubmit={onSubmit} onCancel={() => {}} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Title is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the entered values when valid', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ErrorForm submitLabel="Save" submitting={false} onSubmit={onSubmit} onCancel={() => {}} />)

    await user.type(screen.getByLabelText(/Title/), 'NPE in service')
    await user.type(screen.getByLabelText(/Error message/), 'user is null')
    await user.type(screen.getByLabelText('Tags'), 'npe')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: 'NPE in service',
      errorMessage: 'user is null',
      tags: 'npe',
    })
  })
})
