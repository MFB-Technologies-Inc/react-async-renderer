// Copyright 2023 MFB Technologies, Inc.

import { AsyncRequestStatus, AsyncRequestStatusEnum } from "./enumerations"

export type INonErrorState = {
  status: Exclude<AsyncRequestStatus, "error">
  error: null
}

export type IErrorState = {
  status: typeof AsyncRequestStatusEnum.ERROR
  error: string
}

/**
 * Base type for a ui model that depends on async loading
 * for whether or not it has state to display
 */
export type AsyncUiModel<T extends Record<string, any> | null> =
  | ({ state: T } & INonErrorState)
  | ({ state: T } & IErrorState)

export type ComponentResult = React.JSX.Element
