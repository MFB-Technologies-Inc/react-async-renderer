// Copyright 2023 MFB Technologies, Inc.

import { ComponentResult } from "../types"

const text = {
  genericErrorMessage: "An error prevented rendering."
}

export type ErrorReportProps = {
  message?: string
}

export function ErrorReport(props: ErrorReportProps): ComponentResult {
  return (
    <div className="error-report">
      <p>{text.genericErrorMessage}</p>
      {props.message && <p>{props.message}</p>}
    </div>
  )
}
