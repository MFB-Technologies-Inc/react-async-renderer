// Copyright 2023 MFB Technologies, Inc.

const text = {
  genericErrorMessage: "An error prevented rendering."
}

export type ErrorReportProps = {
  message?: string
}

export function ErrorReport(props: ErrorReportProps) {
  return (
    <div className="error-report">
      <p>{text.genericErrorMessage}</p>
      {props.message && <p>{props.message}</p>}
    </div>
  )
}
