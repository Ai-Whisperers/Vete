'use client'

import { useState } from 'react'

export default function SimplePocPage() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Simple Hook Proof of Concept</h1>
      <p>This page demonstrates a simple `useState` hook.</p>

      <div
        style={{
          marginTop: '2rem',
          border: '1px solid #ccc',
          padding: '1rem',
          borderRadius: '8px',
        }}
      >
        <h2>Counter:</h2>
        <p data-testid="count-display">Count: {count}</p>
        <button onClick={() => setCount(count + 1)}>Increment</button>
      </div>
    </div>
  )
}
