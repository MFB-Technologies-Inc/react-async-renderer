// Copyright 2022 MFB Technologies, Inc.

import { render } from "@testing-library/react"
import { LoadingSpinner } from "../LoadingSpinner"

it(`renders ${LoadingSpinner.name}`, () => {
  expect(() => render(<LoadingSpinner />)).not.toThrow()
})
