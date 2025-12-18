/**
 * DOCUMENT VALIDATION ENGINE
 * "In Good Order" validation system for Intelligent Document Processing
 *
 * Validates IDP JSON extracts against schemas, business rules, and cross-document consistency.
 */

// ============================================================================
// CORE VALIDATION ENGINE
// ============================================================================

class ValidationEngine {
    constructor() {
        this.schemas = new SchemaRegistry();
        this.rules = new RuleRegistry();
        this.validators = {
            document: new DocumentValidator(this.schemas, this.rules),
            crossDocument: new CrossDocumentValidator(this.rules),
            dataQuality: new DataQualityValidator()
        };
    }

    /**
     * Validate a single document
     * @param {Object} document - IDP JSON extract
     * @param {string} documentType - Type of document (e.g., 'application_form', 'eligibility_doc')
     * @returns {ValidationResult}
     */
    validateDocument(document, documentType) {
        const startTime = Date.now();
        const result = new ValidationResult(documentType);

        try {
            // Schema validation
            const schemaValidation = this.validators.document.validateSchema(document, documentType);
            result.addValidation('schema', schemaValidation);

            // Business rules validation
            const rulesValidation = this.validators.document.validateRules(document, documentType);
            result.addValidation('business_rules', rulesValidation);

            // Data quality checks
            const qualityValidation = this.validators.dataQuality.validate(document);
            result.addValidation('data_quality', qualityValidation);

        } catch (error) {
            result.addError('system', `Validation failed: ${error.message}`);
        }

        result.finalize(Date.now() - startTime);
        return result;
    }

    /**
     * Validate multiple documents together (cross-document validation)
     * @param {Array<Object>} documents - Array of {document, type} objects
     * @returns {ValidationResult}
     */
    validateDocumentSet(documents) {
        const startTime = Date.now();
        const result = new ValidationResult('document_set');

        try {
            // Validate each document individually
            const individualResults = documents.map(({document, type}) =>
                this.validateDocument(document, type)
            );

            // Aggregate individual results
            individualResults.forEach((docResult, index) => {
                result.addSubResult(`document_${index}`, docResult);
            });

            // Cross-document validation
            const crossValidation = this.validators.crossDocument.validate(documents);
            result.addValidation('cross_document', crossValidation);

        } catch (error) {
            result.addError('system', `Document set validation failed: ${error.message}`);
        }

        result.finalize(Date.now() - startTime);
        return result;
    }

    /**
     * Check if documents are "in good order"
     * @param {Array<Object>} documents - Array of {document, type} objects
     * @returns {Object} - { inGoodOrder: boolean, result: ValidationResult }
     */
    checkInGoodOrder(documents) {
        const result = this.validateDocumentSet(documents);

        // "In Good Order" criteria:
        // 1. No critical errors
        // 2. All required fields present
        // 3. Cross-document consistency passed
        // 4. Data quality score above threshold (80%)

        const inGoodOrder =
            !result.hasCriticalErrors() &&
            result.getQualityScore() >= 80;

        return {
            inGoodOrder,
            result,
            summary: result.getSummary()
        };
    }

    /**
     * Register a custom schema
     */
    registerSchema(name, schema) {
        this.schemas.register(name, schema);
    }

    /**
     * Register a custom validation rule
     */
    registerRule(name, rule) {
        this.rules.register(name, rule);
    }
}

// ============================================================================
// VALIDATION RESULT
// ============================================================================

class ValidationResult {
    constructor(documentType) {
        this.documentType = documentType;
        this.validations = {};
        this.subResults = {};
        this.errors = [];
        this.warnings = [];
        this.info = [];
        this.isValid = true;
        this.executionTime = 0;
    }

    addValidation(name, validation) {
        this.validations[name] = validation;

        if (validation.errors && validation.errors.length > 0) {
            this.isValid = false;
            this.errors.push(...validation.errors.map(e => ({
                source: name,
                ...e
            })));
        }

        if (validation.warnings) {
            this.warnings.push(...validation.warnings.map(w => ({
                source: name,
                ...w
            })));
        }
    }

    addSubResult(name, result) {
        this.subResults[name] = result;
        if (!result.isValid) {
            this.isValid = false;
        }
    }

    addError(field, message, severity = 'critical') {
        this.errors.push({ field, message, severity });
        this.isValid = false;
    }

    addWarning(field, message) {
        this.warnings.push({ field, message });
    }

    addInfo(field, message) {
        this.info.push({ field, message });
    }

    hasCriticalErrors() {
        return this.errors.some(e => e.severity === 'critical');
    }

    getQualityScore() {
        const totalChecks = Object.keys(this.validations).length * 10;
        const errorPenalty = this.errors.length * 5;
        const warningPenalty = this.warnings.length * 2;

        const score = Math.max(0, 100 - errorPenalty - warningPenalty);
        return score;
    }

    getSummary() {
        return {
            documentType: this.documentType,
            isValid: this.isValid,
            qualityScore: this.getQualityScore(),
            errorCount: this.errors.length,
            warningCount: this.warnings.length,
            criticalErrorCount: this.errors.filter(e => e.severity === 'critical').length,
            executionTime: this.executionTime
        };
    }

    getDetailedReport() {
        return {
            ...this.getSummary(),
            errors: this.errors,
            warnings: this.warnings,
            info: this.info,
            validations: this.validations,
            subResults: Object.entries(this.subResults).map(([name, result]) => ({
                name,
                summary: result.getSummary()
            }))
        };
    }

    finalize(executionTime) {
        this.executionTime = executionTime;
    }
}

// ============================================================================
// SCHEMA REGISTRY
// ============================================================================

class SchemaRegistry {
    constructor() {
        this.schemas = {};
        this.initializeDefaultSchemas();
    }

    initializeDefaultSchemas() {
        // Application Form Schema
        this.register('application_form', {
            required: ['applicantName', 'dateOfBirth', 'applicationDate', 'formType'],
            fields: {
                applicantName: {
                    type: 'string',
                    minLength: 2,
                    maxLength: 100,
                    pattern: /^[a-zA-Z\s\-'\.]+$/
                },
                dateOfBirth: {
                    type: 'date',
                    format: 'YYYY-MM-DD',
                    maxDate: 'today'
                },
                applicationDate: {
                    type: 'date',
                    format: 'YYYY-MM-DD',
                    maxDate: 'today'
                },
                formType: {
                    type: 'string',
                    enum: ['new_application', 'renewal', 'amendment']
                },
                email: {
                    type: 'email',
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                },
                phone: {
                    type: 'string',
                    pattern: /^\+?[\d\s\-()]+$/
                },
                ssn: {
                    type: 'string',
                    pattern: /^\d{3}-?\d{2}-?\d{4}$/,
                    masked: true
                },
                address: {
                    type: 'object',
                    required: ['street', 'city', 'state', 'zipCode'],
                    fields: {
                        street: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string', length: 2 },
                        zipCode: { type: 'string', pattern: /^\d{5}(-\d{4})?$/ }
                    }
                }
            }
        });

        // Eligibility Document Schema
        this.register('eligibility_document', {
            required: ['documentType', 'issueDate', 'expirationDate', 'status', 'holderName'],
            fields: {
                documentType: {
                    type: 'string',
                    enum: ['drivers_license', 'passport', 'state_id', 'birth_certificate', 'ssn_card']
                },
                documentNumber: {
                    type: 'string',
                    minLength: 5,
                    maxLength: 50
                },
                issueDate: {
                    type: 'date',
                    format: 'YYYY-MM-DD',
                    maxDate: 'today'
                },
                expirationDate: {
                    type: 'date',
                    format: 'YYYY-MM-DD',
                    minDate: 'today'
                },
                status: {
                    type: 'string',
                    enum: ['valid', 'expired', 'suspended', 'revoked']
                },
                holderName: {
                    type: 'string',
                    minLength: 2,
                    maxLength: 100
                },
                issuingAuthority: {
                    type: 'string'
                },
                confidence: {
                    type: 'number',
                    min: 0,
                    max: 1
                }
            }
        });

        // Income Verification Document
        this.register('income_verification', {
            required: ['documentType', 'period', 'amount', 'employeeName'],
            fields: {
                documentType: {
                    type: 'string',
                    enum: ['paystub', 'w2', '1099', 'bank_statement']
                },
                period: {
                    type: 'object',
                    required: ['start', 'end'],
                    fields: {
                        start: { type: 'date' },
                        end: { type: 'date' }
                    }
                },
                amount: {
                    type: 'number',
                    min: 0
                },
                employeeName: {
                    type: 'string'
                },
                employerName: {
                    type: 'string'
                },
                ytdEarnings: {
                    type: 'number',
                    min: 0
                }
            }
        });
    }

    register(name, schema) {
        this.schemas[name] = schema;
    }

    get(name) {
        return this.schemas[name];
    }

    exists(name) {
        return name in this.schemas;
    }
}

// ============================================================================
// VALIDATION RULES REGISTRY
// ============================================================================

class RuleRegistry {
    constructor() {
        this.rules = {};
        this.initializeDefaultRules();
    }

    initializeDefaultRules() {
        // Age verification rule
        this.register('age_verification', (document, context) => {
            const errors = [];
            const warnings = [];

            if (document.dateOfBirth) {
                const age = this.calculateAge(document.dateOfBirth);

                if (age < 18) {
                    errors.push({
                        field: 'dateOfBirth',
                        message: `Applicant is ${age} years old, must be 18+`,
                        severity: 'critical'
                    });
                }

                if (age > 120) {
                    errors.push({
                        field: 'dateOfBirth',
                        message: `Invalid age: ${age} years`,
                        severity: 'critical'
                    });
                }
            }

            return { errors, warnings };
        });

        // Document expiration rule
        this.register('document_expiration', (document, context) => {
            const errors = [];
            const warnings = [];

            if (document.expirationDate) {
                const expirationDate = new Date(document.expirationDate);
                const today = new Date();
                const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

                if (daysUntilExpiration < 0) {
                    errors.push({
                        field: 'expirationDate',
                        message: `Document expired ${Math.abs(daysUntilExpiration)} days ago`,
                        severity: 'critical'
                    });
                } else if (daysUntilExpiration < 30) {
                    warnings.push({
                        field: 'expirationDate',
                        message: `Document expires in ${daysUntilExpiration} days`
                    });
                }
            }

            return { errors, warnings };
        });

        // Name consistency rule
        this.register('name_consistency', (document, context) => {
            const errors = [];
            const warnings = [];

            if (document.applicantName && document.holderName) {
                const normalized1 = this.normalizeName(document.applicantName);
                const normalized2 = this.normalizeName(document.holderName);

                if (normalized1 !== normalized2) {
                    const similarity = this.calculateStringSimilarity(normalized1, normalized2);

                    if (similarity < 0.7) {
                        errors.push({
                            field: 'name',
                            message: `Name mismatch: "${document.applicantName}" vs "${document.holderName}"`,
                            severity: 'high'
                        });
                    } else {
                        warnings.push({
                            field: 'name',
                            message: `Possible name variation: "${document.applicantName}" vs "${document.holderName}"`
                        });
                    }
                }
            }

            return { errors, warnings };
        });

        // Date consistency rule
        this.register('date_consistency', (document, context) => {
            const errors = [];
            const warnings = [];

            // Application date should not be before birth date
            if (document.dateOfBirth && document.applicationDate) {
                const birthDate = new Date(document.dateOfBirth);
                const appDate = new Date(document.applicationDate);

                if (appDate < birthDate) {
                    errors.push({
                        field: 'applicationDate',
                        message: 'Application date cannot be before birth date',
                        severity: 'critical'
                    });
                }
            }

            // Issue date should be before expiration date
            if (document.issueDate && document.expirationDate) {
                const issueDate = new Date(document.issueDate);
                const expDate = new Date(document.expirationDate);

                if (issueDate >= expDate) {
                    errors.push({
                        field: 'issueDate',
                        message: 'Issue date must be before expiration date',
                        severity: 'critical'
                    });
                }
            }

            return { errors, warnings };
        });

        // Confidence threshold rule
        this.register('confidence_threshold', (document, context) => {
            const errors = [];
            const warnings = [];
            const threshold = context?.confidenceThreshold || 0.8;

            if (document.confidence !== undefined) {
                if (document.confidence < threshold) {
                    warnings.push({
                        field: 'confidence',
                        message: `Low extraction confidence: ${(document.confidence * 100).toFixed(1)}%`
                    });
                }

                if (document.confidence < 0.5) {
                    errors.push({
                        field: 'confidence',
                        message: `Very low extraction confidence: ${(document.confidence * 100).toFixed(1)}%`,
                        severity: 'high'
                    });
                }
            }

            // Check field-level confidence
            Object.keys(document).forEach(key => {
                const value = document[key];
                if (value && typeof value === 'object' && value._confidence !== undefined) {
                    if (value._confidence < threshold) {
                        warnings.push({
                            field: key,
                            message: `Low field confidence: ${(value._confidence * 100).toFixed(1)}%`
                        });
                    }
                }
            });

            return { errors, warnings };
        });
    }

    register(name, ruleFunction) {
        this.rules[name] = ruleFunction;
    }

    get(name) {
        return this.rules[name];
    }

    exists(name) {
        return name in this.rules;
    }

    // Helper methods
    calculateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    normalizeName(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z]/g, '')
            .trim();
    }

    calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }
}

// ============================================================================
// DOCUMENT VALIDATOR
// ============================================================================

class DocumentValidator {
    constructor(schemaRegistry, ruleRegistry) {
        this.schemas = schemaRegistry;
        this.rules = ruleRegistry;
    }

    validateSchema(document, documentType) {
        const schema = this.schemas.get(documentType);
        const errors = [];
        const warnings = [];

        if (!schema) {
            errors.push({
                field: 'schema',
                message: `Unknown document type: ${documentType}`,
                severity: 'critical'
            });
            return { errors, warnings };
        }

        // Check required fields
        if (schema.required) {
            schema.required.forEach(fieldName => {
                if (!(fieldName in document) || document[fieldName] === null || document[fieldName] === undefined || document[fieldName] === '') {
                    errors.push({
                        field: fieldName,
                        message: `Required field "${fieldName}" is missing or empty`,
                        severity: 'critical'
                    });
                }
            });
        }

        // Validate field types and constraints
        Object.keys(document).forEach(fieldName => {
            const fieldSchema = schema.fields?.[fieldName];
            if (fieldSchema) {
                const fieldErrors = this.validateField(fieldName, document[fieldName], fieldSchema);
                errors.push(...fieldErrors);
            }
        });

        return { errors, warnings };
    }

    validateField(fieldName, value, schema) {
        const errors = [];

        // Skip validation if value is null/undefined (handled by required check)
        if (value === null || value === undefined) {
            return errors;
        }

        // Type validation
        if (schema.type) {
            if (!this.validateType(value, schema.type)) {
                errors.push({
                    field: fieldName,
                    message: `Invalid type for "${fieldName}". Expected ${schema.type}`,
                    severity: 'high'
                });
                return errors; // Skip further validation if type is wrong
            }
        }

        // Pattern validation
        if (schema.pattern && typeof value === 'string') {
            if (!schema.pattern.test(value)) {
                errors.push({
                    field: fieldName,
                    message: `Invalid format for "${fieldName}"`,
                    severity: 'high'
                });
            }
        }

        // Enum validation
        if (schema.enum && !schema.enum.includes(value)) {
            errors.push({
                field: fieldName,
                message: `Invalid value for "${fieldName}". Must be one of: ${schema.enum.join(', ')}`,
                severity: 'high'
            });
        }

        // String length validation
        if (typeof value === 'string') {
            if (schema.minLength && value.length < schema.minLength) {
                errors.push({
                    field: fieldName,
                    message: `"${fieldName}" must be at least ${schema.minLength} characters`,
                    severity: 'medium'
                });
            }
            if (schema.maxLength && value.length > schema.maxLength) {
                errors.push({
                    field: fieldName,
                    message: `"${fieldName}" exceeds maximum length of ${schema.maxLength}`,
                    severity: 'medium'
                });
            }
        }

        // Number range validation
        if (typeof value === 'number') {
            if (schema.min !== undefined && value < schema.min) {
                errors.push({
                    field: fieldName,
                    message: `"${fieldName}" must be at least ${schema.min}`,
                    severity: 'medium'
                });
            }
            if (schema.max !== undefined && value > schema.max) {
                errors.push({
                    field: fieldName,
                    message: `"${fieldName}" must not exceed ${schema.max}`,
                    severity: 'medium'
                });
            }
        }

        // Nested object validation
        if (schema.type === 'object' && typeof value === 'object') {
            if (schema.required) {
                schema.required.forEach(requiredField => {
                    if (!(requiredField in value)) {
                        errors.push({
                            field: `${fieldName}.${requiredField}`,
                            message: `Required field "${fieldName}.${requiredField}" is missing`,
                            severity: 'critical'
                        });
                    }
                });
            }

            if (schema.fields) {
                Object.keys(value).forEach(nestedField => {
                    const nestedSchema = schema.fields[nestedField];
                    if (nestedSchema) {
                        const nestedErrors = this.validateField(
                            `${fieldName}.${nestedField}`,
                            value[nestedField],
                            nestedSchema
                        );
                        errors.push(...nestedErrors);
                    }
                });
            }
        }

        return errors;
    }

    validateType(value, expectedType) {
        switch (expectedType) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'date':
                return this.isValidDate(value);
            case 'email':
                return typeof value === 'string';
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            case 'array':
                return Array.isArray(value);
            default:
                return true;
        }
    }

    isValidDate(value) {
        if (typeof value === 'string') {
            const date = new Date(value);
            return !isNaN(date.getTime());
        }
        return value instanceof Date && !isNaN(value.getTime());
    }

    validateRules(document, documentType) {
        const errors = [];
        const warnings = [];

        // Apply all registered rules
        Object.keys(this.rules.rules).forEach(ruleName => {
            const rule = this.rules.get(ruleName);
            const result = rule(document, { documentType });

            if (result.errors) {
                errors.push(...result.errors);
            }
            if (result.warnings) {
                warnings.push(...result.warnings);
            }
        });

        return { errors, warnings };
    }
}

// ============================================================================
// CROSS-DOCUMENT VALIDATOR
// ============================================================================

class CrossDocumentValidator {
    constructor(ruleRegistry) {
        this.rules = ruleRegistry;
    }

    validate(documents) {
        const errors = [];
        const warnings = [];

        // Group documents by type
        const docsByType = {};
        documents.forEach(({document, type}) => {
            if (!docsByType[type]) {
                docsByType[type] = [];
            }
            docsByType[type].push(document);
        });

        // Check for name consistency across all documents
        const allNames = documents
            .map(({document}) => document.applicantName || document.holderName || document.employeeName)
            .filter(Boolean);

        if (allNames.length > 1) {
            const nameValidation = this.validateNameConsistency(allNames);
            errors.push(...nameValidation.errors);
            warnings.push(...nameValidation.warnings);
        }

        // Check for date consistency
        const dateValidation = this.validateDateConsistency(documents);
        errors.push(...dateValidation.errors);
        warnings.push(...dateValidation.warnings);

        // Validate document completeness
        const completenessValidation = this.validateCompleteness(docsByType);
        errors.push(...completenessValidation.errors);
        warnings.push(...completenessValidation.warnings);

        return { errors, warnings };
    }

    validateNameConsistency(names) {
        const errors = [];
        const warnings = [];
        const normalizedNames = names.map(n => this.rules.normalizeName(n));
        const uniqueNames = [...new Set(normalizedNames)];

        if (uniqueNames.length > 1) {
            errors.push({
                field: 'cross_document_names',
                message: `Name inconsistency across documents: ${names.join(', ')}`,
                severity: 'high'
            });
        }

        return { errors, warnings };
    }

    validateDateConsistency(documents) {
        const errors = [];
        const warnings = [];

        // Find application date and check against all document dates
        const appDoc = documents.find(({type}) => type === 'application_form');
        if (appDoc && appDoc.document.applicationDate) {
            const appDate = new Date(appDoc.document.applicationDate);

            documents.forEach(({document, type}) => {
                if (document.issueDate) {
                    const issueDate = new Date(document.issueDate);
                    if (issueDate > appDate) {
                        warnings.push({
                            field: 'cross_document_dates',
                            message: `Document issue date (${document.issueDate}) is after application date`
                        });
                    }
                }
            });
        }

        return { errors, warnings };
    }

    validateCompleteness(docsByType) {
        const errors = [];
        const warnings = [];

        // Check if we have required document types
        const requiredTypes = ['application_form', 'eligibility_document'];
        requiredTypes.forEach(type => {
            if (!docsByType[type] || docsByType[type].length === 0) {
                errors.push({
                    field: 'document_set',
                    message: `Missing required document type: ${type}`,
                    severity: 'critical'
                });
            }
        });

        return { errors, warnings };
    }
}

// ============================================================================
// DATA QUALITY VALIDATOR
// ============================================================================

class DataQualityValidator {
    validate(document) {
        const errors = [];
        const warnings = [];

        // Check for suspicious patterns
        const suspiciousValidation = this.checkSuspiciousPatterns(document);
        warnings.push(...suspiciousValidation.warnings);

        // Check for data completeness
        const completenessValidation = this.checkCompleteness(document);
        warnings.push(...completenessValidation.warnings);

        return { errors, warnings };
    }

    checkSuspiciousPatterns(document) {
        const warnings = [];

        // Check for sequential numbers (e.g., 123456789)
        Object.entries(document).forEach(([field, value]) => {
            if (typeof value === 'string' && /\d{6,}/.test(value)) {
                const numbers = value.match(/\d+/g);
                if (numbers) {
                    numbers.forEach(num => {
                        if (this.isSequential(num)) {
                            warnings.push({
                                field,
                                message: `Suspicious sequential number pattern in "${field}"`
                            });
                        }
                    });
                }
            }
        });

        // Check for repeated characters (e.g., aaaaaaa)
        Object.entries(document).forEach(([field, value]) => {
            if (typeof value === 'string' && /(.)\1{5,}/.test(value)) {
                warnings.push({
                    field,
                    message: `Suspicious repeated character pattern in "${field}"`
                });
            }
        });

        return { warnings };
    }

    isSequential(str) {
        if (str.length < 4) return false;

        for (let i = 1; i < str.length; i++) {
            const diff = parseInt(str[i]) - parseInt(str[i - 1]);
            if (diff !== 1 && diff !== -1) {
                return false;
            }
        }
        return true;
    }

    checkCompleteness(document) {
        const warnings = [];

        // Calculate field completion rate
        const totalFields = Object.keys(document).length;
        const emptyFields = Object.values(document).filter(v =>
            v === null || v === undefined || v === '' ||
            (typeof v === 'object' && Object.keys(v).length === 0)
        ).length;

        const completionRate = ((totalFields - emptyFields) / totalFields) * 100;

        if (completionRate < 70) {
            warnings.push({
                field: 'document',
                message: `Low data completeness: ${completionRate.toFixed(1)}%`
            });
        }

        return { warnings };
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ValidationEngine,
        ValidationResult,
        SchemaRegistry,
        RuleRegistry,
        DocumentValidator,
        CrossDocumentValidator,
        DataQualityValidator
    };
}

// Browser support
if (typeof window !== 'undefined') {
    window.ValidationEngine = ValidationEngine;
    window.ValidationResult = ValidationResult;
    window.SchemaRegistry = SchemaRegistry;
    window.RuleRegistry = RuleRegistry;
}
