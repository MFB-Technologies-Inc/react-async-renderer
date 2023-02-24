// Copyright 2022 MFB Technologies, Inc.

import {
  AsyncRequestStatus,
  AsyncRequestStatusEnum,
  createAsyncRenderer,
  getCascadedAsyncState
} from "@mfbtech/react-async-renderer"
import { useState } from "react"
import "./CascadedAsyncStateExample.css"
import { useLongRunningProcess } from "./useLongRunningProcess"

export function CascadedAsyncStateExample() {
  const [startProcesses, setStartProcesses] = useState(false)
  const processThree = useLongRunningProcess(
    1000,
    "process 3 data",
    startProcesses === false
  )
  const processOne = useLongRunningProcess(
    3000,
    "process 1 data",
    startProcesses === false
  )
  const processTwo = useLongRunningProcess(
    3000,
    "process 2 data",
    // Delay process 2 until process 3 has finished
    startProcesses === false ||
      processThree.status !== AsyncRequestStatusEnum.FULFILLED
  )

  const cascadedStatus = getCascadedAsyncState([
    processOne,
    processTwo,
    processThree
  ])
  const renderer = createAsyncRenderer({
    ...cascadedStatus,
    onCompletedSuccessfullyArgs: {
      processOneData: processOne.data,
      processTwoData: processTwo.data,
      processThreeData: processThree.data
    }
  })

  function resetProcesses() {
    setStartProcesses(false)
    processThree.reset()
    processOne.reset()
    processTwo.reset()
  }

  return (
    <div className="cascaded-async-state-example">
      <h2>Cascaded async state example</h2>
      <p>
        Process 3 depends on process 2, which depends on process 1. Process 3 is
        hard coded to finish first, then process 1 and finally process 2. The
        success state will not be rendered until process 3 and its dependencies
        have finished. If any of the processes fail then the error state will be
        rendered.
      </p>
      <div>
        <button onClick={resetProcesses}>Reset</button>
        <p>process 1 status: {getAsyncStatusUi(processOne.status)}</p>
        <p>process 2 status: {getAsyncStatusUi(processTwo.status)}</p>
        <p>process 3 status: {getAsyncStatusUi(processThree.status)}</p>
      </div>
      <div>
        {renderer(
          data => (
            <>
              {Object.entries(data).map(([key, value]) => (
                <p key={key}>{value}</p>
              ))}
            </>
          ),
          {
            onInit: () => (
              <button
                onClick={() => {
                  setStartProcesses(true)
                }}
              >
                Start
              </button>
            )
          }
        )}
      </div>
    </div>
  )
}

function getAsyncStatusUi(status: AsyncRequestStatus) {
  switch (status) {
    case AsyncRequestStatusEnum.INIT: {
      return "🔵 - init"
    }
    case AsyncRequestStatusEnum.PENDING: {
      return "🟡 - pending"
    }
    case AsyncRequestStatusEnum.FULFILLED: {
      return "🟢 - fulfilled"
    }
    case AsyncRequestStatusEnum.ERROR: {
      return "🔴 - error"
    }
    default: {
      return "wasn't expecting that status... 🤷‍♂️"
    }
  }
}
