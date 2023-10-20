// Copyright 2023 MFB Technologies, Inc.

import { render } from "@testing-library/react"
import { ErrorReport } from "../ErrorReport"

it(`renders ${ErrorReport.name}`, () => {
  expect(() => render(<ErrorReport />)).not.toThrow()
})

it("displays the error message passed as props", () => {
  const testMessage = "Some error occurred"
  const { getByText } = render(<ErrorReport message={testMessage} />)
  expect(() => getByText(testMessage)).not.toThrow()
})
