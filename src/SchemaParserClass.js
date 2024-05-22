import FakeDataGenerator from "./FakeDataGeneratorClass.js";

class SchemaParser {
  #dataGenerator = new FakeDataGenerator();
  #resultDocument = {};
  #schema = null;
  #nullablePercentage = 0;
  #references = {};

  constructor(schema, nullablePercentage, references) {
    this.#schema = schema;
    this.#nullablePercentage = nullablePercentage;
    this.#references = references || {};

    // builds the result document
    this.#initialize();
  }

  #getReferenceValue(referenceString) {
    const [, referenceKey] = referenceString.split("#ref.");
    const result = this.#references[referenceKey];
    if (result == null) {
      throw new Error("REFERENCE_KEY_INVALID");
    }

    return result;
  }

  #initialize() {
    for (const [fieldName, value] of Object.entries(this.#schema)) {
      const type = value.type;
      const isNullable = value.isNullable;
      const nullablePercentage = value.nullablePercentage;

      this.#resultDocument[fieldName] = this.#parseType(type, isNullable, nullablePercentage, { ...value });
    }
  }

  #parseType(type, isNullable, nullablePercentage, { options, properties }) {
    const _isNullable = isNullable || nullablePercentage || false;
    // if provided, override global nullablePercentage value
    const _nullablePercentage = nullablePercentage || this.#nullablePercentage;

    if (_isNullable) {
      // code that runs _nullablePercentage of the time
      if (Math.random() < _nullablePercentage) {
        return null;
      }
    }

    switch (type) {
      case "boolean":
        return this.#getBoolean();
      case "enum":
        return this.#getEnum(options);
      case "iso-timestamp":
        return this.#getIsoTimestamp(options);
      case "object":
        return this.#getObject(properties);
      case "delimited-string":
        return this.#getDelimitedString(options);
      case "text":
        return this.#getText(options);
      case "numeric-string":
        return this.#getNumericString(options);
      case "url":
        return this.#getUrl();
      case "array":
        return this.#getArray(options);
      default:
        throw new Error("INVALID_TYPE_ERROR");
    }
  }

  #getObject(properties) {
    const result = {};
    for (let property of properties) {
      const {
        fieldName,
        type,
        isNullable: propertyIsNullable,
        nullablePercentage: propertyNullablePercentage,
      } = property;
      result[fieldName] = this.#parseType(type, propertyIsNullable, propertyNullablePercentage, { ...property });
    }

    return result;
  }

  #getBoolean() {
    return this.#dataGenerator.generateBoolean();
  }

  #getEnum(enumOptions) {
    if (enumOptions.includes("#ref")) {
      const referenceValue = this.#getReferenceValue(enumOptions);
      if (!Array.isArray(referenceValue)) {
        throw new Error("REFERENCED_VALUE_MUST_BE_AN_ARRAY");
      }
      return this.#dataGenerator.generateEnum(referenceValue);
    }
    return this.#dataGenerator.generateEnum(enumOptions);
  }

  #getIsoTimestamp(options) {
    const { dateFrom, dateTo } = options || {};
    return this.#dataGenerator.generateISOTimestamp(dateFrom, dateTo);
  }

  #getDelimitedString(options) {
    const { arrayOfOptions, delimiter } = options || {};
    const enumOptions = [];

    for (const option of arrayOfOptions) {
      if (Array.isArray(option)) {
        enumOptions.push(option);
        continue;
      }

      if (String(option).includes("#ref")) {
        const referenceOption = this.#getReferenceValue(option);

        if (Array.isArray(referenceOption)) {
          enumOptions.push(referenceOption);
        } else {
          enumOptions.push([referenceOption]);
        }
        continue;
      }

      if (!Array.isArray(option)) {
        enumOptions.push([option]);
      }
    }

    return this.#dataGenerator.generateDelimitedString(delimiter, ...enumOptions);
  }

  #getText(options) {
    const { min, max } = options || {};
    return this.#dataGenerator.generateText(min, max);
  }

  #getUrl() {
    return this.#dataGenerator.generateURL();
  }

  #getNumericString(options) {
    const { min, max } = options || {};
    return this.#dataGenerator.generateNumericString(min, max);
  }

  #getArray(options) {
    const result = [];
    const { schema, min, max } = options || {};
    if (schema == null) {
      throw new Error("ARRAY_SCHEMA_NOT_PROVIDED");
    }
    const { type } = schema;
    const numberOfItems = Math.floor(Math.random() * (max - min + 1) + min);

    for (let i = 0; i < numberOfItems; i++) {
      const item = this.#parseType(type, false, 0, { ...schema });
      result.push(item);
    }

    return result;
  }

  getDocument() {
    console.log(this.#resultDocument);
    return this.#resultDocument;
  }
}

export default SchemaParser;
