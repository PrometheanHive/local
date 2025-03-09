import { Group, Avatar, Text, Card, Image, Badge, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react'; // Ensure this package is installed
import classes from './NavigationBar.module.css'; // Ensure the correct CSS file name

interface CardItemProps {
  title: string;
  description: string;
  imageUrl: string;
  available: number;
}

export function CardItem({ title, description, imageUrl, available }: CardItemProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image src={imageUrl} height={200} width="100%" alt={title} />
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
