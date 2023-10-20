// Copyright 2023 MFB Technologies, Inc.

import { getOptimisticAsyncLoadState } from ".."
import { AsyncRequestStatus, AsyncRequestStatusEnum } from "../enumerations"
import { getCascadedAsyncState, rtkqResultsToStatusError } from "../utils"

describe(`${rtkqResultsToStatusError.name}`, () => {
  it.each([
    [
      [{ isLoading: true }, { isLoading: true }],
      AsyncRequestStatusEnum.PENDING
    ],
    [
      [{ isSuccess: true }, { isLoading: true }],
      AsyncRequestStatusEnum.PENDING
    ],
    [[{ isError: true }, { isError: true }], AsyncRequestStatusEnum.ERROR],
    [[{ isError: true }, { isLoading: true }], AsyncRequestStatusEnum.ERROR],
    [[{ isError: true }, { isSuccess: true }], AsyncRequestStatusEnum.ERROR],
    [
      [{ isSuccess: true }, { isSuccess: true }],
      AsyncRequestStatusEnum.FULFILLED
    ],
    [[{}, {}], AsyncRequestStatusEnum.INIT]
  ])("correctly converts %s to %s", (results, expectedStatus) => {
    expect(rtkqResultsToStatusError(results).status).toEqual(expectedStatus)
  })
})

it("converts all errors to a single string", () => {
  const errors = [{ message: "im an error" }, "so am i", 0, undefined]
  const results = errors.map(error => ({ isError: true, error }))
  expect(rtkqResultsToStatusError(results).error).toEqual(expect.any(String))
})

describe(getCascadedAsyncState.name, () => {
  it("returns the first async state if it is not fulfilled", () => {
    const asyncStates = [
      { status: AsyncRequestStatusEnum.PENDING, error: null },
      { status: AsyncRequestStatusEnum.INIT, error: null },
      { status: AsyncRequestStatusEnum.INIT, error: null }
    ]
    const expectedState = {
      status: AsyncRequestStatusEnum.PENDING,
      error: null
    }

    const result = getCascadedAsyncState(asyncStates)

    expect(result).toEqual(expectedState)
  })

  it("returns the first async state as an init state if it is init", () => {
    const asyncStates = [
      { status: AsyncRequestStatusEnum.INIT, error: null },
      { status: AsyncRequestStatusEnum.INIT, error: null },
      { status: AsyncRequestStatusEnum.INIT, error: null }
    ]
    const expectedState = {
      status: AsyncRequestStatusEnum.INIT,
      error: null
    }

    const result = getCascadedAsyncState(asyncStates)

    expect(result).toEqual(expectedState)
  })

  it("returns the next async state if the previous async state is fulfilled", () => {
    const asyncStates = [
      { status: AsyncRequestStatusEnum.FULFILLED, error: null },
      { status: AsyncRequestStatusEnum.PENDING, error: null },
      { status: AsyncRequestStatusEnum.INIT, error: null }
    ]
    const expectedState = {
      status: AsyncRequestStatusEnum.PENDING,
      error: null
    }

    const result = getCascadedAsyncState(asyncStates)

    expect(result).toEqual(expectedState)
  })

  it("returns the next async state as pending if it has a init status", () => {
    const asyncStates = [
      { status: AsyncRequestStatusEnum.FULFILLED, error: null },
      { status: AsyncRequestStatusEnum.INIT, error: null },
      { status: AsyncRequestStatusEnum.INIT, error: null }
    ]
    const expectedState = {
      status: AsyncRequestStatusEnum.PENDING,
      error: null
    }

    const result = getCascadedAsyncState(asyncStates)

    expect(result).toEqual(expectedState)
  })

  it("returns a fulfilled async state if all of the async states are fulfilled", () => {
    const asyncStates = [
      { status: AsyncRequestStatusEnum.FULFILLED, error: null },
      { status: AsyncRequestStatusEnum.FULFILLED, error: null },
      { status: AsyncRequestStatusEnum.FULFILLED, error: null }
    ]
    const expectedState = {
      status: AsyncRequestStatusEnum.FULFILLED,
      error: null
    }

    const result = getCascadedAsyncState(asyncStates)

    expect(result).toEqual(expectedState)
  })

  it("does not return the next async state if the previous async state is error", () => {
    const expectedError = "some error"
    const asyncStates = [
      { status: AsyncRequestStatusEnum.FULFILLED, error: null },
      { status: AsyncRequestStatusEnum.ERROR, error: expectedError },
      { status: AsyncRequestStatusEnum.INIT, error: null }
    ]
    const expectedState = {
      status: AsyncRequestStatusEnum.ERROR,
      error: expectedError
    }

    const result = getCascadedAsyncState(asyncStates)

    expect(result).toEqual(expectedState)
  })

  it(`returns status as ${AsyncRequestStatusEnum.INIT} and error as null when the argument is an empty array`, () => {
    const asyncStates: Array<{
      status: AsyncRequestStatus
      error: string | null
    }> = []
    const expectedState = {
      status: AsyncRequestStatusEnum.INIT,
      error: null
    }

    const result = getCascadedAsyncState(asyncStates)

    expect(result).toEqual(expectedState)
  })
})

describe(getOptimisticAsyncLoadState.name, () => {
  type GetOptimisticAsyncLoadStateResult = ReturnType<
    typeof getOptimisticAsyncLoadState
  >
  type GetOptimisticAsyncLoadStateArgs = Parameters<
    typeof getOptimisticAsyncLoadState
  >[0]

  describe("isLoaded is true", () => {
    const args: GetOptimisticAsyncLoadStateArgs = {
      isLoaded: true,
      isLastActionLoad: true
    }

    it(`return status as ${AsyncRequestStatusEnum.FULFILLED}`, () => {
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatusEnum.FULFILLED,
        error: null
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })
  })

  describe("isLoaded is false", () => {
    it(`return status as ${AsyncRequestStatusEnum.INIT} if isLastActionLoad is false`, () => {
      const args: GetOptimisticAsyncLoadStateArgs = {
        isLoaded: false,
        isLastActionLoad: false
      }
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatusEnum.INIT,
        error: null
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })

    it(`return status as ${AsyncRequestStatusEnum.INIT} if isLastActionLoad is true and lastActionAsyncState is undefined`, () => {
      const args: GetOptimisticAsyncLoadStateArgs = {
        isLoaded: false,
        isLastActionLoad: true
      }
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatusEnum.INIT,
        error: null
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })

    it(`return status as ${AsyncRequestStatusEnum.INIT} if isLastActionLoad is true and lastActionAsyncState.status is ${AsyncRequestStatusEnum.INIT}`, () => {
      const args: GetOptimisticAsyncLoadStateArgs = {
        isLoaded: false,
        isLastActionLoad: true,
        lastActionAsyncState: {
          status: AsyncRequestStatusEnum.INIT,
          error: null
        }
      }
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatusEnum.INIT,
        error: null
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })

    it(`return status as ${AsyncRequestStatusEnum.PENDING} if isLastActionLoad is true and lastActionAsyncState.status is ${AsyncRequestStatusEnum.PENDING}`, () => {
      const args: GetOptimisticAsyncLoadStateArgs = {
        isLoaded: false,
        isLastActionLoad: true,
        lastActionAsyncState: {
          status: AsyncRequestStatusEnum.PENDING,
          error: null
        }
      }
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatusEnum.PENDING,
        error: null
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })

    it(`return status as ${AsyncRequestStatusEnum.FULFILLED} if isLastActionLoad is true and lastActionAsyncState.status is ${AsyncRequestStatusEnum.FULFILLED}`, () => {
      const args: GetOptimisticAsyncLoadStateArgs = {
        isLoaded: false,
        isLastActionLoad: true,
        lastActionAsyncState: {
          status: AsyncRequestStatusEnum.FULFILLED,
          error: null
        }
      }
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatusEnum.FULFILLED,
        error: null
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })

    it(`return status as ${AsyncRequestStatusEnum.ERROR} if isLastActionLoad is true and lastActionAsyncState.status is ${AsyncRequestStatusEnum.ERROR}`, () => {
      const args: GetOptimisticAsyncLoadStateArgs = {
        isLoaded: false,
        isLastActionLoad: true,
        lastActionAsyncState: {
          status: AsyncRequestStatusEnum.ERROR,
          error: "some error"
        }
      }
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatusEnum.ERROR,
        error: "some error"
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })
  })
})
