import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chat from '../Chat';

// Mock the OpenAI module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Test response from assistant'
              }
            }
          ]
        })
      }
    }
  }));
});

describe('Chat Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the chat interface', () => {
    render(<Chat />);
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('sends a message and receives a response', async () => {
    render(<Chat />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    // Type a message
    fireEvent.change(input, { target: { value: 'Hello, I want to book an appointment' } });
    
    // Send the message
    fireEvent.click(sendButton);

    // Check if the user message appears
    await waitFor(() => {
      expect(screen.getByText('Hello, I want to book an appointment')).toBeInTheDocument();
    });

    // Check if the assistant response appears
    await waitFor(() => {
      expect(screen.getByText('Test response from assistant')).toBeInTheDocument();
    });
  });

  it('handles empty messages', () => {
    render(<Chat />);
    
    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);

    // The send button should be disabled for empty messages
    expect(sendButton).toBeDisabled();
  });
}); 