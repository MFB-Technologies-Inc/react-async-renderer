// Copyright 2021 MFB Technologies, Inc.

import "./LoadingSpinner.css"

export const LoadingSpinner: React.FC = () => (
  <div className="spinner">
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 144 144"
      xmlSpace="preserve"
    >
      <g>
        <path
          opacity="0.9"
          d="M36.7,97.6L36.7,97.6l-16,16c-2.3,2.7-2.1,6.8,0.4,9.3c1.3,1.3,3.1,2,4.8,2c1.6,0,3.2-0.6,4.6-1.7l16.2-16.3
                    c2.3-2.7,2.1-6.7-0.4-9.2C43.7,95,39.4,95,36.7,97.6z"
        />
        <path
          opacity="0.85"
          d="M28.9,78.8L28.9,78.8l0.5,0c3.5-0.3,6.3-3.3,6.3-6.8c0-3.7-3.1-6.8-6.8-6.8l-22.7,0C2.7,65.5,0,68.5,0,72
                    c0,3.6,2.8,6.6,6.4,6.8l22-0.1H28.9z"
        />
        <path
          opacity="0.8"
          d="M31.2,21.5l-0.8-0.8c-2.7-2.3-6.8-2.1-9.2,0.4c-2.6,2.6-2.7,6.7-0.3,9.4l16.3,16.2c1.3,1.1,2.8,1.6,4.4,1.6
                    c1.8,0,3.5-0.7,4.8-2c2.7-2.7,2.7-7,0-9.6L31.2,21.5z M46,37L46,37L46,37L46,37z"
        />
        <path
          opacity="0.3"
          d="M72,0c-3.6,0-6.6,2.8-6.8,6.4l0.1,23c0.3,3.5,3.3,6.3,6.8,6.3c3.8,0,6.8-3.1,6.8-6.8l0-21.5l0-1.2
                    C78.5,2.7,75.6,0,72,0z"
        />
        <path
          opacity="0.25"
          d="M102.5,48.4c1.7,0,3.5-0.7,4.8-2l15.2-15.2l0.8-0.8c2.3-2.7,2.1-6.8-0.4-9.3c-2.6-2.5-6.7-2.7-9.4-0.3L98,36.4
                    l-0.7,0.7c-2.3,2.7-2.1,6.7,0.4,9.2C99,47.7,100.7,48.4,102.5,48.4z"
        />
        <path
          opacity="0.2"
          d="M137.6,65.2L137.6,65.2l-22,0l-1.1,0c-3.5,0.3-6.3,3.3-6.3,6.8c0,3.7,3.1,6.8,6.8,6.8l22.7,0
                    c3.5-0.3,6.3-3.3,6.3-6.8C144,68.4,141.2,65.4,137.6,65.2z"
        />
        <path
          opacity="0.15"
          d="M107.6,98l-0.7-0.8c-2.7-2.3-6.7-2.1-9.2,0.4c-1.3,1.3-2,3-2,4.8s0.7,3.5,2,4.8l15.2,15.2l0.8,0.8
                    c1.3,1.1,2.8,1.6,4.4,1.6c1.8,0,3.5-0.7,4.9-2c2.5-2.6,2.7-6.7,0.3-9.4L107.6,98z"
        />
        <path
          opacity="0.1"
          d="M78.8,114.6L78.8,114.6c-0.3-3.6-3.3-6.3-6.8-6.3c-3.8,0-6.8,3.1-6.8,6.8l0,21.5l0,1.2
                    c0.3,3.5,3.3,6.2,6.8,6.2c3.6,0,6.6-2.8,6.8-6.4l-0.1-22V114.6z"
        />
      </g>
    </svg>
    <span className="alt-text">Loading...</span>
  </div>
)
