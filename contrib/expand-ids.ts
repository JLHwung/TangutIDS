import fs from "node:fs";
import process from "node:process";
import { TangutCharacterRanges as ranges } from "./constants.ts";

type IDSMap = Map<string, string>;

function formatIDSMap(idsMap: IDSMap): string {
  let output = "";
  for (const [key, value] of idsMap) {
    output += `${key
      .codePointAt(0)!
      .toString(16)
      .toUpperCase()}\t${key}\t${value}\n`;
  }
  return output;
}

function parseIDSMap(input: string): IDSMap {
  const idsMap: IDSMap = new Map();
  const lines = input.split("\n");
  for (const line of lines) {
    const parts = line.split("\t");
    if (parts.length === 3) {
      const key = parts[1];
      const value = parts[2];
      idsMap.set(key, value);
    }
  }
  return idsMap;
}

function expandIDS(idsMap: IDSMap, ranges: [number, number][]) {
  for (const [start, end] of ranges) {
    for (let codePoint = start; codePoint <= end; codePoint++) {
      const char = String.fromCodePoint(codePoint);
      if (!idsMap.has(char)) {
        idsMap.set(char, ""); // Add with empty IDS if not present
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
  if (process.argv.length < 3) {
    console.error("Usage: node ./scripts/expand-ids.ts <ids_file>");
    process.exitCode = 1;
  }
  const idsFile = fs.readFileSync(process.argv[2], "utf-8");
  const idsMap = parseIDSMap(idsFile);

  expandIDS(idsMap, ranges);
  const output = formatIDSMap(idsMap);

  fs.writeFileSync(process.argv[2], output, "utf-8");
}

main();
