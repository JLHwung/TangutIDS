import process from "node:process";
import assert from "node:assert";

export type IDS = string | IDSStruct;

export type IDSStruct =
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
      operands: [IDS, IDS];
    }
  | {
      operator: "⿲" | "⿳";
      operands: [IDS, IDS, IDS];
    };

export function formatUPlus(char: string): string {
  const codePoint = char.codePointAt(0)!;
  return `U+${codePoint.toString(16).toUpperCase()}`;
}

export function parseIDS(ids: string): IDS {
  let pos = 0;
  function parseIDSSegment(ids: string): IDS {
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
  const result = parseIDSSegment(ids);
  assert(pos === ids.length, `Did not consume entire IDS string`);
  return result;
}

export type IDSMap = Map<string, IDS>;

export function parseIDSMap(input: string): IDSMap {
  const idsMap: IDSMap = new Map();
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

export function isEqualIDS(a: IDS, b: IDS): boolean {
  if (typeof a === "string" && typeof b === "string") {
    return a === b;
  }
  if (typeof a === "string" || typeof b === "string") {
    return false;
  }
  if (a.operator !== b.operator) {
    return false;
  }
  if (a.operands.length !== b.operands.length) {
    return false;
  }
  for (let i = 0; i < a.operands.length; i++) {
    const opA = a.operands[i];
    const opB = b.operands[i];
    if (typeof opA === "string" && typeof opB === "string") {
      if (opA !== opB) {
        return false;
      }
    } else if (typeof opA === "object" && typeof opB === "object") {
      if (!isEqualIDS(opA, opB)) {
        return false;
      }
    } else {
      return false;
    }
  }
  return true;
}

export function manipulateIDS(
  ids: IDS,
  map: (operand: IDS) => IDS
): IDS {
  if (typeof ids !== "string") {
    for (let i = 0; i < ids.operands.length; i++) {
      const operand = ids.operands[i];
      ids.operands[i] = manipulateIDS(operand, map);
    }
  }
  ids = map(ids);
  return ids;
}

export function printIDS(ids: IDS): string {
  if (typeof ids === "string") {
    return ids;
  } else {
    return ids.operator + ids.operands.map(printIDS).join("");
  }
}

export function printIDSMap(idsMap: IDSMap): string {
    // Add UTF-8 BOM header
  let output = "\uFEFF";
  for (const [key, value] of idsMap) {
    output += `${key
      .codePointAt(0)!
      .toString(16)
      .toUpperCase()}\t${key}\t${printIDS(value)}\n`;
  }
  return output;
}