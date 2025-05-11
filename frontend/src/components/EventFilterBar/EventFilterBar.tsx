import React, { useEffect, useState } from "react";
import {
  Button,
  MultiSelect,
  Checkbox,
  Stack,
  Group,
  Select,
  Title,
  Divider
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import Api, { API_BASE } from '@/api/API';

export function EventFilterBar({ onFilterChange }: { onFilterChange: (query: URLSearchParams) => void }) {
  const [tags, setTags] = useState<{ value: string; label: string }[]>([]);
  const [tagsInclude, setTagsInclude] = useState<string[]>([]);
  const [tagsExclude, setTagsExclude] = useState<string[]>([]);
  const [date, setDate] = useState<Date | null>(null);
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
  const [radius, setRadius] = useState("10");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    Api.instance.get(`${API_BASE}/general/tags`).then((res) => {
      const tagOptions = res.data.tags.map((t: any) => ({ label: t.tag_name, value: t.tag_name }));
      setTags(tagOptions);
    });
  }, []);

  useEffect(() => {
    const el = document.getElementById("place-autocomplete");
    if (el) {
      el.addEventListener("gmpx-placeautocomplete-placechange", (event: any) => {
        const place = event.detail;
        const lat = place.geometry?.location?.lat();
        const lon = place.geometry?.location?.lng();
        if (lat && lon) setCoords({ lat, lon });
      });
    }
  }, []);

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
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>Location</label>
          <div id="place-autocomplete" style={{ width: "100%", height: "40px" }}></div>
        </div>
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