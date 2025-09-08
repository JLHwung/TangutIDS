import fs from "node:fs";
import process from "node:process";
import { TangutComponentRanges } from "./constants.ts";

type IDSStruct =
  | {
      operator:
        | "⿰"
        | "⿱"
        | "⿲"
        | "⿳"
        | "⿴"
        | "⿵"
        | "⿶"
        | "⿷"
        | "⿸"
        | "⿹"
        | "⿺"
        | "⿻";
      operands: [string | IDSStruct, string | IDSStruct];
    }
  | {
      operator: "⿲" | "⿳";
      operands: [string | IDSStruct, string | IDSStruct, string | IDSStruct];
    };

function formatUPlus(char: string): string {
  const codePoint = char.codePointAt(0)!;
  return `U+${codePoint.toString(16).toUpperCase()}`;
}

function parseIDS(ids: string): string | IDSStruct {
  let pos = 0;
  function parseIDSSegment(ids: string): string | IDSStruct {
    const currentChar = String.fromCodePoint(ids.codePointAt(pos)!);
    pos += currentChar.length; // Move past the current character
    switch (currentChar) {
      case "⿰":
      case "⿱":
      case "⿴":
      case "⿵":
      case "⿶":
      case "⿷":
      case "⿸":
      case "⿹":
      case "⿺":
      case "⿻": {
        const operator = currentChar;
        return {
          operator,
          operands: [parseIDSSegment(ids), parseIDSSegment(ids)],
        };
      }
      case "⿲":
      case "⿳": {
        const operator = currentChar;
        return {
          operator,
          operands: [
            parseIDSSegment(ids),
            parseIDSSegment(ids),
            parseIDSSegment(ids),
          ],
        };
      }
      default:
        return currentChar;
    }
  }
  return parseIDSSegment(ids);
}

function parseIDSMap(input: string): Map<string, string | IDSStruct> {
  const idsMap: Map<string, string | IDSStruct> = new Map();
  const lines = input.split("\n");
  for (const line of lines) {
    const parts = line.split("\t");
    if (parts.length === 3) {
      const key = parts[1];
      try {
        const value = parseIDS(parts[2]);
        idsMap.set(key, value);
      } catch (error) {
        console.error(
          `Error parsing IDS "${parts[2]}" for character ${formatUPlus(
            key
          )} ${key}: ${error}`
        );
        process.exitCode = 1;
      }
    }
  }
  return idsMap;
}

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

function serializeIDS(ids: string | IDSStruct): string {
  if (typeof ids === "string") {
    return ids;
  } else {
    return ids.operator + ids.operands.map(serializeIDS).join("");
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
