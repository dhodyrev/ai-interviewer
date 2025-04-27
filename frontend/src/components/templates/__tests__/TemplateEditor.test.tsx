import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TemplateEditor from '../TemplateEditor';

// Mock axios
jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  }),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Chakra UI components
jest.mock('@chakra-ui/react', () => ({
  ChakraProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  Input: ({ ...props }: any) => <input {...props} />,
  Textarea: ({ ...props }: any) => <textarea {...props} />,
  Select: ({ children, ...props }: any) => <select {...props}>{children}</select>,
  VStack: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  HStack: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  IconButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

// Mock the useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: undefined }),
  useNavigate: () => jest.fn(),
}));

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

describe('TemplateEditor', () => {
  const renderTemplateEditor = () => {
    return render(<TemplateEditor />);
  };

  it('renders the template editor form', () => {
    renderTemplateEditor();
    
    // Check for main form elements
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/goals/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/system prompt/i)).toBeInTheDocument();
  });

  it('allows adding a new question', () => {
    renderTemplateEditor();
    
    // Click the add question button
    const addQuestionButton = screen.getByText(/add question/i);
    fireEvent.click(addQuestionButton);
    
    // Check if the new question form appears
    expect(screen.getByLabelText(/question text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/question type/i)).toBeInTheDocument();
  });

  it('allows adding options to a question', () => {
    renderTemplateEditor();
    
    // Add a question first
    const addQuestionButton = screen.getByText(/add question/i);
    fireEvent.click(addQuestionButton);
    
    // Click the add option button
    const addOptionButton = screen.getByText(/add option/i);
    fireEvent.click(addOptionButton);
    
    // Check if the new option input appears
    expect(screen.getByLabelText(/option text/i)).toBeInTheDocument();
  });

  it('allows removing a question', () => {
    renderTemplateEditor();
    
    // Add a question first
    const addQuestionButton = screen.getByText(/add question/i);
    fireEvent.click(addQuestionButton);
    
    // Click the remove question button
    const removeQuestionButton = screen.getByText(/remove question/i);
    fireEvent.click(removeQuestionButton);
    
    // Check if the question form is removed
    expect(screen.queryByLabelText(/question text/i)).not.toBeInTheDocument();
  });
}); 