import { render, screen } from '@testing-library/react';
import App from './App';
import './i18n';


test('renders main title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Vocabulary Learning/);
  expect(titleElement).toBeInTheDocument();
});
