import { Autocomplete, Group, Avatar, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react'; // Ensure this package is installed
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import classes from './NavigationBar.module.css'; // Ensure the correct CSS file name
import logo from '../images/logo_square.png';

// Ensure correct typing for user
interface User {
  username: string;
  image?: string;
}


export function NavigationBar() {
  const { user, logout } = useAuth(); // Use logout from AuthProvider

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <img src={logo} alt="Logo" style={{ height: '60px', marginRight: '10px' }} />
          </Link>
          {user && (
            <>
              <Link to="/messages">
                <Text fw={500} size="sm" lh={1} mr={3}>Messages</Text>
              </Link>
              <Link to="/create-experience">
                <Text fw={500} size="sm" lh={1} mr={3}>Create Experience</Text>
              </Link>
            </>
          )}
        </Group>

        <Group>
          {user ? (
            <Group>
              <Text fw={500} size="sm" mr={10}>Welcome, {user.username}</Text>
              <Button onClick={logout} color="red" size="sm">Logout</Button>
            </Group>
          ) : (
            <Link to="/sign-in">
              <Text fw={500} size="sm">Sign In</Text>
            </Link>
          )}
        </Group>
      </div>
    </header>
  );
}
