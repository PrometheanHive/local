import { Autocomplete, Group, Burger, Avatar, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import classes from './NavigationBar.module.css'; // Make sure to update your CSS file name accordingly
import logo from '../images/logo_square.png';


const userTest = {
    name: 'Jane Spoonfighter',
    email: 'janspoon@fighter.dev',
    image: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png',
};

export function NavigationBar() {
    const [opened, { toggle }] = useDisclosure(false);
    const { user, setUser } = useAuth();

    return (
        <header className={classes.header}>
            <div className={classes.inner}>
                <Group>
                    <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {/* <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Local</div> Replaced MantineLogo with a text label */}
                        <img src={logo} alt="Logo" style={{ height: '60px', marginRight: '10px' }} />
                    </Link>
                    {user ? (<>
                        <Link style={{ textDecoration: "none", color: "black" }} to="/messages"><Text fw={500} size="sm" lh={1} mr={3}>Messages</Text></Link>
                        <Link style={{ textDecoration: "none", color: "black" }} to="/create-experience"><Text fw={500} size="sm" lh={1} mr={3}>Create Experience</Text></Link>
                    </>
                    ) : null}
                </Group>
                <Group>
                    <Group ml={50} gap={5} className={classes.links}>
                        {user ? (
                            <Link style={{ textDecoration: "none", color: "black" }} to="/sign-in">
                                <Text fw={500} size="sm" lh={1} mr={3}>
                                    Welcome {user.username}
                                </Text>
                            </Link>
                        ) : (
                            <Link style={{ textDecoration: "none", color: "black" }} to="/sign-in">
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

