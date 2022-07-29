// Copyright 2022 MFB Technologies, Inc.

import './App.css';
import { AsyncRequestStatus, createAsyncRenderer, LoadingSpinner } from "@mfbtech/react-async-renderer"
import { useState } from 'react';

/*
createAsyncUiModelRenderer 
rtkqResultsToStatusError
composeAsyncUiModel
getCascadedAsyncState
getOptimisticAsyncLoadState
*/

export function App() {
  const [currentAsyncRequestState, setCurrentAsyncRequestState] = useState(AsyncRequestStatus.INIT)
  const asyncRequestError = currentAsyncRequestState === AsyncRequestStatus.ERROR ? "some error occurred!" : null
  const asyncRequestData = currentAsyncRequestState === AsyncRequestStatus.FULFILLED ? { data: "my data" } : null
  const renderer = createAsyncRenderer({
    status: currentAsyncRequestState,
    error: asyncRequestError,
    onCompletedSuccessfullyArgs: asyncRequestData,
  })

  return (
    <div className="App">
      <h1>@mfbtech/react-async-renderer</h1>
      <div>
        <h2>Async renderer example</h2>
        <div>
          <label htmlFor="asyncRequestStatus">Status of the long running process:</label>
          <select
            value={currentAsyncRequestState}
            onChange={(e) => {
              setCurrentAsyncRequestState(e.currentTarget.value as AsyncRequestStatus)
            }}
            id="asyncRequestStatus">
            {
              Object.entries(AsyncRequestStatus).map(([name, value]) => {
                return (
                  <option key={value} value={value}>{name}</option>
                )
              })
            }
          </select>
        </div>
        <div>
          {renderer((args) => {
            return (
              <p className='success'>{args.data}</p>
            )
          },
            {
              onInit: () => (<p className='info'>Waiting for long running process to start...</p>),
              onLoading: () => (<p className='info'>custom spinner...</p>),
              onCompletedWithError: (props) => (<p className='error'>{props.errorMessage ?? "error"}</p>)
            })}
        </div>
      </div>
      <div>
        <h2>Default loading spinner example</h2>
        <LoadingSpinner />
      </div>
    </div>
  );
}
