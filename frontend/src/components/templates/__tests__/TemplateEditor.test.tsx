import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import TemplateEditor from '../TemplateEditor';

// Mock the useParams hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: undefined }),
}));

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('TemplateEditor', () => {
  const renderTemplateEditor = () => {
    return render(
      <ChakraProvider>
        <TemplateEditor />
      </ChakraProvider>
    );
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