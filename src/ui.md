# Manifest driven UI

!!! warning

    Right now, manifests is not a feature available to users. We are working on
    providing a mechanism to make it easily accessible.

## Introduction

Our application features a dynamic map interface and an interactive form, both
driven by a flexible manifest system. This approach allows for easy
customization and extension of the application's functionality without modifying
the core components.

The map component displays geographical data based on the manifest's output,
while the form component generates input fields according to the manifest's
schema. They create a powerful and adaptable user interface for geographical
data exploration and visualization.

## Manifest Format

A manifest is a Javascript/Typescript object that defines the behavior and
structure of a specific map and form combination. It consists of three main
parts:

1. `source`: A string containing the JavaScript code to be executed on the
   server.
2. `form`: An array of form field definitions that specify the input controls
   for user interaction.
3. `about`: A string briefly describes the manifest's purpose.

Here's the structure of a manifest:

```typescript
interface Manifest {
  source: string;
  form: { [key: string]: string };
  about: string;
}
```

The `FormSchema` is an array of field definitions, each with properties like
`type`, `label`, `name`, and `defaultValue`. The available field types include
`string`, `text`, `checkbox`, `area`, `address`, and `range`.

## Example Manifest

Let's create an example manifest based on the countries.ts file. This manifest
will allow users to explore counties within different states.

```typescript
const manifest: Manifest = {
  source: `
    const areas = query.areas();

    const counties = areas.flatMap((area) => {
      const results = query.execute(
        \`nwr[admin_level=6][boundary=administrative][name](area=\${area.name})\`
      );
      return results.map((county) => {
        const center = county.bound().center();
        return {
          name: county.tags.name,
          lat: center.lat(),
          lon: center.lon(),
          state: area.name,
        };
      });
    });

    const payload = {
      type: "FeatureCollection",
      features: counties.map((county) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [county.lon, county.lat],
        },
        properties: {
          name: county.name,
          state: county.state,
        },
      })),
    };

    assert.geoJSON(payload);
    export { payload };
  `,
  form: [
    {
      type: "area",
      label: "State",
      name: "state",
      defaultValue: "colorado",
      hint: "Select a state to view its counties",
    },
  ],
  about:
    "This manifest allows users to explore counties within different states.",
};
```

In this example:

1. The `source` code fetches all areas (states) and their counties, creating a
   GeoJSON FeatureCollection.
2. The `form` includes a single "area" input that allows users to select a
   state.

When this manifest is used:

1. The form component will generate a dropdown for state selection.
2. Upon submission, the source code will be executed on the server with the
   selected state as a parameter.
3. The resulting GeoJSON will be used to update the map, displaying county
   locations for the selected state.

This example demonstrates how the manifest system allows for creating complex,
interactive geographical data visualizations with minimal code duplication and
maximum flexibility.

## Feature Properties

### Isochrone Visualization

Features can include special properties that enhance map visualization. One
powerful feature is the `isochrone` property, which integrates with the
[Mapbox Isochrone API](https://docs.mapbox.com/api/navigation/isochrone/) to
display reachable areas from a point location.

#### Basic Usage

To enable isochrone visualization for a Point feature, add the `isochrone`
property:

```javascript
const feature = center.asFeature({
  "marker-color": "#ff0000",
  legend: "Home Location",
  name: "My Home",
  isochrone: true, // Uses default settings
});
```

This will display drive-time polygons showing areas reachable in 15, 30, 45, and
60 minutes using the `driving-traffic` profile.

#### Advanced Configuration

For more control, pass an object with specific configuration options:

```javascript
const feature = center.asFeature({
  "marker-color": "#ff0000",
  legend: "Home Location",
  name: "My Home",
  isochrone: {
    profile: "walking", // Options: driving, driving-traffic, walking, cycling
    contours_minutes: [5, 10, 15], // Time-based contours (1-60 minutes)
    denoise: 1, // Remove smaller contours (0.0-1.0)
    generalize: 50, // Simplification tolerance in meters
  },
});
```

#### Distance-Based Isochrones

Instead of time-based contours, you can use distance-based contours in meters:

```javascript
// Calculate isochrone contours based on search radius
const radiusMeters = params.radius * 1609.34; // miles to meters
const isochroneContours = [
  Math.round(radiusMeters * 0.25),
  Math.round(radiusMeters * 0.5),
  Math.round(radiusMeters * 0.75),
  Math.round(radiusMeters),
].filter((m) => m <= 100000); // API limit is 100km

const feature = center.asFeature({
  "marker-color": "#ff0000",
  legend: "Home Location",
  name: "My Home",
  isochrone: {
    profile: "driving",
    contours_meters: isochroneContours, // Distance-based contours (1-100000 meters)
    denoise: 1,
  },
});
```

#### Configuration Options

| Property           | Type     | Description                                                         | Default            |
| ------------------ | -------- | ------------------------------------------------------------------- | ------------------ |
| `profile`          | string   | Routing profile: `driving`, `driving-traffic`, `walking`, `cycling` | `driving-traffic`  |
| `contours_minutes` | number[] | Time contours in minutes (1-60). Max 4 contours.                    | `[15, 30, 45, 60]` |
| `contours_meters`  | number[] | Distance contours in meters (1-100000). Max 4 contours.             | -                  |
| `denoise`          | number   | Remove smaller contours (0.0-1.0). 1.0 = only largest contour.      | `1`                |
| `generalize`       | number   | Douglas-Peucker generalization tolerance in meters                  | -                  |

**Note:** You must specify either `contours_minutes` or `contours_meters`, not
both.

#### Example: Nearby Search with Matching Isochrones

The nearby search manifest demonstrates distance-based isochrones that align
with the search radius:

```javascript
// In nearby.js
const radiusMeters = params.radius * 1609.34; // Convert miles to meters
const isochroneContours = [
  Math.round(radiusMeters * 0.25),
  Math.round(radiusMeters * 0.5),
  Math.round(radiusMeters * 0.75),
  Math.round(radiusMeters),
].filter((m) => m <= 100000);

features.push(
  center.asFeature({
    "marker-color": colors.pick(0),
    legend: "Home Location",
    name: full_address + "\n" + score,
    isochrone: {
      profile: "driving",
      contours_meters: isochroneContours,
      denoise: 1,
    },
  }),
);
```

This creates isochrone polygons at 25%, 50%, 75%, and 100% of the search radius,
showing drivable areas that match the amenity search distance.
