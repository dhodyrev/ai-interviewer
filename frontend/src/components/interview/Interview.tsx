import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useToast,
  Spinner,
  Avatar,
  Flex,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSend, FiX } from 'react-icons/fi';
import api from '../../services/api';
import socket from '../../services/socket';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    sentiment?: string;
    keyThemes?: string[];
    followUpNeeded?: boolean;
  };
}

const Interview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await api.get(`/sessions/${id}`);
        setSession(response.data.session);
        setMessages(response.data.session.messages || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load interview session',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/sessions');
      }
    };

    fetchSession();
  }, [id, navigate, toast]);

  useEffect(() => {
    socket.connect();
    socket.joinSession(id!);

    socket.onSessionJoined((data) => {
      setMessages(data.messages);
    });

    socket.onNewMessages((data) => {
      setMessages(prev => [...prev, ...data.messages]);
    });

    socket.onSessionEnded((data) => {
      toast({
        title: 'Interview Completed',
        description: 'The interview has been completed and insights have been generated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate(`/sessions/${id}`);
    });

    return () => {
      socket.leaveSession();
      socket.disconnect();
    };
  }, [id, navigate, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    try {
      socket.sendMessage(input);
      setInput('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    try {
      await api.post(`/sessions/${id}/end`);
      socket.endSession();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end session',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box h="100vh" display="flex" flexDirection="column">
      <Flex
        p={4}
        borderBottom="1px"
        borderColor={borderColor}
        bg={bgColor}
        justify="space-between"
        align="center"
      >
        <Text fontSize="xl" fontWeight="bold">
          {session?.template?.name || 'Interview'}
        </Text>
        <Button
          colorScheme="red"
          variant="outline"
          leftIcon={<FiX />}
          onClick={handleEndSession}
        >
          End Interview
        </Button>
      </Flex>

      <Box flex={1} overflowY="auto" p={4}>
        <VStack spacing={4} align="stretch">
          {messages.map((message, index) => (
            <HStack
              key={index}
              align="flex-start"
              spacing={4}
              justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
            >
              {message.role === 'assistant' && (
                <Avatar
                  size="sm"
                  name="AI Interviewer"
                  bg="blue.500"
                />
              )}
              <Box
                maxW="70%"
                p={3}
                borderRadius="lg"
                bg={message.role === 'user' ? 'blue.500' : 'gray.100'}
                color={message.role === 'user' ? 'white' : 'black'}
              >
                <Text>{message.content}</Text>
                {message.metadata?.sentiment && (
                  <Text fontSize="xs" mt={1}>
                    Sentiment: {message.metadata.sentiment}
                  </Text>
                )}
              </Box>
              {message.role === 'user' && (
                <Avatar
                  size="sm"
                  name="You"
                  bg="gray.500"
                />
              )}
            </HStack>
          ))}
          {isLoading && (
            <HStack spacing={4}>
              <Avatar
                size="sm"
                name="AI Interviewer"
                bg="blue.500"
              />
              <Box p={3} borderRadius="lg" bg="gray.100">
                <Spinner size="sm" />
              </Box>
            </HStack>
          )}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      <Box p={4} borderTop="1px" borderColor={borderColor} bg={bgColor}>
        <form onSubmit={handleSendMessage}>
          <HStack>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <IconButton
              type="submit"
              colorScheme="blue"
              aria-label="Send message"
              icon={<FiSend />}
              isLoading={isLoading}
            />
          </HStack>
        </form>
      </Box>
    </Box>
  );
};

export default Interview; 