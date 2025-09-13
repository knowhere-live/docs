/// <reference path="../global.d.ts" />

const areas = query.areas();

const counties = areas.flatMap((area) => {
  const results = query.execute(
    `nwr[admin_level=6][boundary=administrative][name](area=${area.name})`,
  );
  return results.map((county) => {
    const center = county.asBound().center();

    return {
      name: county.tags.name,
      lat: center.lat(),
      lon: center.lon(),
      state: area.name,
    };
  });
});

export { counties as payload };
