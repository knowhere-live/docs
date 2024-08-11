const prefixes = query.prefixes();

const counties = prefixes.flatMap((prefix) => {
  const results = query.execute(
    `nwr[admin_level=6][boundary=administrative][name](prefix=${prefix.name})`,
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

export { counties as payload };
