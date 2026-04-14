import React from 'react';

const DeprecationNotice = () => {
  return (
    <div>
      <p>
        This endpoint is deprecated. Please use the following endpoint instead:
        <a href="/api/v2">v2</a>
      </p>
    </div>
  );
};

export default DeprecationNotice;