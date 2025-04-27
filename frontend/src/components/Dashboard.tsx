import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Icon,
  Flex,
  VStack
} from '@chakra-ui/react';
import { FiFileText, FiUsers, FiClock, FiTrendingUp } from 'react-icons/fi';
import api from '../services/api';

interface Template {
  _id: string;
  name: string;
  createdAt: string;
}

interface Session {
  _id: string;
  template: {
    name: string;
  };
  participant: {
    name: string;
  };
  status: string;
  createdAt: string;
}

const Dashboard = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalSessions: 0,
    completedSessions: 0,
    averageDuration: 0
  });

  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesRes, sessionsRes] = await Promise.all([
          api.get('/templates'),
          api.get('/sessions')
        ]);

        setTemplates(templatesRes.data.templates.slice(0, 5));
        setSessions(sessionsRes.data.sessions.slice(0, 5));

        // Calculate stats
        const allSessions = sessionsRes.data.sessions;
        setStats({
          totalTemplates: templatesRes.data.templates.length,
          totalSessions: allSessions.length,
          completedSessions: allSessions.filter((s: Session) => s.status === 'completed').length,
          averageDuration: calculateAverageDuration(allSessions)
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const calculateAverageDuration = (sessions: Session[]) => {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    if (completedSessions.length === 0) return 0;
    
    const totalDuration = completedSessions.reduce((acc, session) => {
      return acc + (session as any).duration;
    }, 0);
    
    return Math.round(totalDuration / completedSessions.length);
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading size="lg">Dashboard</Heading>
        <Button
          colorScheme="blue"
          onClick={() => navigate('/templates/create')}
        >
          Create New Template
        </Button>
      </Flex>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat
          px={6}
          py={4}
          bg={cardBg}
          borderRadius="lg"
          boxShadow="sm"
        >
          <StatLabel display="flex" alignItems="center">
            <Icon as={FiFileText} mr={2} /> Templates
          </StatLabel>
          <StatNumber>{stats.totalTemplates}</StatNumber>
          <StatHelpText>Total interview templates</StatHelpText>
        </Stat>

        <Stat
          px={6}
          py={4}
          bg={cardBg}
          borderRadius="lg"
          boxShadow="sm"
        >
          <StatLabel display="flex" alignItems="center">
            <Icon as={FiUsers} mr={2} /> Sessions
          </StatLabel>
          <StatNumber>{stats.totalSessions}</StatNumber>
          <StatHelpText>Total interviews conducted</StatHelpText>
        </Stat>

        <Stat
          px={6}
          py={4}
          bg={cardBg}
          borderRadius="lg"
          boxShadow="sm"
        >
          <StatLabel display="flex" alignItems="center">
            <Icon as={FiTrendingUp} mr={2} /> Completion
          </StatLabel>
          <StatNumber>
            {stats.totalSessions
              ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
              : 0}%
          </StatNumber>
          <StatHelpText>{stats.completedSessions} completed sessions</StatHelpText>
        </Stat>

        <Stat
          px={6}
          py={4}
          bg={cardBg}
          borderRadius="lg"
          boxShadow="sm"
        >
          <StatLabel display="flex" alignItems="center">
            <Icon as={FiClock} mr={2} /> Average Duration
          </StatLabel>
          <StatNumber>{stats.averageDuration} min</StatNumber>
          <StatHelpText>Per interview</StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Recent Activity Grid */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={8}>
        {/* Recent Templates */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="lg"
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Recent Templates</Heading>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/templates')}
            >
              View All
            </Button>
          </Flex>
          <VStack spacing={4} align="stretch">
            {templates.map(template => (
              <Box
                key={template._id}
                p={4}
                bg={useColorModeValue('gray.50', 'gray.600')}
                borderRadius="md"
                cursor="pointer"
                onClick={() => navigate(`/templates/${template._id}`)}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.500') }}
              >
                <Text fontWeight="medium">{template.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  Created {new Date(template.createdAt).toLocaleDateString()}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Recent Sessions */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="lg"
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Recent Sessions</Heading>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/sessions')}
            >
              View All
            </Button>
          </Flex>
          <VStack spacing={4} align="stretch">
            {sessions.map(session => (
              <Box
                key={session._id}
                p={4}
                bg={useColorModeValue('gray.50', 'gray.600')}
                borderRadius="md"
                cursor="pointer"
                onClick={() => navigate(`/sessions/${session._id}`)}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.500') }}
              >
                <Text fontWeight="medium">
                  {session.participant?.name || 'Anonymous'} - {session.template.name}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(session.createdAt).toLocaleDateString()} - {session.status}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </Grid>
    </Box>
  );
};

export default Dashboard; 