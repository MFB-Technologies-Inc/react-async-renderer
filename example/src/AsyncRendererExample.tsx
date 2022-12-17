// Copyright 2022 MFB Technologies, Inc.

import {
  AsyncRequestStatus,
  AsyncRequestStatusEnum,
  createAsyncRenderer
} from "@mfbtech/react-async-renderer"
import { useState } from "react"
import "./AsyncRendererExample.css"

export function AsyncRendererExample() {
  const [currentAsyncRequestState, setCurrentAsyncRequestState] =
    useState<AsyncRequestStatus>(AsyncRequestStatusEnum.INIT)
  const asyncRequestError =
    currentAsyncRequestState === AsyncRequestStatusEnum.ERROR
      ? "some error occurred!"
      : null
  const asyncRequestData =
    currentAsyncRequestState === AsyncRequestStatusEnum.FULFILLED
      ? { data: "my data" }
      : null
  const renderer = createAsyncRenderer({
    status: currentAsyncRequestState,
    error: asyncRequestError,
    onCompletedSuccessfullyArgs: asyncRequestData
  })

  return (
    <div className="async-renderer-example">
      <h2>Async renderer example</h2>
      <div>
        <label htmlFor="asyncRequestStatus">
          Status of the long running process:
        </label>
        <select
          value={currentAsyncRequestState}
          onChange={e => {
            setCurrentAsyncRequestState(
              e.currentTarget.value as AsyncRequestStatus
            )
          }}
          id="asyncRequestStatus"
        >
          {Object.entries(AsyncRequestStatusEnum).map(([name, value]) => {
            return (
              <option key={value} value={value}>
                {name}
              </option>
            )
          })}
        </select>
      </div>
      <div>
        {renderer(
          args => {
            return <p className="renderer-result success">{args.data}</p>
          },
          {
            onInit: () => (
              <p className="renderer-result info">
                Waiting for long running process to start...
              </p>
            ),
            onLoading: () => (
              <p className="renderer-result loading">custom spinner...</p>
            ),
            onCompletedWithError: props => (
              <p className="renderer-result error">
                {props.errorMessage ?? "error"}
              </p>
            )
          }
        )}
      </div>
    </div>
  )
}
