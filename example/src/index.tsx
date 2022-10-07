// Copyright 2022 MFB Technologies, Inc.

import './index.css';
import { App } from './App';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';

const container = document.getElementById('root');
const root = createRoot(container!); // non-null assertion because we use TypeScript (recommended by react)
root.render(<StrictMode><App /></StrictMode>);
