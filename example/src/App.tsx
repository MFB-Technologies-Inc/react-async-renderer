// Copyright 2022 MFB Technologies, Inc.

import './App.css';
import { LoadingSpinner } from "@mfbtech/react-async-renderer"
import { AsyncRendererExample } from './AsyncRendererExample';
import { CascadedAsyncStateExample } from './CascadedAsyncStateExample';

export function App() {
  return (
    <div className="App">
      <div className='wrapper'>
        <h1>@mfbtech/react-async-renderer</h1>
        <AsyncRendererExample />
        <CascadedAsyncStateExample />
        <div>
          <h2>Default loading spinner example</h2>
          <LoadingSpinner />
          <p>Don't stare at it too long, it will drive you nuts! 🤪</p>
        </div>
      </div>
    </div>
  );
}
