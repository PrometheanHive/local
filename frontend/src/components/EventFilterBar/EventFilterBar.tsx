import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  MultiSelect,
  Checkbox,
  Stack,
  Group,
  Select,
  Title,
  Divider,
  TextInput
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import Api, { API_BASE } from '@/api/API';

declare global {
  interface Window {
    google: any;
  }
}

export function EventFilterBar({ onFilterChange }: { onFilterChange: (query: URLSearchParams) => void }) {
  const [tags, setTags] = useState<{ value: string; label: string }[]>([]);
  const [tagsInclude, setTagsInclude] = useState<string[]>([]);
  const [tagsExclude, setTagsExclude] = useState<string[]>([]);
  const [date, setDate] = useState<Date | null>(null);
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  const [radius, setRadius] = useState("10");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const locationInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    Api.instance.get(`${API_BASE}/general/tags`).then((res) => {
      const tagOptions = res.data.tags.map((t: any) => ({ label: t.tag_name, value: t.tag_name }));
      setTags(tagOptions);
    });
  }, []);

  useEffect(() => {
    if (!window.google || !locationInputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(locationInputRef.current);
    autocomplete.setFields(["formatted_address", "geometry"]);

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        alert("Please select a valid place from the suggestions.");
        return;
      }

      const lat = place.geometry.location.lat();
      const lon = place.geometry.location.lng();
      const address = place.formatted_address ?? "";

      setCoords({ lat, lon });
      setLocationName(address);
    });
  }, [locationInputRef]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (date) params.append("date", date.toISOString().split("T")[0]);
    if (range[0]) params.append("date_after", range[0].toISOString());
    if (range[1]) params.append("date_before", range[1].toISOString());
    if (tagsInclude.length > 0) params.append("tags_include", tagsInclude.join(","));
    if (tagsExclude.length > 0) params.append("tags_exclude", tagsExclude.join(","));
    if (availableOnly) params.append("available_only", "true");
    if (coords) {
      params.append("user_lat", coords.lat.toString());
      params.append("user_lon", coords.lon.toString());
      params.append("radius", radius);
    }
    params.append("sort_by_date", "true");
    onFilterChange(params);
  };

  return (
    <Stack mb="md" gap="sm">
      <Title order={4}>Filter Experiences</Title>
      <Group grow>
        <DatePickerInput
          label="Specific Date"
          value={date}
          onChange={setDate}
          clearable
        />
        <DatePickerInput
          type="range"
          value={range}
          onChange={setRange}
          clearable
          placeholder="Pick date range"
        />
      </Group>
      <Group grow>
        <MultiSelect
          label="Include Tags"
          data={tags}
          value={tagsInclude}
          onChange={setTagsInclude}
          placeholder="Select tags to include"
        />
        <MultiSelect
          label="Exclude Tags"
          data={tags}
          value={tagsExclude}
          onChange={setTagsExclude}
          placeholder="Select tags to exclude"
        />
      </Group>
      <Group grow>
        <TextInput
          label="Location"
          placeholder="Start typing a location..."
          value={locationName}
          onChange={(e) => setLocationName(e.currentTarget.value)}
          ref={locationInputRef}
          style={{ flex: 1 }}
        />
        <Select
          label="Radius (miles)"
          data={["5", "10", "25", "50"]}
          value={radius}
          onChange={(val) => setRadius(val || "10")}
        />
        <Checkbox
          label="Available only"
          checked={availableOnly}
          onChange={(e) => setAvailableOnly(e.currentTarget.checked)}
        />
      </Group>
      <Button onClick={applyFilters}>Apply Filters</Button>
      <Divider />
    </Stack>
  );
}
