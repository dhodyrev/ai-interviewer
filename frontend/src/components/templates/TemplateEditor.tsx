import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  Select,
  useToast,
  IconButton,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import api from '../../services/api';
import { debounce } from 'lodash';

interface Question {
  text: string;
  type: 'open' | 'scale' | 'multiple-choice';
  options?: string[];
  followUpStrategy?: string;
  order: number;
}

const TemplateEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [template, setTemplate] = useState({
    title: '',
    description: '',
    product: '',
    goals: [''],
    questions: [] as Question[],
    systemPrompt: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Memoize the fetch template function
  const fetchTemplate = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/templates/${id}`);
      setTemplate(response.data.template);
    } catch (error) {
      setError('Failed to load template. Please try again later.');
      console.error('Error fetching template:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  // Handle unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleAddQuestion = useCallback(() => {
    setTemplate(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: '',
          type: 'open',
          order: prev.questions.length
        }
      ]
    }));
    setIsDirty(true);
  }, []);

  const handleRemoveQuestion = useCallback((index: number) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  }, []);

  const handleMoveQuestion = useCallback((index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === template.questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...template.questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    
    setTemplate(prev => ({
      ...prev,
      questions: newQuestions.map((q, i) => ({ ...q, order: i }))
    }));
    setIsDirty(true);
  }, [template.questions.length]);

  const handleAddOption = useCallback((questionIndex: number) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex
          ? { ...q, options: [...(q.options || []), ''] }
          : q
      )
    }));
    setIsDirty(true);
  }, []);

  const handleRemoveOption = useCallback((questionIndex: number, optionIndex: number) => {
    setTemplate(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex
          ? { ...q, options: q.options?.filter((_, j) => j !== optionIndex) }
          : q
      )
    }));
    setIsDirty(true);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (id) {
        await api.put(`/templates/${id}`, template);
        toast({
          title: 'Success',
          description: 'Template updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        await api.post('/templates', template);
        toast({
          title: 'Success',
          description: 'Template created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      setIsDirty(false);
      navigate('/templates');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [template, id, navigate, toast]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      onOpen();
    } else {
      navigate('/templates');
    }
  }, [isDirty, navigate, onOpen]);

  const confirmCancel = useCallback(() => {
    onClose();
    navigate('/templates');
  }, [navigate, onClose]);

  if (isLoading && !template.title) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Error Loading Template
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          <FormControl isRequired>
            <FormLabel>Template Title</FormLabel>
            <Input
              value={template.title}
              onChange={(e) => {
                setTemplate(prev => ({ ...prev, title: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="Enter template title"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={template.description}
              onChange={(e) => {
                setTemplate(prev => ({ ...prev, description: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="Enter template description"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Product</FormLabel>
            <Input
              value={template.product}
              onChange={(e) => {
                setTemplate(prev => ({ ...prev, product: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="Enter product name"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Goals</FormLabel>
            <VStack spacing={2} align="stretch">
              {template.goals.map((goal, index) => (
                <HStack key={index}>
                  <Input
                    value={goal}
                    onChange={(e) => {
                      const newGoals = [...template.goals];
                      newGoals[index] = e.target.value;
                      setTemplate(prev => ({ ...prev, goals: newGoals }));
                      setIsDirty(true);
                    }}
                    placeholder="Enter a goal"
                  />
                  <IconButton
                    aria-label="Remove goal"
                    icon={<FiTrash2 />}
                    onClick={() => {
                      const newGoals = template.goals.filter((_, i) => i !== index);
                      setTemplate(prev => ({ ...prev, goals: newGoals }));
                      setIsDirty(true);
                    }}
                  />
                </HStack>
              ))}
              <Button
                leftIcon={<FiPlus />}
                onClick={() => {
                  setTemplate(prev => ({ ...prev, goals: [...prev.goals, ''] }));
                  setIsDirty(true);
                }}
              >
                Add Goal
              </Button>
            </VStack>
          </FormControl>

          <FormControl>
            <FormLabel>Questions</FormLabel>
            <VStack spacing={4} align="stretch">
              {template.questions.map((question, index) => (
                <Box
                  key={index}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor={borderColor}
                  bg={bgColor}
                >
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Question {index + 1}</Text>
                      <HStack>
                        <IconButton
                          aria-label="Move up"
                          icon={<FiArrowUp />}
                          onClick={() => handleMoveQuestion(index, 'up')}
                          isDisabled={index === 0}
                        />
                        <IconButton
                          aria-label="Move down"
                          icon={<FiArrowDown />}
                          onClick={() => handleMoveQuestion(index, 'down')}
                          isDisabled={index === template.questions.length - 1}
                        />
                        <IconButton
                          aria-label="Remove question"
                          icon={<FiTrash2 />}
                          onClick={() => handleRemoveQuestion(index)}
                        />
                      </HStack>
                    </HStack>

                    <FormControl isRequired>
                      <FormLabel>Question Text</FormLabel>
                      <Input
                        value={question.text}
                        onChange={(e) => {
                          const newQuestions = [...template.questions];
                          newQuestions[index].text = e.target.value;
                          setTemplate(prev => ({ ...prev, questions: newQuestions }));
                          setIsDirty(true);
                        }}
                        placeholder="Enter question text"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Question Type</FormLabel>
                      <Select
                        value={question.type}
                        onChange={(e) => {
                          const newQuestions = [...template.questions];
                          newQuestions[index].type = e.target.value as Question['type'];
                          setTemplate(prev => ({ ...prev, questions: newQuestions }));
                          setIsDirty(true);
                        }}
                      >
                        <option value="open">Open-ended</option>
                        <option value="scale">Scale</option>
                        <option value="multiple-choice">Multiple Choice</option>
                      </Select>
                    </FormControl>

                    {question.type === 'multiple-choice' && (
                      <FormControl>
                        <FormLabel>Options</FormLabel>
                        <VStack spacing={2} align="stretch">
                          {question.options?.map((option, optionIndex) => (
                            <HStack key={optionIndex}>
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newQuestions = [...template.questions];
                                  newQuestions[index].options![optionIndex] = e.target.value;
                                  setTemplate(prev => ({ ...prev, questions: newQuestions }));
                                  setIsDirty(true);
                                }}
                                placeholder="Enter option"
                              />
                              <IconButton
                                aria-label="Remove option"
                                icon={<FiTrash2 />}
                                onClick={() => handleRemoveOption(index, optionIndex)}
                              />
                            </HStack>
                          ))}
                          <Button
                            leftIcon={<FiPlus />}
                            onClick={() => handleAddOption(index)}
                          >
                            Add Option
                          </Button>
                        </VStack>
                      </FormControl>
                    )}
                  </VStack>
                </Box>
              ))}
              <Button
                leftIcon={<FiPlus />}
                onClick={handleAddQuestion}
              >
                Add Question
              </Button>
            </VStack>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>System Prompt</FormLabel>
            <Textarea
              value={template.systemPrompt}
              onChange={(e) => {
                setTemplate(prev => ({ ...prev, systemPrompt: e.target.value }));
                setIsDirty(true);
              }}
              placeholder="Enter system prompt for the AI interviewer"
              minH="200px"
            />
          </FormControl>

          <HStack justify="flex-end" spacing={4}>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
              size="lg"
            >
              {id ? 'Update Template' : 'Create Template'}
            </Button>
          </HStack>
        </VStack>
      </form>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Unsaved Changes</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            You have unsaved changes. Are you sure you want to leave?
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Stay
            </Button>
            <Button colorScheme="red" onClick={confirmCancel}>
              Leave
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TemplateEditor; 