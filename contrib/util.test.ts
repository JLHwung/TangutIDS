import { suite, test } from "node:test";
import assert from "node:assert";
import {
    type IDSStruct,
    isEqualIDS,
    parseIDS,
    printIDS
} from "./util.ts";

suite("parseIDS", () => {
    test("should parse a simple IDS", () => {
        const result = parseIDS("⿰𘠁𘡤");
        assert.deepEqual(result, {
            operator: "⿰",
            operands: ["𘠁", "𘡤"],
        });
    });
    test("should parse a nested IDS", () => {
        const result = parseIDS("⿱𘠀⿵𘠒𘡯");
        assert.deepEqual(result, {
            operator: "⿱",
            operands: [
                "𘠀",
                {
                    operator: "⿵",
                    operands: ["𘠒", "𘡯"],
                },
            ],
        });
    });
    test("should throw an error for incomplete IDS", () => {
        assert.throws(() => {
            parseIDS("⿰𘠁");
        }, Error);
    });
    test("should throw an error for redundant characters after IDS", () => {
        assert.throws(() => {
            parseIDS("⿰𘠁𘡤𘠁");
        }, /Did not consume entire IDS string/);
    });
});

suite("printIDS", () => {
    test("should serialize a simple IDSStruct", () => {
        const idsStruct: IDSStruct = {
            operator: "⿰" as const,
            operands: ["𘠁", "𘡤"],
        };
        const result = printIDS(idsStruct);
        assert.strictEqual(result, "⿰𘠁𘡤");
    });
    test("should serialize a nested IDSStruct", () => {
        const idsStruct: IDSStruct = {
            operator: "⿱",
            operands: [
                "𘠀",
                {
                    operator: "⿵",
                    operands: ["𘠒", "𘡯"],
                },
            ],
        };
        const result = printIDS(idsStruct);
        assert.strictEqual(result, "⿱𘠀⿵𘠒𘡯");
    });
});

suite("parseIDS and printIDS integration", () => {
    test("should return the original string after parsing and serializing", () => {
        const original = "⿱𘠀⿵𘠒𘡯";
        const parsed = parseIDS(original);
        const serialized = printIDS(parsed);
        assert.strictEqual(serialized, original);
    });
});

suite("isEqualIDS", () => {
    test("should return true for identical IDSStructs", () => {
        const a: IDSStruct = {
            operator: "⿰",
            operands: ["𘠁", "𘡤"],
        };
        const b: IDSStruct = {
            operator: "⿰",
            operands: ["𘠁", "𘡤"],
        };
            
    });
    test("should return true for nested identical IDSStructs", () => {
        const a: IDSStruct = {
            operator: "⿱",
            operands: [
                "𘠀",
                {
                    operator: "⿵",
                    operands: ["𘠒", "𘡯"],
                },
            ],
        };
        const b: IDSStruct = {
            operator: "⿱",
            operands: [
                "𘠀",
                {
                    operator: "⿵",
                    operands: ["𘠒", "𘡯"],
                },
            ],
        };
        assert.ok(isEqualIDS(a, b));
    });
    test("should return false for different operators", () => {
        const a: IDSStruct = {
            operator: "⿰",
            operands: ["𘠁", "𘡤"],
        };
        const b: IDSStruct = {
            operator: "⿱",
            operands: ["𘠁", "𘡤"],
        };
        assert.ok(!isEqualIDS(a, b));
    });
    test("should return false for different operands", () => {
        const a: IDSStruct = {
            operator: "⿰",
            operands: ["𘠁", "𘡤"],
        };
        const b: IDSStruct = {
            operator: "⿰",
            operands: ["𘠁", "𘡥"],
        };
        assert.ok(!isEqualIDS(a, b));
    });
    test("should return false for different operand lengths", () => {
        const a: IDSStruct = {
            operator: "⿰",
            operands: ["𘠁", "𘡤"],
        };
        const b: IDSStruct = {
            operator: "⿲",
            operands: ["𘠁", "𘡤", "𘠁"],
        };
        assert.ok(!isEqualIDS(a, b));
    });
    test("should handle string comparisons", () => {
        assert.ok(isEqualIDS("𘠁", "𘠁"));
        assert.ok(!isEqualIDS("𘠁", "𘠂"));
    });
    test("should return false when comparing string with IDSStruct", () => {
        const a: IDSStruct = {
            operator: "⿰",
            operands: ["𘠁", "𘡤"],
        };
        assert.ok(!isEqualIDS(a, "𘠁"));
    });
});