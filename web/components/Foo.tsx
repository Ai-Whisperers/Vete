import React from 'react';
import { logger } from '../lib/logger';

const Foo = () => {
  const handleClick = () => {
    logger.info('Button clicked');
  };

  return (
    <div>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
};

export default Foo;