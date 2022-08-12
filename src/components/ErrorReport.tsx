// Copyright 2022 MFB Technologies, Inc.

import React from "react"

const text = {
  genericErrorMessage: "An error prevented rendering."
}

export type ErrorReportProps = {
  message?: string
}

export const ErrorReport: React.FC<ErrorReportProps> = props => {
  return (
    <div className="error-report">
      <p>{text.genericErrorMessage}</p>
      {props.message && <p>{props.message}</p>}
    </div>
  )
}
