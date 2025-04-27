import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  useColorModeValue
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      bg={bgColor}
      px={4}
      borderBottom={1}
      borderStyle="solid"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Link as={RouterLink} to="/">
          <Text fontSize="xl" fontWeight="bold" color="blue.500">
            AI Interviewer
          </Text>
        </Link>

        <Flex alignItems="center">
          {isAuthenticated ? (
            <Stack direction="row" spacing={8} alignItems="center">
              <Link as={RouterLink} to="/templates" color="gray.600">
                Templates
              </Link>
              <Link as={RouterLink} to="/sessions" color="gray.600">
                Sessions
              </Link>
              
              <Menu>
                <MenuButton
                  as={Button}
                  rounded="full"
                  variant="link"
                  cursor="pointer"
                  minW={0}
                >
                  <Avatar
                    size="sm"
                    name={user?.name}
                    bg="blue.500"
                  />
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/profile">
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </Stack>
          ) : (
            <Stack direction="row" spacing={4}>
              <Button
                as={RouterLink}
                to="/login"
                variant="ghost"
              >
                Sign In
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                colorScheme="blue"
              >
                Sign Up
              </Button>
            </Stack>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar; 