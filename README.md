# React Async Renderer

Utilities for rendering JSX with respect to one or more asynchronous operations.

## Installation

```bash
npm install --save @mfbtech/react-async-renderer
```

## Usage

At the core of this package is `createAsyncRenderer`, which renders specific JSX for a given asynchronous operation.

```tsx
function useMyData() {
  const [status, setStatus] = useState<AsyncRequestStatus>(AsyncRequestStatus.INIT)
  const [error, setError] = useState<null | string>(null)
  const [data, setData] = useState<null | string>(null)

  // Logic to kick off a request for data and update local state respectively...

  return {
    status,
    error,
    data
  }
}

function MyDataComponent() {
  const myData = useMyData()
  const loadingRenderer = createAsyncRenderer({
    status: myData.status,
    error: myData.error,
    onCompletedSuccessfullyArgs: myData.data
  })

  return loadingRenderer(
    // Render the component with the validated data
    myValidatedData => (
      <div>
        <h1>My Data</h1>
        {myValidatedData}
      </div>
    ), 
    // Optional args that specify UI for specific states in the async operation
    {
      onCompletedWithError: <p>An error has occurred while fetching the data.</p>,
      onLoading: <p>Data is loading...</p>
      onInit: <p>Waiting for the data to be requested.</p>
  })
}
```

You can also use the `AsyncUiModel` with `createAsyncUiModelRenderer` and `composeAsyncUiModel` to simplify the code used in the consumer component.

```tsx
function useMyDataComponentUiModel() {
  const myData = useMyData()
  return composeAsyncUiModel(
    myData.data,
    myData.status,
    myData.error ?? ""
  )
}

function MyDataComponent() {
  const uiModel = useMyDataComponentUiModel()
  const loadingRenderer = createAsyncUiModelRenderer(uiModel)

  return loadingRenderer(
    myValidatedData => (
      <div>
        <h1>My Data</h1>
        {myValidatedData}
      </div>
  ))
}
```

These other utility functions can be used to simplify the logic around `createAsyncRenderer`:

- `rtkqResultsToStatusError`: Used specifically for converting [RTK Query Results](https://redux-toolkit.js.org/rtk-query/api/created-api/hooks#signature) to an asynchronous request object that can be used with `createAsyncRenderer`.
- `getCascadedAsyncState`: Reduces a chain of asynchronous request objects down one asynchronous request object.
- `getOptimisticAsyncLoadState`: Converts its arguments into an optimistic asynchronous request object such that if the arguments indicate a pending asynchronous request and a fulfilled asynchronous request, then the result is a fulfilled asynchronous request object.

## Changelog

[Changelog](./CHANGELOG.md)
