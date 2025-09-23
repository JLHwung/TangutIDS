import fs from "node:fs";
import process from "node:process";
import { TangutCharacterRanges, TangutComponentRanges } from "./constants.ts";
import { parseIDSMap, formatIDSMap } from "./util.ts";
import type { IDSMap } from "./util.ts";

function expandIDS(idsMap: IDSMap, type: "character" | "component"): IDSMap {
  const ranges = type === "character" ? TangutCharacterRanges : TangutComponentRanges;
  for (const [start, end] of ranges) {
    for (let codePoint = start; codePoint <= end; codePoint++) {
      const char = String.fromCodePoint(codePoint);
      if (!idsMap.has(char)) {
        idsMap.set(char, type === "character" ? "" : char);
      }
    }
  }
  // sort the map by code point
  const sortedMap = [...idsMap.entries()].sort(
    (a, b) => a[0].codePointAt(0)! - b[0].codePointAt(0)!
  );
  idsMap.clear();
  for (const [key, value] of sortedMap) {
    idsMap.set(key, value);
  }
  return idsMap;
}



function main() {
  if (process.argv.length < 4) {
    console.error("Usage: node ./scripts/expand-ids.ts <--character|--component> <ids_file>");
    process.exitCode = 1;
  }
  const type = process.argv[2].slice(2);
  const idsFile = fs.readFileSync(process.argv[3], "utf-8");
  const idsMap = parseIDSMap(idsFile);

  expandIDS(idsMap, type);
  const output = formatIDSMap(idsMap);

  fs.writeFileSync(process.argv[2], output, "utf-8");
}

main();
