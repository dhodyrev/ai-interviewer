import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useColorModeValue,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import api from '../../services/api';
import { debounce } from 'lodash';

interface Template {
  _id: string;
  title: string;
  description: string;
  product: string;
  goals: string[];
  questions: Array<{
    text: string;
    type: string;
    options?: string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

const TemplatesList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Memoize the fetch templates function
  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/templates');
      setTemplates(response.data.templates);
    } catch (error) {
      setError('Failed to load templates. Please try again later.');
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce the fetch templates function
  const debouncedFetchTemplates = useMemo(
    () => debounce(fetchTemplates, 300),
    [fetchTemplates]
  );

  useEffect(() => {
    debouncedFetchTemplates();
    return () => {
      debouncedFetchTemplates.cancel();
    };
  }, [debouncedFetchTemplates]);

  const handleDelete = async (template: Template) => {
    setSelectedTemplate(template);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!selectedTemplate) return;

    try {
      await api.delete(`/templates/${selectedTemplate._id}`);
      setTemplates(prev => prev.filter(t => t._id !== selectedTemplate._id));
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
      setSelectedTemplate(null);
    }
  };

  // Memoize the table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => 
    templates.map((template) => (
      <Tr key={template._id}>
        <Td>
          <VStack align="start" spacing={1}>
            <Text fontWeight="medium">{template.title}</Text>
            <Text fontSize="sm" color="gray.500" noOfLines={2}>
              {template.description}
            </Text>
          </VStack>
        </Td>
        <Td>
          <Badge colorScheme="blue">{template.product}</Badge>
        </Td>
        <Td>
          <Text>{template.questions.length} questions</Text>
        </Td>
        <Td>
          <Text>
            {new Date(template.createdAt).toLocaleDateString()}
          </Text>
        </Td>
        <Td>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit template"
              icon={<FiEdit2 />}
              onClick={() => navigate(`/templates/${template._id}`)}
              variant="ghost"
            />
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="More actions"
                icon={<FiMoreVertical />}
                variant="ghost"
              />
              <MenuList>
                <MenuItem
                  icon={<FiTrash2 />}
                  onClick={() => handleDelete(template)}
                >
                  Delete Template
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Td>
      </Tr>
    )),
    [templates, navigate]
  );

  if (isLoading) {
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
          Error Loading Templates
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">Interview Templates</Text>
        <Button
          colorScheme="blue"
          onClick={() => navigate('/templates/new')}
        >
          Create New Template
        </Button>
      </HStack>

      <Box
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
        bg={bgColor}
        overflow="hidden"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Product</Th>
              <Th>Questions</Th>
              <Th>Created</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tableRows}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Template</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete the template "{selectedTemplate?.title}"? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TemplatesList; 