import React from 'react';

const MigrationGuide = () => {
  return (
    <div>
      <h1>Migration Guide</h1>
      <p>
        To migrate from v1 to v2, please follow these steps:
        <ol>
          <li>Update your API endpoint to use /api/v2</li>
          <li>Update your API requests to use the new endpoint</li>
        </ol>
      </p>
    </div>
  );
};

export default MigrationGuide;