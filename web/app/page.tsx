import { Component } from 'react';
import { Router, useRouter } from 'next/router';

const App = () => {
  const router = useRouter();

  return (
    <div>
      <h1>Vete</h1>
      <nav>
        <ul>
          <li>
            <a href="/appointments">Appointments</a>
          </li>
        </ul>
      </nav>
      <Router />
    </div>
  );
};

export default App;