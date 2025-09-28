import { suite, test } from "node:test";
import assert from "node:assert";
import {
    parseIDS,
    printIDS
} from "./util.ts";
import { optimizeIDSBasedOnNewComponentIDS } from "./reduce-ids.lib.ts";

suite("optimizeIDSBasedOnNewComponentIDS", () => {
  for (const [originalIDS, component, componentIDS, expected] of [
    ["⿱𘠡𘠺", "𘶏", "⿱𘠡𘠺", "𘶏"],
    ["⿱𘡩⿺𘢦⿱𘠙𘠅", "𘶅", "⿱𘠙𘠅", "⿱𘡩⿺𘢦𘶅"],
    ["⿰𘡱⿱𘠊⿰𘠒𘠢", "𘶑", "⿱𘠊⿰𘠒𘠢", "⿰𘡱𘶑"],

    // Test cases for ternary operator equivalents
    ["⿱𘡩⿰𘠣⿰𘠐⿰𘢔𘠴", "𘷋", "⿰𘠐⿰𘢔𘠴", "⿱𘡩⿰𘠣𘷋"],
    ["⿰𘠣⿱𘡩⿲𘠐𘢔𘠴", "𘷋", "⿲𘠐𘢔𘠴", "⿰𘠣⿱𘡩𘷋"],

    ["⿲𘠁𘣥𘦉", "𘶔", "⿰𘠁𘣥", "⿰𘶔𘦉"],
    ["⿲𘠁𘢡⿱𘣘𘡃", "𘶰", "⿱𘣘𘡃", "⿲𘠁𘢡𘶰"]
  ] as const) {
    test(`replaces ${originalIDS} with ${componentIDS} → ${component}`, () => {
      const parsedOriginal = parseIDS(originalIDS);
      const parsedComponentIDS = parseIDS(componentIDS);
      const [optimizedIDS, wasOptimized] = optimizeIDSBasedOnNewComponentIDS(
        parsedOriginal,
        parsedComponentIDS,
        component
      );
      assert.ok(wasOptimized);
      assert.strictEqual(printIDS(optimizedIDS), expected);
    });
  }
});
