import React from 'react';

const ApiVersionNotice = () => {
  return (
    <div>
      <p>
        This API is versioned. Please use the following endpoints:
        <ul>
          <li>
            <a href="/api/v1">v1</a>
          </li>
          <li>
            <a href="/api/v2">v2</a>
          </li>
        </ul>
      </p>
    </div>
  );
};

export default ApiVersionNotice;