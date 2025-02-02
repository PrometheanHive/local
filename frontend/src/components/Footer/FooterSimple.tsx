import { Anchor, Group, ActionIcon, rem, Container } from '@mantine/core';
import Logo from '../images/logo_square.png';
import classes from './FooterSimple.module.css';


const links = [
  { link: 'http://localhost:2999/', label: 'Contact' },
  { link: 'http://localhost:2999/', label: 'About Us' },
  { link: 'http://localhost:2999/', label: 'Privacy' },
  { link: 'http://localhost:2999/', label: 'Careers' },
];

export function FooterSimple() {
  const items = links.map((link) => (
    <Anchor<'a'>
      c="dimmed"
      key={link.label}
      href={link.link}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <img src={Logo} alt="Logo" style={{ height: '60px', marginRight: '10px' }} />
        <Group className={classes.links}>{items}</Group>
      </Container>
    </div>
  );
}