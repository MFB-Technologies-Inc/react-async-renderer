// Copyright 2022 MFB Technologies, Inc.

export { LoadingSpinner } from "./components/LoadingSpinner"
import { AsyncRequestStatus } from "./enumerations"

export {
  createAsyncRenderer,
  createAsyncUiModelRenderer
} from "./createAsyncRenderer"
export { AsyncRequestStatus } from "./enumerations"
export * from "./utils"

type INonErrorState = {
  status:
    | AsyncRequestStatus.INIT
    | AsyncRequestStatus.PENDING
    | AsyncRequestStatus.FULFILLED
  error: null
}

type IErrorState = {
  status: AsyncRequestStatus.ERROR
  error: string
}

/**
 * Base type for a ui model that depends on async loading
 * for whether or not it has state to display
 */
export type AsyncUiModel<T extends Record<string, any> | null> =
  | ({ state: T } & INonErrorState)
  | ({ state: T } & IErrorState)
