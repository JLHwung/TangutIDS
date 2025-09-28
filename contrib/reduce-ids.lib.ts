import fs from "node:fs";
import process from "node:process";
import {
  parseIDSMap,
  printIDSMap,
  manipulateIDS,
  isEqualIDS,
} from "./util.ts";
import type { IDS, IDSMap, IDSStruct } from "./util.ts";

function reduceIDS(idsMap: IDSMap, componentIdsArray: [string, IDS][]): void {
  for (const [key, value] of idsMap) {
    if (typeof value === "string") {
      continue;
    }
    for (const [component, componentIDS] of componentIdsArray) {
      if (typeof componentIDS === "string") {
        continue;
      }
      const [newIDS, wasOptimized] = optimizeIDSBasedOnNewComponentIDS(
        value,
        componentIDS,
        component
      );
      if (wasOptimized) {
        idsMap.set(key, newIDS);
      }
    }
  }
}

function addTernaryOperatorEquivalents(
  componentIdsArray: Iterable<[string, IDS]>
): [string, IDS][] {
  const newComponents: [string, IDS][] = [];
  for (const [component, componentIDS] of componentIdsArray) {
    if (typeof componentIDS === "string") {
      continue;
    }
    newComponents.push([component, componentIDS]);
    const equivalents = generateTwoEquivalentsForTernaryOperator(componentIDS);
    if (equivalents) {
      for (const equivalent of equivalents) {
        newComponents.push([component, equivalent]);
      }
    }
  }
  return newComponents;
}

function generateTwoEquivalentsForTernaryOperator(
  ids: IDSStruct
): IDSStruct[] | null {
  const mapping = {
    "⿲": "⿰",
    "⿳": "⿱",
  } as const;
  if (
    (ids.operator === "⿲" || ids.operator === "⿳") &&
    ids.operands.length === 3
  ) {
    const operator = mapping[ids.operator];
    const [A, B, C] = ids.operands;
    return [
      {
        operator: operator,
        operands: [
          A,
          {
            operator: operator,
            operands: [B, C],
          },
        ],
      },
      {
        operator: operator,
        operands: [
          {
            operator: operator,
            operands: [A, B],
          },
          C,
        ],
      },
    ];
  }
  return null;
}

export function optimizeIDSBasedOnNewComponentIDS(
  ids: string | IDSStruct,
  componentIDS: string | IDSStruct,
  component: string
): [string | IDSStruct, optimized: boolean] {
  let optimized = false;
  if (typeof ids === "string" || typeof componentIDS === "string") {
    return [ids, optimized];
  }
  return [
    manipulateIDS(ids, (subIDS) => {
      if (typeof subIDS === "string") {
        return subIDS;
      }
      if (isEqualIDS(subIDS, componentIDS)) {
        optimized = true;
        return component;
      }
      if (subIDS.operator === "⿲" || subIDS.operator === "⿳") {
        const equivalents = generateTwoEquivalentsForTernaryOperator(subIDS);
        if (equivalents) {
          for (const equivalent of equivalents) {
            const [newIDS, wasOptimized] = optimizeIDSBasedOnNewComponentIDS(
              equivalent,
              componentIDS,
              component
            );
            if (wasOptimized) {
              optimized = true;
              return newIDS;
            }
          }
        }
      }
      return subIDS;
    }),
    optimized,
  ];
}

export function main() {
  if (process.argv.length < 4) {
    console.error(
      "Usage: node ./scripts/reduce-ids.ts <ids_file> <component_ids_file>"
    );
    process.exitCode = 1;
  }
  const idsFile = fs.readFileSync(process.argv[2], "utf-8");
  const componentIdsFile = fs.readFileSync(process.argv[3], "utf-8");
  const idsMap = parseIDSMap(idsFile);
  const componentIdsArray = addTernaryOperatorEquivalents(parseIDSMap(componentIdsFile).entries());

  reduceIDS(idsMap, componentIdsArray);

  const output = printIDSMap(idsMap);
  fs.writeFileSync(process.argv[2], output, "utf-8");
}
