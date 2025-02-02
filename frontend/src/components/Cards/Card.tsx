import { Autocomplete, Group, Burger, Avatar, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { Card, Image, Badge, Button } from '@mantine/core';
import classes from './NavigationBar.module.css'; // Make sure to update your CSS file name accordingly

export function CardItem({title,description,imageUrl,available}:{title:any,description:any,imageUrl:any,available:any}) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder fluid>
        <Card.Section>
          <Image
            src= {imageUrl}
            height={200}
            width={200}
          />
        </Card.Section>
  
        <Group justify="space-between" mt="md" mb="xs">
          <Text fw={500}>{title}</Text>
          <Badge color="pink">{available} Spots Available</Badge>
        </Group>
  
        <Text size="sm" c="dimmed">
            {description}
        </Text>
  
        <Button color="blue" fullWidth mt="md" radius="md">
          Book now
        </Button>
      </Card>
    );
  }
  

