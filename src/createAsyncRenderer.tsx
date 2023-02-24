// Copyright 2022 MFB Technologies, Inc.

import React, { ReactElement } from "react"
import { AsyncUiModel } from "./index"
import { ErrorReport } from "./components/ErrorReport"
import { LoadingSpinner } from "./components/LoadingSpinner"
import { AsyncRequestStatus, AsyncRequestStatusEnum } from "./enumerations"

/**
 * The type for the on completed successfully callback function that does not expect any arguments.
 */
export type OnCompletedSuccessfullyWithoutArgs = {
  __onCompletedSuccessfullyWithoutArgsBrand: string
}

/**
 * The type for the on completed successfully callback function.
 *
 * If the callback data was not passed then invoke the callback without arguments. If the callback
 * data does exist then invoke the callback with arguments.
 */
export type OnCompletedSuccessfully<TArgs extends OnCompletedSuccessfullyArgs> =
  TArgs extends OnCompletedSuccessfullyWithoutArgs
    ? (() => ReactElement<any, any> | null) | JSX.Element
    : TArgs extends Record<any, any>
    ? (args: TArgs) => ReactElement<any, any> | null
    : never

/**
 * The type for the on completed successfully callback data argument.
 */
export type OnCompletedSuccessfullyArgs =
  | Record<any, any>
  | null
  | OnCompletedSuccessfullyWithoutArgs

/**
 * The accepted arguments of createAsyncRenderer.
 */
export type CreateAsyncRendererArgs<
  T extends OnCompletedSuccessfullyArgs = OnCompletedSuccessfullyWithoutArgs
> = {
  /** The status used to conditionally render the UI. */
  status: AsyncRequestStatus
  /** The error message associated with the status. */
  error: string | null
  /**
   * Data to be passed to the on completed successfully callback. If the data is `null` or `undefined` when
   * the status is fulfilled then the on completed with error callback will be invoked. If the data is not
   * specified in the arguments then nothing will be passed to the on completed successfully callback.
   */
  onCompletedSuccessfullyArgs?: T
}

/**
 * Creates a function that renders JSX/Components with respect to an asynchronous operation and, optionally,
 * its data.
 *
 * @example
 * ```ts
 * const SomeComponent = () => {
 *  // Get a renderer associated with specific status, error and/or success data
 *  const asyncRenderer = createAsyncRenderer({
 *    status: asyncStatusForConditionallyRenderingTheUi,
 *    error: errorAssociatedWithTheErrorStatus,
 *    // Optionally provide data to be validated and be used in the success UI
 *    onCompletedSuccessfullyArgs: dataThatShouldBeValidOnSuccessStatus
 *  })
 *
 *  // Return the JSX/Component with respect to the status of the async operation
 *  return asyncRenderer(
 *    dataThatShouldBeValidOnSuccessStatus => <MyComponent data={dataThatShouldBeValidOnSuccessStatus} />,
 *    // Optionally provide JSX/Component for error and/or loading UI
 *    {
 *      onCompletedWithError: errorAssociatedWithTheErrorStatus => <MyErrorComponent error={errorAssociatedWithTheErrorStatus} />,
 *      onLoading: <MyLoadingComponent />
 *    }
 *  )
 * }
 * ```
 */
export function createAsyncRenderer<
  T extends OnCompletedSuccessfullyArgs = OnCompletedSuccessfullyWithoutArgs
>(
  args: CreateAsyncRendererArgs<T>
): (
  /**
   * Invoked when the operation has successfully completed. If data was specified in the function args, then it will
   * be invoked with that data as long as it is not `null` or `undefined`.
   */
  onCompletedSuccessfully: OnCompletedSuccessfully<T>,
  optionalArgs?: {
    /**
     * Invoked when the operation has completed with an
     * error. Defaults to a generic error component.
     */
    onCompletedWithError?: JSX.Element | React.FC<{ errorMessage?: string }>
    /** Invoked when the operation is in progress. Defaults to a generic loading component. */
    onLoading?: JSX.Element | (() => JSX.Element)
    /** Invoked when the operation is initialized. Defaults to a generic loading component. */
    onInit?: JSX.Element | (() => JSX.Element)
  }
) => ReactElement<any, any> | null {
  return (onCompletedSuccessfully, optionalArgs) => {
    switch (args.status) {
      case AsyncRequestStatusEnum.ERROR: {
        return getErrorComponent(args.error, optionalArgs?.onCompletedWithError)
      }
      case AsyncRequestStatusEnum.PENDING: {
        return getLoadingComponent(optionalArgs?.onLoading)
      }
      case AsyncRequestStatusEnum.INIT: {
        return getInitComponent(optionalArgs?.onInit)
      }
      default: {
        const getOnSuccessComponentArgs = {
          onCompletedSuccessfully: onCompletedSuccessfully,
          error: args.error,
          onCompletedWithError: optionalArgs?.onCompletedWithError
        }
        if (
          Object.prototype.hasOwnProperty.call(
            args,
            "onCompletedSuccessfullyArgs"
          )
        ) {
          return getOnSuccessComponent({
            ...getOnSuccessComponentArgs,
            onCompletedSuccessfullyArgs: args.onCompletedSuccessfullyArgs
          })
        }
        return getOnSuccessComponent(getOnSuccessComponentArgs)
      }
    }
  }
}

/**
 * Convenience wrapper function to allow easy creation of renderers for ui models
 * that conform to the {@link AsyncUiModel} type
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createAsyncUiModelRenderer<
  T extends Record<string, any> | null
>(uiModel: AsyncUiModel<T>) {
  return createAsyncRenderer({
    onCompletedSuccessfullyArgs: uiModel.state,
    status: uiModel.status,
    error: uiModel.error
  })
}

function getOnSuccessComponent<T extends OnCompletedSuccessfullyArgs>(args: {
  onCompletedSuccessfully: OnCompletedSuccessfully<T>
  onCompletedSuccessfullyArgs?: T
  error: string | null
  onCompletedWithError?: JSX.Element | React.FC<{ errorMessage?: string }>
}): ReactElement<any, any> | null {
  if (
    Object.prototype.hasOwnProperty.call(args, "onCompletedSuccessfullyArgs")
  ) {
    if (
      args.onCompletedSuccessfullyArgs === null ||
      args.onCompletedSuccessfullyArgs === undefined
    ) {
      return getErrorComponent(args.error, args.onCompletedWithError)
    }

    // Manually assert types because of the TS limitation of not narrowing conditionals with generics
    const onCompletedSuccessfullyArgs =
      args.onCompletedSuccessfullyArgs as Record<any, any>
    const onCompletedSuccessfullyWithArgs =
      args.onCompletedSuccessfully as OnCompletedSuccessfully<
        typeof onCompletedSuccessfullyArgs
      >

    return onCompletedSuccessfullyWithArgs(onCompletedSuccessfullyArgs)
  }
  // Manually assert type because of the TS limitation of not narrowing conditionals with generics
  const onCompletedSuccessfullyWithoutArgs =
    args.onCompletedSuccessfully as OnCompletedSuccessfully<OnCompletedSuccessfullyWithoutArgs>

  if (typeof onCompletedSuccessfullyWithoutArgs !== "function") {
    return onCompletedSuccessfullyWithoutArgs
  }
  return onCompletedSuccessfullyWithoutArgs()
}

function getErrorComponent(
  error: string | null,
  onCompletedWithError?: JSX.Element | React.FC<{ errorMessage?: string }>
): JSX.Element | null {
  if (!onCompletedWithError) {
    return renderGenericErrorComponent(error)
  }
  return typeof onCompletedWithError === "function"
    ? onCompletedWithError({ errorMessage: error !== null ? error : undefined })
    : onCompletedWithError
}

function getLoadingComponent(
  onLoading?: JSX.Element | (() => JSX.Element)
): JSX.Element {
  if (!onLoading) {
    return renderGenericLoadingComponent()
  }
  return typeof onLoading === "function" ? onLoading() : onLoading
}

function getInitComponent(
  onInit?: JSX.Element | (() => JSX.Element)
): JSX.Element {
  if (!onInit) {
    return renderGenericLoadingComponent()
  }
  return typeof onInit === "function" ? onInit() : onInit
}

function renderGenericErrorComponent(message: string | null): JSX.Element {
  return <ErrorReport message={message !== null ? message : undefined} />
}

function renderGenericLoadingComponent(): JSX.Element {
  return <LoadingSpinner />
}
