// Copyright 2022 MFB Technologies, Inc.

import { createAsyncRenderer } from "../createAsyncRenderer"
import { AsyncRequestStatusEnum } from "../enumerations"

const onCompletedWithErrorSpy = jest.fn()
const onCompletedSuccessfullySpy = jest.fn()
const onLoadingSpy = jest.fn()
const onInitSpy = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

it("renders onCompletedSuccessfully when the operation has been completed", () => {
  const render = createAsyncRenderer({
    status: AsyncRequestStatusEnum.FULFILLED,
    error: null
  })

  render(onCompletedSuccessfullySpy)

  expect(onCompletedSuccessfullySpy).toHaveBeenCalledTimes(1)
})

it("renders onCompletedSuccessfully with the args passed to the hook", () => {
  const expectedData = { myTestData: "foo" }
  const render = createAsyncRenderer({
    status: AsyncRequestStatusEnum.FULFILLED,
    error: null,
    onCompletedSuccessfullyArgs: expectedData
  })

  render(onCompletedSuccessfullySpy)

  expect(onCompletedSuccessfullySpy).toHaveBeenCalledWith(
    expect.objectContaining(expectedData)
  )
})

it("renders onCompletedWithError when the operation has completed with an error", () => {
  const errorMessageMock = "foo"
  const render = createAsyncRenderer({
    status: AsyncRequestStatusEnum.ERROR,
    error: errorMessageMock
  })

  render(() => null, {
    onCompletedWithError: onCompletedWithErrorSpy
  })

  expect(onCompletedWithErrorSpy).toHaveBeenCalledTimes(1)
  expect(onCompletedWithErrorSpy).toHaveBeenCalledWith({
    errorMessage: errorMessageMock
  })
})

it("renders onCompletedWithError when the on completed successfully args are undefined", () => {
  const onCompletedSuccessfullyArgs = undefined
  const render = createAsyncRenderer({
    status: AsyncRequestStatusEnum.FULFILLED,
    error: null,
    onCompletedSuccessfullyArgs
  })

  render(onCompletedSuccessfullySpy, {
    onCompletedWithError: onCompletedWithErrorSpy
  })

  expect(onCompletedSuccessfullySpy).not.toHaveBeenCalled()
  expect(onCompletedWithErrorSpy).toHaveBeenCalled()
})

it("can render a generic error component if onCompletedWithError is not specified", () => {
  const errorMessageMock = "foo"
  const render = createAsyncRenderer({
    status: AsyncRequestStatusEnum.ERROR,
    error: errorMessageMock
  })

  const renderResult = render(() => null)

  expect(renderResult).not.toBe(null)
})

it("renders onLoading when the operation is pending", () => {
  const render = createAsyncRenderer({
    status: AsyncRequestStatusEnum.PENDING,
    error: null
  })

  render(() => null, {
    onLoading: onLoadingSpy
  })

  expect(onLoadingSpy).toHaveBeenCalledTimes(1)
})

it("can render a generic loading component if onLoading is not specified", () => {
  const render = createAsyncRenderer({
    status: AsyncRequestStatusEnum.PENDING,
    error: null
  })

  const renderResult = render(() => null)

  expect(renderResult).not.toBe(null)
})

it("renders onInit when the operation has been initialized", () => {
  const render = createAsyncRenderer({
    status: AsyncRequestStatusEnum.INIT,
    error: null
  })

  render(() => null, {
    onInit: onInitSpy
  })

  expect(onInitSpy).toHaveBeenCalledTimes(1)
})

it("can render a generic loading component if onInit is not specified", () => {
  const render = createAsyncRenderer({
    status: AsyncRequestStatusEnum.INIT,
    error: null
  })

  const renderResult = render(() => null)

  expect(renderResult).not.toBe(null)
})
