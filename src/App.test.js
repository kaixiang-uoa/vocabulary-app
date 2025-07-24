import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main title', () => {
  render(<App />);
  const titleElement = screen.getByText(/单词学习/);
  expect(titleElement).toBeInTheDocument();
});
