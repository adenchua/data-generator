import { expect } from "chai";
import { it } from "mocha";

import SchemaParser from "../../src/SchemaParserClass.js";

describe("Testing format string type for SchemaParserClass", function () {
  it("1. Given valid parameters, it should return the correct result document", function () {
    const schema = {
      test: {
        type: "format-string",
        options: {
          string: "{}_{}",
          properties: [
            {
              type: "enum",
              options: ["apple"],
            },
            {
              type: "enum",
              options: ["pear"],
            },
          ],
        },
      },
    };
    const schemaParser = new SchemaParser(schema, 0, {});

    const resultDocument = schemaParser.getDocument();

    expect(resultDocument).to.haveOwnProperty("test");
    expect(resultDocument.test).to.equal("apple_pear");
  });

  it("2. Given invalid property object parameters, it should throw an error 'UNSUPPORTED_FORMAT_STRING_TYPE'", function () {
    const schema = {
      test: {
        type: "format-string",
        options: {
          string: "{}_{}",
          properties: [
            {
              type: "object",
              options: {
                properties: [
                  {
                    fieldName: "test1",
                    type: "text",
                  },
                ],
              },
            },
            {
              type: "enum",
              options: ["pear"],
            },
          ],
        },
      },
    };

    expect(() => new SchemaParser(schema, 0, {})).to.throw("UNSUPPORTED_FORMAT_STRING_TYPE");
  });

  it("3. Given 100% nullablePercentage, it should return the correct property with null value", function () {
    const maxNullablePercentage = 1;
    const schema = {
      test: {
        type: "format-string",
        isNullable: true,
        nullablePercentage: maxNullablePercentage,
        options: {
          string: "{}_{}",
          properties: [
            {
              type: "enum",
              options: ["apple"],
            },
            {
              type: "enum",
              options: ["pear"],
            },
          ],
        },
      },
    };

    const schemaParser = new SchemaParser(schema, 0, {});

    const resultDocument = schemaParser.getDocument();

    expect(resultDocument).to.haveOwnProperty("test");
    expect(resultDocument.test).to.be.null;
  });
});