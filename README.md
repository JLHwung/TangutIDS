# TangutIDS
Ideographic Description Sequences (IDS) for Unicode Tangut characters

This is a fork from the Andrew West's [Ideographic Description Sequences (IDS) for Unicode Tangut characters](https://www.babelstone.co.uk/Tangut/TangutIDS.txt) with a few error corrections.

The IDS is updated to Unicode 17.

## Contribution

### Unicode updates

Update Unicode ranges in `./contrib/constants.js`.

Run
```sh
node ./contrib/expand-ids.ts ./TangutIDS.txt
```

The `TangutIDS.txt` will list new characters and their codepoints with empty IDS.

### Quality check

```sh
node ./contrib/qa.ts ./TangutIDS.txt
```

The quality check enforces:

- the format of the IDS: `<codepoint>\t<character>\t<ids>`
- the number of IDC operands
- the operand must be a Tangut Component character