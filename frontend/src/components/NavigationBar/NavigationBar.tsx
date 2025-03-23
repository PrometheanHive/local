import { Autocomplete, Group, Avatar, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
//import { IconSearch } from '@tabler/icons-react'; // Ensure this package is installed
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
  const [opened, { toggle }] = useDisclosure(false);
  const auth = useAuth(); // Ensure context is not empty
  const user: User | null = auth?.user ?? null; // Properly handle missing user

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <img src={logo} alt="Logo" style={{ height: '60px', marginRight: '10px' }} />
          </Link>
          {user && (
            <>
              {/* <Link style={{ textDecoration: 'none', color: 'black' }} to="/messages">
                <Text fw={500} size="sm" lh={1} mr={3}>
                  Messages
                </Text>
              </Link> */}
              <Link style={{ textDecoration: 'none', color: 'black' }} to="/create-experience">
                <Text fw={500} size="sm" lh={1} mr={3}>
                  Create Experience
                </Text>
              </Link>
            </>
          )}
        </Group>
        <Group>
          <Group ml={50} gap={5} className={classes.links}>
            {user ? (
              <Link style={{ textDecoration: 'none', color: 'black' }} to="/sign-in">
                <Text fw={500} size="sm" lh={1} mr={3}>
                  Welcome {user.username}
                </Text>
              </Link>
            ) : (
              <Link style={{ textDecoration: 'none', color: 'black' }} to="/sign-in">
                <Text fw={500} size="sm" lh={1} mr={3}>
                  Please sign in
                </Text>
              </Link>
            )}
          </Group>
        </Group>
      </div>
    </header>
  );
}
