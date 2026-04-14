import React from 'react';
import { logAuditEvent } from '../lib/utils';

const Foo = () => {
  const handleButtonClick = async () => {
    // Log audit event when button is clicked
    await logAuditEvent('BUTTON_CLICK', { buttonName: 'Foo Button' });
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Click me</button>
    </div>
  );
};

export default Foo;