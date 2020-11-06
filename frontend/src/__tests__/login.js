// __tests__/login.js
// again, these first two imports are something you'd normally handle in
// your testing framework configuration rather than importing them in every file.
import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import Login from '../login'

test('allows the user to login successfully', async () => {
  // mock out window.fetch for the test
  const fakeUserResponse = {token: 'fake_user_token'}
  jest.spyOn(window, 'fetch').mockImplementationOnce(() => {
    return Promise.resolve({
      json: () => Promise.resolve(fakeUserResponse),
    })
  })

  render(<Login />)

  // fill out the form
  fireEvent.change(screen.getByLabelText(/username/i), {
    target: {value: 'chuck'},
  })
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: {value: 'norris'},
  })

  fireEvent.click(screen.getByText(/submit/i))

  // just like a manual tester, we'll instruct our test to wait for the alert
  // to show up before continuing with our assertions.
  const alert = await screen.findByRole('alert')

  // .toHaveTextContent() comes from jest-dom's assertions
  // otherwise you could use expect(alert.textContent).toMatch(/congrats/i)
  // but jest-dom will give you better error messages which is why it's recommended
  expect(alert).toHaveTextContent(/congrats/i)
  expect(window.localStorage.getItem('token')).toEqual(fakeUserResponse.token)
})

