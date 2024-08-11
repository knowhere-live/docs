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
`string`, `text`, `checkbox`, `prefix`, `address`, and `range`.

## Example Manifest

Let's create an example manifest based on the countries.ts file. This manifest
will allow users to explore counties within different states.

```typescript
const manifest: Manifest = {
  source: `
    const prefixes = query.prefixes();

    const counties = prefixes.flatMap((prefix) => {
      const results = query.execute(
        \`nwr[admin_level=6][boundary=administrative][name](prefix=\${prefix.name})\`
      );
      return results.map((county) => {
        const center = county.bound().center();
        return {
          name: county.tags.name,
          lat: center.lat(),
          lon: center.lon(),
          state: prefix.name,
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
      type: "prefix",
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

1. The `source` code fetches all prefixes (states) and their counties, creating
   a GeoJSON FeatureCollection.
2. The `form` includes a single "prefix" input that allows users to select a
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
