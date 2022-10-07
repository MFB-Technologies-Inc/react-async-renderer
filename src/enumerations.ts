// Copyright 2022 MFB Technologies, Inc.

/** possible status of async requests, e.g., createAsyncThunk()'s return */
export enum AsyncRequestStatus {
  INIT = "init",
  PENDING = "pending",
  FULFILLED = "fulfilled",
  ERROR = "error"
}