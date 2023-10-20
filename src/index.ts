// Copyright 2023 MFB Technologies, Inc.

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
