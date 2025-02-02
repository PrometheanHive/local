import React, { useState } from 'react';
import { TextInput, Text, Textarea, NumberInput, Button, Group, Paper, Title, Container, PasswordInput, FileInput, Grid } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import Api, { API_BASE }  from '@/api/API';


export function ExperienceRegistration() {
    //Form to hold data
    const form = useForm({
      initialValues: {
        experience_id: '',
        number_of_guests: undefined,
        occurence_date: '', 
        special_info: ''
      },
    });
  
    const handleSubmit = async (values) => {
      console.log(JSON.stringify(values));
    //   not sure what to put for response here 
        // const response = await Api.instance.post(`${API_BASE}/general/event/create`, values);
      console.log(response);
      //Send data to backend 

    };
  
    return (
      <>
        <Container my={40}>
          <Paper padding="md" shadow="xs">
            <Title order={2} align="center" mb="lg">Experience Registration</Title>
            <Text align="center" size="sm" mb="lg">
              Please fill out the information below to secure your booking. 
            </Text>
            
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    required
                    label="Number of Participants"
                    {...form.getInputProps('number_of_guests')}
                    placeholder="Please select a number of guests"
                  />
                  <DateTimePicker
                    required
                    label="Experience Date"
                    {...form.getInputProps('selected_date')}
                    placeholder="Pick a date"
                  />
                  <Group position="apart" mt="md">
                    <Button type="submit">Submit</Button>
                  </Group>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Textarea
                    required
                    label="Special Information"
                    {...form.getInputProps('special_info')}
                    placeholder="Any special info you would like the host to know"
                    minRows={3}
                    />
                </Grid.Col>
              </Grid>
            </form>
          </Paper>
        </Container>
      </>
    );
  }
  