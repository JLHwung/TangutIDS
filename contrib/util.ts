import process from "node:process";
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
      operands: [string | IDSStruct, string | IDSStruct];
    }
  | {
      operator: "⿲" | "⿳";
      operands: [string | IDSStruct, string | IDSStruct, string | IDSStruct];
    };

export function formatUPlus(char: string): string {
  const codePoint = char.codePointAt(0)!;
  return `U+${codePoint.toString(16).toUpperCase()}`;
}

export function parseIDS(ids: string): string | IDSStruct {
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

export type IDSMap = Map<string, string | IDSStruct>;

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

export function serializeIDS(ids: string | IDSStruct): string {
  if (typeof ids === "string") {
    return ids;
  } else {
    return ids.operator + ids.operands.map(serializeIDS).join("");
  }
}

export function formatIDSMap(idsMap: Map<string, string | IDSStruct>): string {
  let output = "";
  for (const [key, value] of idsMap) {
    output += `${key
      .codePointAt(0)!
      .toString(16)
      .toUpperCase()}\t${key}\t${serializeIDS(value)}\n`;
  }
  return output;
}