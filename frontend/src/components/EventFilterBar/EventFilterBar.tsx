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

interface EventFilterBarProps {
  onFilterChange: (query: URLSearchParams) => void;
  initialParams?: URLSearchParams;
  onClear?: () => void;
}

export function EventFilterBar({ onFilterChange, initialParams, onClear }: EventFilterBarProps) {
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
  const [showOld, setShowOld] = useState(false);

  useEffect(() => {
    Api.instance.get(`${API_BASE}/general/tags`).then((res) => {
      const tagOptions = res.data.tags.map((t: any) => ({ label: t.tag_name, value: t.tag_name }));
      setTags(tagOptions);
    });
  }, []);

  const parseYMD = (str: string): Date => {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);  // Constructs local date safely
  };

  useEffect(() => {
    if (initialParams) {
      const get = (key: string) => initialParams.get(key);
      const getList = (key: string) => (get(key) ? get(key)!.split(",") : []);
      
      if (get("date")) setDate(parseYMD(get("date")!));
      if (get("date_after") || get("date_before")) {
        setRange([
          get("date_after") ? parseYMD(get("date_after")!) : null,
          get("date_before") ? parseYMD(get("date_before")!) : null,
        ]);        
      }
      setTagsInclude(getList("tags_include"));
      setTagsExclude(getList("tags_exclude"));
      setAvailableOnly(get("available_only") === "true");
      if (get("user_lat") && get("user_lon")) {
        setCoords({ lat: parseFloat(get("user_lat")!), lon: parseFloat(get("user_lon")!) });
      }
      if (get("location")) setLocationName(get("location")!);
      if (get("radius")) setRadius(get("radius")!);

      setShowOld(get("show_old") === "true");
      
    }
  }, [initialParams]);

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

  const formatDate = (d: Date) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (date) params.append("date", formatDate(date));
    if (range[0]) params.append("date_after", formatDate(range[0]));
    if (range[1]) params.append("date_before", formatDate(range[1]));
    if (tagsInclude.length > 0) params.append("tags_include", tagsInclude.join(","));
    if (tagsExclude.length > 0) params.append("tags_exclude", tagsExclude.join(","));
    if (availableOnly) params.append("available_only", "true");
    if (coords && locationName) {
      params.append("user_lat", coords.lat.toString());
      params.append("user_lon", coords.lon.toString());
      params.append("radius", radius);
      params.append("location", locationName);
    }
    if (showOld) params.append("show_old", "true");
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
        <Checkbox
          label="Include Past Events"
          checked={showOld}
          onChange={(e) => setShowOld(e.currentTarget.checked)}
        />
      </Group>
      <Group>
        <Button onClick={applyFilters}>Apply Filters</Button>
        {onClear && <Button variant="outline" color="red" onClick={onClear}>Clear Filters</Button>}
      </Group>
      <Divider />
    </Stack>
  );
}