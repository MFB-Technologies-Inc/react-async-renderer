// Copyright 2021 MFB Technologies, Inc.

import { AsyncUiModel } from "./index"
import { AsyncRequestStatus } from "./enumerations"

/**
 * Convert an array of RTK-Query's status booleans to a
 * consolidated AsyncRequestStatus value that only indicates
 * success if all loads are successful
 *
 * @param  results - typically an array of result from an RTK-Query hook
 */
export function rtkqResultsToStatusError(
  results: {
    isLoading?: boolean
    isSuccess?: boolean
    isError?: boolean
    error?: unknown
  }[]
): { status: AsyncRequestStatus; error: string } {
  let status: AsyncRequestStatus = AsyncRequestStatus.INIT
  if (results.some(result => result.isError)) {
    status = AsyncRequestStatus.ERROR
  }
  if (
    status === AsyncRequestStatus.INIT &&
    results.some(result => result.isLoading)
  ) {
    status = AsyncRequestStatus.PENDING
  }
  if (results.every(result => result.isSuccess)) {
    status = AsyncRequestStatus.FULFILLED
  }

  const error = results.map(result => result.error).toString()

  return { status, error }
}

/**
 * Convenience function to compose an AsyncUiModel from constituent parts
 */
export function composeAsyncUiModel<T extends Record<string, any> | null>(
  state: T,
  status: AsyncRequestStatus,
  error: string
): AsyncUiModel<T> {
  if (status !== AsyncRequestStatus.ERROR) {
    return {
      status,
      error: null,
      state
    }
  } else {
    return {
      status: status,
      error: error,
      state
    }
  }
}

/**
 * Reduces the async state collection down into one state by assuming that any given state in the
 * collection is dependent upon its previous state, such that when its previous state is fulfilled
 * then its state can be reflected in the reduced state.
 *
 * @param asyncStateCollection A collection of async request states, where the first states in the
 * collection are the predecessors to the following states in the collection.
 * @returns A single state that reflects the overall status of each state in the collection.
 */
export function getCascadedAsyncState(
  asyncStateCollection: Array<Pick<AsyncUiModel<any>, "error" | "status">>
): Pick<AsyncUiModel<any>, "error" | "status"> {
  const initialAsyncState = { status: AsyncRequestStatus.INIT, error: null }
  return asyncStateCollection.reduce(
    (previousAsyncRequestState, currentAsyncRequestState, index) => {
      // Start off with the state of the first async request state
      if (index === 0) {
        return { ...currentAsyncRequestState }
      }
      // If the previous async request state is fulfilled then use the next async request state
      if (previousAsyncRequestState.status === AsyncRequestStatus.FULFILLED) {
        // Override the micro status with macro status
        if (currentAsyncRequestState.status === AsyncRequestStatus.INIT) {
          return {
            status: AsyncRequestStatus.PENDING,
            error: currentAsyncRequestState.error
          }
        }
        return { ...currentAsyncRequestState }
      }
      /* 
        If the previous async request state has not been fulfilled then do not reflect any other 
        states.
      */
      return previousAsyncRequestState
    },
    initialAsyncState
  )
}

/**
 * Converts the arguments into an optimistic asynchronous state, such that if the arguments indicate
 * that the associated resource is loaded, then the asynchronous state should be considered
 * fulfilled.
 */
export function getOptimisticAsyncLoadState(args: {
  isLoaded: boolean
  isLastActionLoad: boolean
  lastActionAsyncState?: {
    status: AsyncRequestStatus
    error: string | null
  }
}): { status: AsyncRequestStatus; error: string | null } {
  if (args.isLoaded) {
    return {
      status: AsyncRequestStatus.FULFILLED,
      error: null
    }
  } else if (
    args.isLastActionLoad === false ||
    args.lastActionAsyncState === undefined
  ) {
    return {
      status: AsyncRequestStatus.INIT,
      error: null
    }
  } else {
    return args.lastActionAsyncState
  }
}
