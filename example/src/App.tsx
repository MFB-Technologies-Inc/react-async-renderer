// Copyright 2022 MFB Technologies, Inc.

import './App.css';
import * as reactAsyncRenderer from "@mfbtech/react-async-renderer"

export function App() {
  const { LoadingSpinner } = reactAsyncRenderer

  return (
    <div className="App">
      <h1>@mfbtech/react-async-renderer</h1>
      <h2>Loading spinner example</h2>
      <div>
        <LoadingSpinner />
      </div>
    </div>
  );
}
