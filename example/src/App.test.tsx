// Copyright 2022 MFB Technologies, Inc.

import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders package name', () => {
  render(<App />);
  const linkElement = screen.getByText("@mfbtech/react-async-renderer");
  expect(linkElement).toBeInTheDocument();
});
