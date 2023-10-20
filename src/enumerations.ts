// Copyright 2022 MFB Technologies, Inc.

/** Enumeration of asynchronous request statuses. */
export const AsyncRequestStatusEnum = {
  INIT: "init",
  PENDING: "pending",
  FULFILLED: "fulfilled",
  ERROR: "error"
} as const
/** Possible status of async requests, e.g., createAsyncThunk()'s return. */
export type AsyncRequestStatus =
  (typeof AsyncRequestStatusEnum)[keyof typeof AsyncRequestStatusEnum]
