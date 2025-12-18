/**
 * VALIDATION ENGINE - EXAMPLES & TEST CASES
 * Demonstrates usage of the "In Good Order" document validation engine
 */

// ============================================================================
// SAMPLE IDP JSON EXTRACTS
// ============================================================================

const sampleApplicationForm = {
    // Valid application form
    applicantName: "John Michael Smith",
    dateOfBirth: "1985-06-15",
    applicationDate: "2024-01-15",
    formType: "new_application",
    email: "john.smith@example.com",
    phone: "+1-555-123-4567",
    ssn: "123-45-6789",
    address: {
        street: "123 Main Street",
        city: "Springfield",
        state: "IL",
        zipCode: "62701"
    },
    confidence: 0.95
};

const sampleEligibilityDoc = {
    // Valid driver's license
    documentType: "drivers_license",
    documentNumber: "D12345678",
    issueDate: "2020-01-15",
    expirationDate: "2028-01-15",
    status: "valid",
    holderName: "John Michael Smith",
    issuingAuthority: "Illinois DMV",
    confidence: 0.92
};

const sampleIncomeDoc = {
    // Valid paystub
    documentType: "paystub",
    period: {
        start: "2024-01-01",
        end: "2024-01-15"
    },
    amount: 3500.00,
    employeeName: "John M Smith",
    employerName: "Acme Corporation",
    ytdEarnings: 3500.00,
    confidence: 0.88
};

// Invalid examples
const invalidApplicationForm = {
    applicantName: "J", // Too short
    dateOfBirth: "2010-01-01", // Too young
    applicationDate: "2025-12-31", // Future date
    formType: "invalid_type", // Not in enum
    email: "not-an-email", // Invalid email
    ssn: "123", // Invalid SSN format
    confidence: 0.45 // Low confidence
};

const expiredEligibilityDoc = {
    documentType: "drivers_license",
    documentNumber: "D99999999",
    issueDate: "2015-01-01",
    expirationDate: "2020-01-01", // Expired
    status: "expired",
    holderName: "Jane Doe", // Different name
    issuingAuthority: "State DMV",
    confidence: 0.85
};

// ============================================================================
// BASIC USAGE EXAMPLES
// ============================================================================

console.log("=".repeat(80));
console.log("DOCUMENT VALIDATION ENGINE - EXAMPLES");
console.log("=".repeat(80));

// Example 1: Validate a single document
function example1_singleDocumentValidation() {
    console.log("\n" + "=".repeat(80));
    console.log("EXAMPLE 1: Single Document Validation");
    console.log("=".repeat(80));

    const engine = new ValidationEngine();
    const result = engine.validateDocument(sampleApplicationForm, 'application_form');

    console.log("\n📄 Document Type:", result.documentType);
    console.log("✓ Is Valid:", result.isValid);
    console.log("📊 Quality Score:", result.getQualityScore() + "%");
    console.log("⚠️  Errors:", result.errors.length);
    console.log("⚠️  Warnings:", result.warnings.length);

    if (result.errors.length > 0) {
        console.log("\n🚨 Errors:");
        result.errors.forEach(err => {
            console.log(`  - [${err.severity}] ${err.field}: ${err.message}`);
        });
    }

    if (result.warnings.length > 0) {
        console.log("\n⚠️  Warnings:");
        result.warnings.forEach(warn => {
            console.log(`  - ${warn.field}: ${warn.message}`);
        });
    }

    console.log("\n📋 Summary:", JSON.stringify(result.getSummary(), null, 2));

    return result;
}

// Example 2: Validate invalid document
function example2_invalidDocumentValidation() {
    console.log("\n" + "=".repeat(80));
    console.log("EXAMPLE 2: Invalid Document Validation");
    console.log("=".repeat(80));

    const engine = new ValidationEngine();
    const result = engine.validateDocument(invalidApplicationForm, 'application_form');

    console.log("\n📄 Document Type:", result.documentType);
    console.log("✓ Is Valid:", result.isValid);
    console.log("📊 Quality Score:", result.getQualityScore() + "%");
    console.log("⚠️  Errors:", result.errors.length);

    if (result.errors.length > 0) {
        console.log("\n🚨 Errors Found:");
        result.errors.forEach(err => {
            console.log(`  - [${err.severity}] ${err.field}: ${err.message}`);
        });
    }

    return result;
}

// Example 3: Validate document set (cross-document validation)
function example3_documentSetValidation() {
    console.log("\n" + "=".repeat(80));
    console.log("EXAMPLE 3: Document Set Validation (Cross-Document)");
    console.log("=".repeat(80));

    const engine = new ValidationEngine();
    const documents = [
        { document: sampleApplicationForm, type: 'application_form' },
        { document: sampleEligibilityDoc, type: 'eligibility_document' },
        { document: sampleIncomeDoc, type: 'income_verification' }
    ];

    const result = engine.validateDocumentSet(documents);

    console.log("\n📄 Document Set Validation");
    console.log("✓ Is Valid:", result.isValid);
    console.log("📊 Quality Score:", result.getQualityScore() + "%");
    console.log("📑 Documents Validated:", documents.length);
    console.log("⚠️  Total Errors:", result.errors.length);
    console.log("⚠️  Total Warnings:", result.warnings.length);

    if (result.errors.length > 0) {
        console.log("\n🚨 Errors:");
        result.errors.forEach(err => {
            console.log(`  - [${err.source}] ${err.field}: ${err.message}`);
        });
    }

    if (result.warnings.length > 0) {
        console.log("\n⚠️  Warnings:");
        result.warnings.forEach(warn => {
            console.log(`  - [${warn.source}] ${warn.field}: ${warn.message}`);
        });
    }

    return result;
}

// Example 4: Check "In Good Order" status
function example4_inGoodOrderCheck() {
    console.log("\n" + "=".repeat(80));
    console.log("EXAMPLE 4: 'In Good Order' Check");
    console.log("=".repeat(80));

    const engine = new ValidationEngine();

    // Valid document set
    console.log("\n📋 Valid Document Set:");
    const validDocs = [
        { document: sampleApplicationForm, type: 'application_form' },
        { document: sampleEligibilityDoc, type: 'eligibility_document' }
    ];

    const validCheck = engine.checkInGoodOrder(validDocs);
    console.log("✓ In Good Order:", validCheck.inGoodOrder);
    console.log("📊 Quality Score:", validCheck.summary.qualityScore + "%");
    console.log("⚠️  Errors:", validCheck.summary.errorCount);

    // Invalid document set
    console.log("\n📋 Invalid Document Set:");
    const invalidDocs = [
        { document: invalidApplicationForm, type: 'application_form' },
        { document: expiredEligibilityDoc, type: 'eligibility_document' }
    ];

    const invalidCheck = engine.checkInGoodOrder(invalidDocs);
    console.log("✓ In Good Order:", invalidCheck.inGoodOrder);
    console.log("📊 Quality Score:", invalidCheck.summary.qualityScore + "%");
    console.log("⚠️  Errors:", invalidCheck.summary.errorCount);
    console.log("🚨 Critical Errors:", invalidCheck.summary.criticalErrorCount);

    if (!invalidCheck.inGoodOrder) {
        console.log("\n🚫 Document Set NOT In Good Order - Reasons:");
        invalidCheck.result.errors.forEach(err => {
            if (err.severity === 'critical') {
                console.log(`  - ${err.field}: ${err.message}`);
            }
        });
    }

    return { validCheck, invalidCheck };
}

// Example 5: Custom schema and rules
function example5_customSchemaAndRules() {
    console.log("\n" + "=".repeat(80));
    console.log("EXAMPLE 5: Custom Schema and Validation Rules");
    console.log("=".repeat(80));

    const engine = new ValidationEngine();

    // Register custom schema
    engine.registerSchema('custom_form', {
        required: ['customerId', 'productId', 'quantity'],
        fields: {
            customerId: {
                type: 'string',
                pattern: /^CUST-\d{6}$/
            },
            productId: {
                type: 'string',
                pattern: /^PROD-\d{4}$/
            },
            quantity: {
                type: 'number',
                min: 1,
                max: 100
            },
            discount: {
                type: 'number',
                min: 0,
                max: 1
            }
        }
    });

    // Register custom rule
    engine.registerRule('discount_validation', (document, context) => {
        const errors = [];
        const warnings = [];

        if (document.discount && document.quantity) {
            if (document.discount > 0.5 && document.quantity < 10) {
                warnings.push({
                    field: 'discount',
                    message: 'High discount for low quantity order'
                });
            }
        }

        return { errors, warnings };
    });

    // Test custom schema
    const customDoc = {
        customerId: "CUST-123456",
        productId: "PROD-9999",
        quantity: 5,
        discount: 0.6
    };

    const result = engine.validateDocument(customDoc, 'custom_form');

    console.log("\n📄 Custom Document Validation");
    console.log("✓ Is Valid:", result.isValid);
    console.log("📊 Quality Score:", result.getQualityScore() + "%");

    if (result.warnings.length > 0) {
        console.log("\n⚠️  Warnings:");
        result.warnings.forEach(warn => {
            console.log(`  - ${warn.field}: ${warn.message}`);
        });
    }

    return result;
}

// Example 6: Field-level confidence checking
function example6_confidenceValidation() {
    console.log("\n" + "=".repeat(80));
    console.log("EXAMPLE 6: Confidence Score Validation");
    console.log("=".repeat(80));

    const engine = new ValidationEngine();

    const docWithConfidence = {
        applicantName: "John Smith",
        dateOfBirth: "1990-01-01",
        applicationDate: "2024-01-15",
        formType: "new_application",
        email: "john@example.com",
        confidence: 0.65, // Below threshold
        address: {
            street: "123 Main St",
            city: "Springfield",
            state: "IL",
            zipCode: "62701",
            _confidence: 0.55 // Field-level confidence
        }
    };

    const result = engine.validateDocument(docWithConfidence, 'application_form');

    console.log("\n📄 Document with Confidence Scores");
    console.log("📊 Overall Confidence:", (docWithConfidence.confidence * 100).toFixed(1) + "%");

    if (result.warnings.length > 0) {
        console.log("\n⚠️  Confidence Warnings:");
        result.warnings.forEach(warn => {
            if (warn.field === 'confidence' || warn.message.includes('confidence')) {
                console.log(`  - ${warn.field}: ${warn.message}`);
            }
        });
    }

    return result;
}

// Example 7: Comprehensive validation report
function example7_detailedReport() {
    console.log("\n" + "=".repeat(80));
    console.log("EXAMPLE 7: Detailed Validation Report");
    console.log("=".repeat(80));

    const engine = new ValidationEngine();
    const documents = [
        { document: sampleApplicationForm, type: 'application_form' },
        { document: sampleEligibilityDoc, type: 'eligibility_document' }
    ];

    const result = engine.validateDocumentSet(documents);
    const report = result.getDetailedReport();

    console.log("\n📊 DETAILED VALIDATION REPORT");
    console.log("─".repeat(80));
    console.log(JSON.stringify(report, null, 2));

    return report;
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

function runAllExamples() {
    try {
        example1_singleDocumentValidation();
        example2_invalidDocumentValidation();
        example3_documentSetValidation();
        example4_inGoodOrderCheck();
        example5_customSchemaAndRules();
        example6_confidenceValidation();
        example7_detailedReport();

        console.log("\n" + "=".repeat(80));
        console.log("✅ ALL EXAMPLES COMPLETED SUCCESSFULLY");
        console.log("=".repeat(80) + "\n");

    } catch (error) {
        console.error("\n❌ Error running examples:", error);
        console.error(error.stack);
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sampleApplicationForm,
        sampleEligibilityDoc,
        sampleIncomeDoc,
        invalidApplicationForm,
        expiredEligibilityDoc,
        runAllExamples,
        example1_singleDocumentValidation,
        example2_invalidDocumentValidation,
        example3_documentSetValidation,
        example4_inGoodOrderCheck,
        example5_customSchemaAndRules,
        example6_confidenceValidation,
        example7_detailedReport
    };
}

// Browser support
if (typeof window !== 'undefined') {
    window.ValidationExamples = {
        sampleApplicationForm,
        sampleEligibilityDoc,
        sampleIncomeDoc,
        runAllExamples
    };
}

// Auto-run if executed directly in Node.js
if (typeof require !== 'undefined' && require.main === module) {
    // Load the validation engine
    const {ValidationEngine} = require('./validation-engine.js');
    runAllExamples();
}
