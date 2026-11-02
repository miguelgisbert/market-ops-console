import fs from "node:fs";
import { createRequire } from "node:module";
import { geoCentroid, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topology = JSON.parse(
  fs.readFileSync(require.resolve("world-atlas/countries-110m.json"), "utf8"),
);
const data = JSON.parse(fs.readFileSync("src/data/data.json", "utf8"));
const collection = feature(topology, topology.objects.countries);
const features = collection.features.filter((item) => String(item.id) !== "010");
const projection = geoNaturalEarth1().fitSize([820, 430], { type: "FeatureCollection", features });
const pathGenerator = geoPath(projection);

const numericIso = {
  US: "840",
  CA: "124",
  DE: "276",
  GB: "826",
  FR: "250",
  IT: "380",
  ES: "724",
  JP: "392",
  CN: "156",
  IN: "356",
  AU: "036",
  BR: "076",
  MX: "484",
};

const byId = new Map(features.map((item) => [String(item.id), item]));
const markets = {};

for (const market of data.markets) {
  const geo = byId.get(numericIso[market.iso2]);
  if (!geo) continue;
  const [x, y] = projection(geoCentroid(geo)) ?? [0, 0];
  markets[market.iso3] = {
    path: pathGenerator(geo),
    centroid: [Number(x.toFixed(1)), Number(y.toFixed(1))],
    bbox: pathGenerator.bounds(geo).map((pair) => pair.map((number) => Number(number.toFixed(1)))),
  };
}

const output = {
  width: 820,
  height: 430,
  countries: features
    .map((item, index) => ({
      key: `${String(item.id)}-${index}`,
      id: String(item.id),
      name: item.properties?.name ?? "",
      path: pathGenerator(item),
    }))
    .filter((country) => country.path),
  markets,
};

fs.writeFileSync("src/data/world-map.json", JSON.stringify(output));
console.log(
  `Generated src/data/world-map.json with ${output.countries.length} countries and ${Object.keys(markets).length} markets.`,
);
