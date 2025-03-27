import { Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import classes from './NavigationBar.module.css';
import logo from '../images/logo_square.png';

interface User {
  username: string;
  image?: string;
}

export function NavigationBar() {
  const [opened, { toggle }] = useDisclosure(false);
  const auth = useAuth();
  const user: User | null = auth?.user ?? null;

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group justify="space-between" style={{ flexWrap: 'wrap', width: '100%' }}>
          {/* Logo */}
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <img src={logo} alt="Logo" style={{ height: '60px', marginRight: '10px' }} />
          </Link>
          {/* Links */}
          <Group gap="xs" style={{ flexWrap: 'wrap' }}>
            {user && (
              <Link to="/create-experience" style={{ textDecoration: 'none', color: 'black' }}>
                <Text fw={500} size="sm">Create Experience</Text>
              </Link>
            )}
            <Link to="/sign-in" style={{ textDecoration: 'none', color: 'black' }}>
              <Text fw={500} size="sm">
                {user ? `Welcome ${user.username}` : 'Please sign in'}
              </Text>
            </Link>
          </Group>
        </Group>
      </div>
    </header>
  );
}

{/* <Link style={{ textDecoration: 'none', color: 'black' }} to="/messages">
                <Text fw={500} size="sm" lh={1} mr={3}>
                  Messages
                </Text>
              </Link> */}