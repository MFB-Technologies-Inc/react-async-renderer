// Copyright 2021 MFB Technologies, Inc.

import { getOptimisticAsyncLoadState } from ".."
import { AsyncRequestStatus } from "../enumerations"
import { getCascadedAsyncState, rtkqResultsToStatusError } from "../utils"

describe(`${rtkqResultsToStatusError.name}`, () => {
  it.each([
    [[{ isLoading: true }, { isLoading: true }], AsyncRequestStatus.PENDING],
    [[{ isSuccess: true }, { isLoading: true }], AsyncRequestStatus.PENDING],
    [[{ isError: true }, { isError: true }], AsyncRequestStatus.ERROR],
    [[{ isError: true }, { isLoading: true }], AsyncRequestStatus.ERROR],
    [[{ isError: true }, { isSuccess: true }], AsyncRequestStatus.ERROR],
    [[{ isSuccess: true }, { isSuccess: true }], AsyncRequestStatus.FULFILLED],
    [[{}, {}], AsyncRequestStatus.INIT]
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
      { status: AsyncRequestStatus.PENDING, error: null },
      { status: AsyncRequestStatus.INIT, error: null },
      { status: AsyncRequestStatus.INIT, error: null }
    ]
    const expectedState = {
      status: AsyncRequestStatus.PENDING,
      error: null
    }

    const result = getCascadedAsyncState(asyncStates)

    expect(result).toEqual(expectedState)
  })

  it("returns the first async state as an init state if it is init", () => {
    const asyncStates = [
      { status: AsyncRequestStatus.INIT, error: null },
      { status: AsyncRequestStatus.INIT, error: null },
      { status: AsyncRequestStatus.INIT, error: null }
    ]
    const expectedState = {
      status: AsyncRequestStatus.INIT,
      error: null
    }

    const result = getCascadedAsyncState(asyncStates)

    expect(result).toEqual(expectedState)
  })

  it("returns the next async state if the previous async state is fulfilled", () => {
    const asyncStates = [
      { status: AsyncRequestStatus.FULFILLED, error: null },
      { status: AsyncRequestStatus.PENDING, error: null },
      { status: AsyncRequestStatus.INIT, error: null }
    ]
    const expectedState = {
      status: AsyncRequestStatus.PENDING,
      error: null
    }

    const result = getCascadedAsyncState(asyncStates)

    expect(result).toEqual(expectedState)
  })

  it("returns the next async state as pending if it has a init status", () => {
    const asyncStates = [
      { status: AsyncRequestStatus.FULFILLED, error: null },
      { status: AsyncRequestStatus.INIT, error: null },
      { status: AsyncRequestStatus.INIT, error: null }
    ]
    const expectedState = {
      status: AsyncRequestStatus.PENDING,
      error: null
    }

    const result = getCascadedAsyncState(asyncStates)

    expect(result).toEqual(expectedState)
  })

  it("returns a fulfilled async state if all of the async states are fulfilled", () => {
    const asyncStates = [
      { status: AsyncRequestStatus.FULFILLED, error: null },
      { status: AsyncRequestStatus.FULFILLED, error: null },
      { status: AsyncRequestStatus.FULFILLED, error: null }
    ]
    const expectedState = {
      status: AsyncRequestStatus.FULFILLED,
      error: null
    }

    const result = getCascadedAsyncState(asyncStates)

    expect(result).toEqual(expectedState)
  })

  it("does not return the next async state if the previous async state is error", () => {
    const expectedError = "some error"
    const asyncStates = [
      { status: AsyncRequestStatus.FULFILLED, error: null },
      { status: AsyncRequestStatus.ERROR, error: expectedError },
      { status: AsyncRequestStatus.INIT, error: null }
    ]
    const expectedState = {
      status: AsyncRequestStatus.ERROR,
      error: expectedError
    }

    const result = getCascadedAsyncState(asyncStates)

    expect(result).toEqual(expectedState)
  })

  it(`returns status as ${AsyncRequestStatus.INIT} and error as null when the argument is an empty array`, () => {
    const asyncStates: Array<{
      status: AsyncRequestStatus
      error: string | null
    }> = []
    const expectedState = {
      status: AsyncRequestStatus.INIT,
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

    it(`return status as ${AsyncRequestStatus.FULFILLED}`, () => {
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatus.FULFILLED,
        error: null
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })
  })

  describe("isLoaded is false", () => {
    it(`return status as ${AsyncRequestStatus.INIT} if isLastActionLoad is false`, () => {
      const args: GetOptimisticAsyncLoadStateArgs = {
        isLoaded: false,
        isLastActionLoad: false
      }
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatus.INIT,
        error: null
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })

    it(`return status as ${AsyncRequestStatus.INIT} if isLastActionLoad is true and lastActionAsyncState is undefined`, () => {
      const args: GetOptimisticAsyncLoadStateArgs = {
        isLoaded: false,
        isLastActionLoad: true
      }
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatus.INIT,
        error: null
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })

    it(`return status as ${AsyncRequestStatus.INIT} if isLastActionLoad is true and lastActionAsyncState.status is ${AsyncRequestStatus.INIT}`, () => {
      const args: GetOptimisticAsyncLoadStateArgs = {
        isLoaded: false,
        isLastActionLoad: true,
        lastActionAsyncState: {
          status: AsyncRequestStatus.INIT,
          error: null
        }
      }
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatus.INIT,
        error: null
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })

    it(`return status as ${AsyncRequestStatus.PENDING} if isLastActionLoad is true and lastActionAsyncState.status is ${AsyncRequestStatus.PENDING}`, () => {
      const args: GetOptimisticAsyncLoadStateArgs = {
        isLoaded: false,
        isLastActionLoad: true,
        lastActionAsyncState: {
          status: AsyncRequestStatus.PENDING,
          error: null
        }
      }
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatus.PENDING,
        error: null
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })

    it(`return status as ${AsyncRequestStatus.FULFILLED} if isLastActionLoad is true and lastActionAsyncState.status is ${AsyncRequestStatus.FULFILLED}`, () => {
      const args: GetOptimisticAsyncLoadStateArgs = {
        isLoaded: false,
        isLastActionLoad: true,
        lastActionAsyncState: {
          status: AsyncRequestStatus.FULFILLED,
          error: null
        }
      }
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatus.FULFILLED,
        error: null
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })

    it(`return status as ${AsyncRequestStatus.ERROR} if isLastActionLoad is true and lastActionAsyncState.status is ${AsyncRequestStatus.ERROR}`, () => {
      const args: GetOptimisticAsyncLoadStateArgs = {
        isLoaded: false,
        isLastActionLoad: true,
        lastActionAsyncState: {
          status: AsyncRequestStatus.ERROR,
          error: "some error"
        }
      }
      const expectedResult: GetOptimisticAsyncLoadStateResult = {
        status: AsyncRequestStatus.ERROR,
        error: "some error"
      }

      const result = getOptimisticAsyncLoadState(args)

      expect(result).toEqual(expectedResult)
    })
  })
})
