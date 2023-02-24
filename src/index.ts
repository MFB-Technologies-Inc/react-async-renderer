// Copyright 2022 MFB Technologies, Inc.

import { AsyncRequestStatusEnum, AsyncRequestStatus } from "./enumerations"

type INonErrorState = {
  status: Exclude<AsyncRequestStatus, "error">
  error: null
}

type IErrorState = {
  status: typeof AsyncRequestStatusEnum.ERROR
  error: string
}

export { AsyncRequestStatusEnum } from "./enumerations"
export { LoadingSpinner } from "./components/LoadingSpinner"
export {
  createAsyncRenderer,
  createAsyncUiModelRenderer
} from "./createAsyncRenderer"
export * from "./utils"
/**
 * Base type for a ui model that depends on async loading
 * for whether or not it has state to display
 */
export type AsyncUiModel<T extends Record<string, any> | null> =
  | ({ state: T } & INonErrorState)
  | ({ state: T } & IErrorState)
export type { AsyncRequestStatus } from "./enumerations"
