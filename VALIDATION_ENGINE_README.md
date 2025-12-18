# Document Validation Engine - "In Good Order" System

A comprehensive validation engine for Intelligent Document Processing (IDP) JSON extracts. Validates forms, eligibility documents, and other extracted data against schemas, business rules, and cross-document consistency requirements.

## Features

- ✅ **Schema Validation** - Validate document structure and data types
- ✅ **Business Rules** - Apply complex validation logic (age verification, date consistency, etc.)
- ✅ **Cross-Document Validation** - Ensure consistency across multiple documents
- ✅ **Data Quality Checks** - Detect suspicious patterns and data quality issues
- ✅ **Confidence Scoring** - Validate IDP extraction confidence levels
- ✅ **Extensible** - Register custom schemas and validation rules
- ✅ **Detailed Reporting** - Get comprehensive validation reports with error severity levels

## Quick Start

```javascript
// Initialize the validation engine
const engine = new ValidationEngine();

// Validate a single document
const result = engine.validateDocument(documentData, 'application_form');

console.log('Is Valid:', result.isValid);
console.log('Quality Score:', result.getQualityScore());
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);
```

## Core Concepts

### 1. Document Types

The engine comes with pre-configured schemas for common document types:

- **application_form** - Application forms with personal information
- **eligibility_document** - ID documents (driver's license, passport, etc.)
- **income_verification** - Pay stubs, W2s, bank statements

### 2. Validation Layers

The engine performs validation at multiple layers:

1. **Schema Validation** - Required fields, data types, formats
2. **Business Rules** - Domain-specific logic (age requirements, expiration dates)
3. **Cross-Document** - Consistency checks across multiple documents
4. **Data Quality** - Suspicious patterns, completeness checks

### 3. Error Severity

Errors are categorized by severity:

- **critical** - Must be fixed for document to be "in good order"
- **high** - Important issues that should be addressed
- **medium** - Minor issues that may need attention
- **low** - Informational

## Usage Examples

### Example 1: Single Document Validation

```javascript
const applicationForm = {
    applicantName: "John Smith",
    dateOfBirth: "1985-06-15",
    applicationDate: "2024-01-15",
    formType: "new_application",
    email: "john.smith@example.com",
    phone: "+1-555-123-4567",
    address: {
        street: "123 Main St",
        city: "Springfield",
        state: "IL",
        zipCode: "62701"
    }
};

const engine = new ValidationEngine();
const result = engine.validateDocument(applicationForm, 'application_form');

if (!result.isValid) {
    console.log('Validation Errors:');
    result.errors.forEach(error => {
        console.log(`- [${error.severity}] ${error.field}: ${error.message}`);
    });
}
```

### Example 2: Document Set Validation

```javascript
const documents = [
    {
        document: applicationForm,
        type: 'application_form'
    },
    {
        document: driversLicense,
        type: 'eligibility_document'
    },
    {
        document: payStub,
        type: 'income_verification'
    }
];

const result = engine.validateDocumentSet(documents);

console.log('Overall Quality Score:', result.getQualityScore() + '%');
console.log('Cross-Document Issues:', result.validations.cross_document);
```

### Example 3: "In Good Order" Check

```javascript
const { inGoodOrder, result, summary } = engine.checkInGoodOrder(documents);

if (inGoodOrder) {
    console.log('✅ Documents are in good order');
    console.log('Quality Score:', summary.qualityScore + '%');
} else {
    console.log('❌ Documents are NOT in good order');
    console.log('Critical Errors:', summary.criticalErrorCount);

    // Show why documents failed
    result.errors.forEach(error => {
        if (error.severity === 'critical') {
            console.log(`- ${error.field}: ${error.message}`);
        }
    });
}
```

## Custom Schemas

Register custom document schemas for your specific use cases:

```javascript
const engine = new ValidationEngine();

engine.registerSchema('loan_application', {
    required: ['applicantName', 'loanAmount', 'purpose'],
    fields: {
        applicantName: {
            type: 'string',
            minLength: 2,
            maxLength: 100
        },
        loanAmount: {
            type: 'number',
            min: 1000,
            max: 1000000
        },
        purpose: {
            type: 'string',
            enum: ['home', 'auto', 'personal', 'business']
        },
        creditScore: {
            type: 'number',
            min: 300,
            max: 850
        }
    }
});

// Use the custom schema
const result = engine.validateDocument(loanData, 'loan_application');
```

## Custom Validation Rules

Add custom business logic:

```javascript
engine.registerRule('credit_check', (document, context) => {
    const errors = [];
    const warnings = [];

    if (document.creditScore && document.loanAmount) {
        // Minimum credit score based on loan amount
        const minScore = document.loanAmount > 100000 ? 700 : 650;

        if (document.creditScore < minScore) {
            errors.push({
                field: 'creditScore',
                message: `Credit score ${document.creditScore} below minimum ${minScore} for loan amount`,
                severity: 'critical'
            });
        } else if (document.creditScore < minScore + 50) {
            warnings.push({
                field: 'creditScore',
                message: 'Credit score is close to minimum threshold'
            });
        }
    }

    return { errors, warnings };
});
```

## Built-in Validation Rules

The engine includes several pre-configured validation rules:

### Age Verification
```javascript
// Validates:
// - Applicant is at least 18 years old
// - Age is reasonable (< 120 years)
```

### Document Expiration
```javascript
// Validates:
// - Document is not expired
// - Warns if document expires within 30 days
```

### Name Consistency
```javascript
// Validates:
// - Names match across related fields
// - Allows for minor variations (middle initial, etc.)
```

### Date Consistency
```javascript
// Validates:
// - Application date is after birth date
// - Issue date is before expiration date
// - Logical date ordering
```

### Confidence Threshold
```javascript
// Validates:
// - IDP extraction confidence meets thresholds
// - Document-level confidence (default 80%)
// - Field-level confidence warnings
```

## Field Schemas

### String Fields
```javascript
{
    type: 'string',
    minLength: 2,           // Minimum length
    maxLength: 100,         // Maximum length
    pattern: /^[A-Z]+$/,    // Regex pattern
    enum: ['option1', 'option2']  // Allowed values
}
```

### Number Fields
```javascript
{
    type: 'number',
    min: 0,                 // Minimum value
    max: 100,               // Maximum value
}
```

### Date Fields
```javascript
{
    type: 'date',
    format: 'YYYY-MM-DD',   // Expected format
    minDate: 'today',       // Minimum date (or specific date)
    maxDate: 'today'        // Maximum date (or specific date)
}
```

### Email Fields
```javascript
{
    type: 'email',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
}
```

### Nested Objects
```javascript
{
    type: 'object',
    required: ['field1', 'field2'],
    fields: {
        field1: { type: 'string' },
        field2: { type: 'number' }
    }
}
```

## Validation Results

### Result Structure

```javascript
{
    documentType: 'application_form',
    isValid: true,
    qualityScore: 95,
    errors: [...],
    warnings: [...],
    validations: {
        schema: { errors: [], warnings: [] },
        business_rules: { errors: [], warnings: [] },
        data_quality: { errors: [], warnings: [] }
    },
    executionTime: 45  // milliseconds
}
```

### Getting Summary

```javascript
const summary = result.getSummary();
/*
{
    documentType: 'application_form',
    isValid: true,
    qualityScore: 95,
    errorCount: 0,
    warningCount: 2,
    criticalErrorCount: 0,
    executionTime: 45
}
*/
```

### Getting Detailed Report

```javascript
const report = result.getDetailedReport();
// Includes all errors, warnings, validation results, and sub-results
```

## Cross-Document Validation

The engine automatically performs cross-document validation when validating document sets:

- **Name Consistency** - Ensures names match across all documents
- **Date Consistency** - Validates date relationships across documents
- **Document Completeness** - Checks for required document types

```javascript
const documents = [
    { document: form, type: 'application_form' },
    { document: license, type: 'eligibility_document' }
];

const result = engine.validateDocumentSet(documents);

// Check cross-document issues
const crossValidation = result.validations.cross_document;
if (crossValidation.errors.length > 0) {
    console.log('Cross-document errors found:', crossValidation.errors);
}
```

## Data Quality Checks

The engine includes built-in data quality validators:

### Suspicious Pattern Detection
- Sequential numbers (123456789)
- Repeated characters (aaaaaaa)
- Common test data patterns

### Completeness Checking
- Calculates field completion rate
- Warns if completion rate < 70%

## IDP Confidence Integration

The engine supports IDP confidence scores at both document and field levels:

```javascript
// Document-level confidence
const document = {
    applicantName: "John Smith",
    // ... other fields
    confidence: 0.92  // 92% confidence
};

// Field-level confidence
const document = {
    applicantName: "John Smith",
    address: {
        street: "123 Main St",
        city: "Springfield",
        state: "IL",
        zipCode: "62701",
        _confidence: 0.85  // Field-level confidence
    }
};

// The engine will warn if confidence is below threshold
const result = engine.validateDocument(document, 'application_form');
```

## "In Good Order" Criteria

Documents are considered "in good order" when:

1. ✅ No critical errors
2. ✅ All required fields present and valid
3. ✅ Cross-document consistency passed
4. ✅ Data quality score ≥ 80%

```javascript
const { inGoodOrder, result, summary } = engine.checkInGoodOrder(documents);

if (inGoodOrder) {
    // Proceed with processing
} else {
    // Request document corrections
}
```

## Error Handling

The engine handles validation errors gracefully:

```javascript
try {
    const result = engine.validateDocument(document, 'unknown_type');

    if (!result.isValid) {
        // Handle validation errors
        result.errors.forEach(error => {
            console.error(`${error.field}: ${error.message}`);
        });
    }
} catch (error) {
    // Handle system errors
    console.error('Validation system error:', error.message);
}
```

## Performance

The validation engine is designed for efficiency:

- Single document validation: ~10-50ms
- Document set validation: ~50-200ms (depending on document count)
- Execution time included in results

```javascript
const result = engine.validateDocument(document, 'application_form');
console.log('Validation completed in', result.executionTime, 'ms');
```

## API Reference

### ValidationEngine

#### `validateDocument(document, documentType)`
Validates a single document against its schema and business rules.

- **Parameters:**
  - `document` (Object): The IDP JSON extract
  - `documentType` (String): Type of document to validate
- **Returns:** `ValidationResult`

#### `validateDocumentSet(documents)`
Validates multiple documents together with cross-document validation.

- **Parameters:**
  - `documents` (Array): Array of `{document, type}` objects
- **Returns:** `ValidationResult`

#### `checkInGoodOrder(documents)`
Checks if documents meet "in good order" criteria.

- **Parameters:**
  - `documents` (Array): Array of `{document, type}` objects
- **Returns:** `{inGoodOrder, result, summary}`

#### `registerSchema(name, schema)`
Registers a custom document schema.

- **Parameters:**
  - `name` (String): Schema name
  - `schema` (Object): Schema definition

#### `registerRule(name, ruleFunction)`
Registers a custom validation rule.

- **Parameters:**
  - `name` (String): Rule name
  - `ruleFunction` (Function): Validation function

### ValidationResult

#### `isValid`
Boolean indicating if validation passed.

#### `getQualityScore()`
Returns quality score (0-100).

#### `hasCriticalErrors()`
Returns true if any critical errors exist.

#### `getSummary()`
Returns validation summary object.

#### `getDetailedReport()`
Returns comprehensive validation report.

## Running Examples

To run the example validation cases:

```javascript
// Node.js
node validation-examples.js

// Browser
<script src="validation-engine.js"></script>
<script src="validation-examples.js"></script>
<script>
    runAllExamples();
</script>
```

## Integration Examples

### Express.js API
```javascript
app.post('/api/validate-documents', (req, res) => {
    const engine = new ValidationEngine();
    const { documents } = req.body;

    const { inGoodOrder, result, summary } = engine.checkInGoodOrder(documents);

    res.json({
        inGoodOrder,
        summary,
        errors: result.errors,
        warnings: result.warnings
    });
});
```

### React Component
```javascript
function DocumentValidator({ documents }) {
    const [result, setResult] = useState(null);

    useEffect(() => {
        const engine = new ValidationEngine();
        const validationResult = engine.checkInGoodOrder(documents);
        setResult(validationResult);
    }, [documents]);

    if (!result) return <div>Validating...</div>;

    return (
        <div>
            <h3>Validation Result</h3>
            <p>In Good Order: {result.inGoodOrder ? '✅' : '❌'}</p>
            <p>Quality Score: {result.summary.qualityScore}%</p>
            {result.result.errors.length > 0 && (
                <ul>
                    {result.result.errors.map((error, i) => (
                        <li key={i}>{error.field}: {error.message}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
```

## Best Practices

1. **Always validate at ingestion** - Validate documents as soon as they're extracted
2. **Use appropriate schemas** - Create specific schemas for each document type
3. **Handle warnings** - Don't ignore warnings; they may indicate data quality issues
4. **Log validation results** - Keep audit trail of validation outcomes
5. **Set confidence thresholds** - Adjust based on your accuracy requirements
6. **Review cross-document errors** - These often indicate data entry mistakes

## License

This validation engine is part of the DOPAMINE CATHEDRAL project.

## Support

For issues or questions, please refer to the main project documentation.
