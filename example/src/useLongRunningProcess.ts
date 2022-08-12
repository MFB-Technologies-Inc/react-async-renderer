// Copyright 2022 MFB Technologies, Inc.

import { AsyncRequestStatus } from "@mfbtech/react-async-renderer"
import { useEffect, useState } from "react"

/** starts a process that takes the specified amount of time and returns the specified data. */
export function useLongRunningProcess<T>(processDurationInSeconds: number, processData: T, skip: boolean) {
  const [status, setStatus] = useState<AsyncRequestStatus>(AsyncRequestStatus.INIT)
  const [error, setError] = useState<null | string>(null)
  const [data, setData] = useState<null | T>(null)
  const [restart, setRestart] = useState(true)

  useEffect(() => {
    if (restart === false) {
      return
    }
    if (skip) {
      return
    }
    setStatus(AsyncRequestStatus.PENDING)
    startLongRunningProcess(processDurationInSeconds, processData).then(data => {
      setError(null)
      setStatus(AsyncRequestStatus.FULFILLED)
      setData(data)
    }).catch((err: unknown) => {
      setData(null)
      setStatus(AsyncRequestStatus.ERROR)
      let errorMessage = "error"
      if (typeof err === "string") {
        errorMessage = err
      }
      else if (err instanceof Error) {
        errorMessage = err.message
      }
      setError(errorMessage)
    }).finally(() => {
      setRestart(false)
    })
  }, [processData, processDurationInSeconds, restart, skip])

  return {
    status,
    error,
    data,
    reset: () => {
      setStatus(AsyncRequestStatus.INIT)
      setError(null)
      setData(null)
      setRestart(true)
    }
  }
}

function startLongRunningProcess<T>(processDurationInSeconds: number, processData: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(processData)
    }, processDurationInSeconds);
  })
}