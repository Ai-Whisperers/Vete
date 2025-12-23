import { render, screen, fireEvent } from '@testing-library/react';
import SimplePocPage from '../app/simple-poc/page';

describe('Simple Hook Proof of Concept Page', () => {
  it('should render the initial count and increment on click', () => {
    render(<SimplePocPage />);

    // Check initial state
    const countDisplay = screen.getByTestId('count-display');
    expect(countDisplay).toHaveTextContent('Count: 0');

    // Find and click the button
    const incrementButton = screen.getByRole('button', { name: /increment/i });
    fireEvent.click(incrementButton);

    // Check for updated state
    expect(countDisplay).toHaveTextContent('Count: 1');
  });
});
