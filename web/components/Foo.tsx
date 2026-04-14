import React from 'react';

interface FooProps {
  // Add props type if needed
}

const Foo: React.FC<FooProps> = () => {
  const [count, setCount] = React.useState<number>(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>Increment</button>
    </div>
  );
};

export default Foo;

For the provided list of files, I would need to review each file individually to identify and fix specific lint warnings. However, without access to the actual file contents, I can only provide general guidance.

To fix lint warnings in the listed files, I would:

1. Review each file for lint warnings using a linter like ESLint.
2. Address each warning by updating the code to adhere to the linting rules.
3. Ensure that all files are formatted consistently and follow the project's coding standards.

Since I don't have the actual file contents, I'll provide a placeholder response for each file: