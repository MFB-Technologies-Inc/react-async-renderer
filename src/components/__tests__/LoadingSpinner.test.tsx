// Copyright 2023 MFB Technologies, Inc.

import { render } from "@testing-library/react"
import { LoadingSpinner } from "../LoadingSpinner"

it(`renders ${LoadingSpinner.name}`, () => {
  expect(() => render(<LoadingSpinner />)).not.toThrow()
})
