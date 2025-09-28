import fs from "node:fs";
import process from "node:process";
import { TangutComponentRanges } from "./constants.ts";
import { formatUPlus, parseIDSMap, serializeIDS } from "./util.ts";
import type { IDSStruct } from "./util.ts";

function idsOperandMustBeTangutComponents(ids: string | IDSStruct): boolean {
  if (typeof ids === "string") {
    const codePoint = ids.codePointAt(0)!;
    return TangutComponentRanges.some(
      ([start, end]) => codePoint >= start && codePoint <= end
    );
  } else {
    return ids.operands.every((operand) =>
      idsOperandMustBeTangutComponents(operand)
    );
  }
}

function operandsAreAllTangutComponents(
  idsMap: Map<string, string | IDSStruct>
): boolean {
  for (const [key, value] of idsMap) {
    if (!idsOperandMustBeTangutComponents(value)) {
      console.error(
        `Error: The IDS for character ${formatUPlus(
          key
        )} ${key} contains non-Tangut components: ${serializeIDS(value)}`
      );
      return false;
    }
  }
  return true;
}

function main() {
  if (process.argv.length < 3) {
    console.error("Usage: node ./scripts/qa.ts <ids_file>");
    process.exitCode = 1;
    return;
  }
  const idsFile = fs.readFileSync(process.argv[2], "utf-8");
  const idsMap = parseIDSMap(idsFile);
  operandsAreAllTangutComponents(idsMap);
}

main();
