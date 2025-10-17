# ONC Electronic Health Information (EHI) Export Documentation

**Last Updated:** October 11, 2025
**Version:** 1.0
**Product:** Kipu EMR

---

## Export Types Supported

This certified health IT product supports two types of EHI exports:

1. **Single Patient Export** - Export complete health information for an individual patient
2. **Population Export** - Export health information for multiple patients (available upon request)

Both export types are provided **at no charge** to patients and authorized users.

---

## How to Obtain Exports

### Single Patient Export

**Who Can Request:**
- Patients (for their own records)
- Authorized patient representatives
- Healthcare providers with proper authorization
- Users with appropriate system permissions

**How to Request:**

1. **Via API:**
   - Endpoint: `GET /api/emr/onc/ehi/exports/:patient_id`
   - Replace `:patient_id` with the patient's unique identifier
   - Requires authentication and authorization

2. **Via User Interface:**
   - Navigate to the patient's chart
   - Select "Export Patient Data" or "Request EHI Export"
   - System will generate and provide the export file

3. **Via Patient Request:**
   - Patients may submit a written request to their provider
   - Healthcare facility staff will process the request within required timeframes
   - Export will be provided electronically or via physical media as requested

### Population Export

Population exports for multiple patients can be requested by:
- Healthcare organizations for their patient population
- Patients requesting records of family members (with proper authorization)
- Authorized health information exchanges

Contact your system administrator or Kipu Health support to initiate a population export.

---

## Cost

**All EHI exports are provided at no charge.** There are no fees for:
- Requesting the export
- Generating the export
- Receiving the export electronically
- Accessing the export documentation

Physical media costs (USB drives, CDs, etc.), if requested, may be subject to reasonable cost-based fees as permitted by law.

---

## How to Access and Use the Export

### Accessing Your Export

**Electronic Delivery:**
- API responses are provided immediately in JSON format
- Downloads are provided as JSON files
- Files can be opened with any text editor or JSON viewer

**Physical Media (if requested):**
- USB flash drive
- CD/DVD
- Secure file transfer

### Opening the Export File

1. **Using a Text Editor:**
   - Open with any text editor (Notepad, TextEdit, VS Code, etc.)
   - View the raw JSON data

2. **Using a JSON Viewer:**
   - Use online JSON viewers (jsonviewer.stack.hu, jsoneditoronline.org)
   - Use browser extensions for formatted viewing
   - Use desktop JSON viewer applications

3. **Importing to Another System:**
   - Provide the JSON file to your new healthcare provider
   - They can import using the schema documentation provided
   - Contact their IT department for import assistance

---

## File Format Details

### Format Specification

- **Format:** JSON (JavaScript Object Notation)
- **Character Encoding:** UTF-8
- **MIME Type:** application/json
- **File Extension:** .json
- **Specification:** RFC 8259 (JSON Data Interchange Format)
- **API Specification:** JSON:API (jsonapi.org/format)

### Syntax Information

The export uses JSON syntax with the following characteristics:

- **Structure:** Hierarchical key-value pairs
- **Data Types:** Objects, Arrays, Strings, Numbers, Booleans, Null
- **Date/Time Format:** ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
- **Field Naming:** snake_case convention
- **Nesting:** Multi-level nested objects and arrays

**Example Structure:**
```json
{
  "data": {
    "type": "patient",
    "id": "12345",
    "attributes": {
      "demographics": { },
      "medications": [ ],
      "allergies": [ ]
    }
  },
  "meta": {
    "exported_at": "2025-10-11T12:00:00Z",
    "schema_url": "https://example.com/onc-ehi-export-schema.json"
  }
}
```

### Schema Reference

Complete technical schema documentation including all field definitions, data types, and validation rules is available at the `schema_url` provided in each export's metadata section.

---

## Data Dictionary

### Top-Level Structure

| Field | Type | Description |
|-------|------|-------------|
| `data` | Object | Contains patient health information |
| `meta` | Object | Contains export metadata and references |

### Data Attributes

The `data.attributes` object contains the following categories of health information:

#### Demographics
Patient identifying and demographic information

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name.first_name` | String | Patient's first name | "John" |
| `name.last_name` | String | Patient's last name | "Doe" |
| `name.middle_name` | String | Patient's middle name | "Michael" |
| `date_of_birth` | String (ISO 8601) | Patient's date of birth | "1980-01-15" |
| `gender` | String | Patient's gender | "Male" |
| `race` | String | Patient's race | "White" |
| `ethnicity` | String | Patient's ethnicity | "Not Hispanic or Latino" |
| `preferred_language` | String | Patient's preferred language | "English" |

#### Identifiers
Patient identification numbers and codes

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `patient_number` | String | Internal patient number | "P123456" |
| `mr_number` | String | Medical record number | "MR789012" |
| `ssn` | String | Social Security Number (masked) | "***-**-1234" |
| `external_ids` | Array | External system identifiers | [...] |

#### Contacts
Contact information and emergency contacts

| Field | Type | Description |
|-------|------|-------------|
| `addresses` | Array | Patient addresses (home, mailing, etc.) |
| `phone_numbers` | Array | Phone numbers with type and purpose |
| `email_addresses` | Array | Email addresses |
| `emergency_contacts` | Array | Emergency contact persons |

#### Treatment Episodes
Records of admissions and treatment programs

| Field | Type | Description |
|-------|------|-------------|
| `admission_date` | String (ISO 8601) | Date of admission |
| `discharge_date` | String (ISO 8601) | Date of discharge |
| `program_name` | String | Treatment program name |
| `location` | String | Facility/location name |
| `level_of_care` | String | Care level (inpatient, outpatient, etc.) |

#### Diagnoses
Medical diagnoses and conditions

| Field | Type | Description |
|-------|------|-------------|
| `code` | String | ICD-10 or DSM-5 code |
| `description` | String | Diagnosis description |
| `diagnosis_date` | String (ISO 8601) | Date of diagnosis |
| `type` | String | Diagnosis type (primary, secondary, etc.) |

#### Medications
Current and historical medications

| Field | Type | Description |
|-------|------|-------------|
| `medication_name` | String | Generic or brand name |
| `dosage` | String | Dose amount |
| `frequency` | String | Administration frequency |
| `route` | String | Route of administration |
| `start_date` | String (ISO 8601) | Start date |
| `end_date` | String (ISO 8601) | End date (if discontinued) |
| `prescriber` | String | Prescribing provider name |

#### Allergies
Documented allergies and adverse reactions

| Field | Type | Description |
|-------|------|-------------|
| `allergen` | String | Substance causing allergy |
| `reaction` | String | Type of reaction |
| `severity` | String | Severity level |
| `onset_date` | String (ISO 8601) | Date of onset |

#### Vital Signs
Physical measurements and observations

| Field | Type | Description |
|-------|------|-------------|
| `measurement_date` | String (ISO 8601) | Date/time of measurement |
| `blood_pressure_systolic` | Number | Systolic BP (mmHg) |
| `blood_pressure_diastolic` | Number | Diastolic BP (mmHg) |
| `temperature` | Number | Temperature (°F or °C) |
| `pulse` | Number | Heart rate (bpm) |
| `respiration_rate` | Number | Breaths per minute |
| `weight` | Number | Weight (lbs or kg) |
| `height` | Number | Height (inches or cm) |
| `bmi` | Number | Body Mass Index |

#### Laboratory Results
Lab test results and findings

| Field | Type | Description |
|-------|------|-------------|
| `test_name` | String | Name of laboratory test |
| `result_value` | String/Number | Test result value |
| `unit` | String | Unit of measurement |
| `reference_range` | String | Normal reference range |
| `abnormal_flag` | String | Abnormal indicator (H/L/N) |
| `collection_date` | String (ISO 8601) | Specimen collection date |
| `result_date` | String (ISO 8601) | Result date |

#### Patient Evaluations
Clinical assessments and notes

| Field | Type | Description |
|-------|------|-------------|
| `evaluation_type` | String | Type of evaluation/form |
| `evaluation_date` | String (ISO 8601) | Date completed |
| `author` | String | Provider who completed evaluation |
| `content` | Object/Array | Evaluation content and responses |

#### Group Sessions
Group therapy and educational sessions

| Field | Type | Description |
|-------|------|-------------|
| `session_name` | String | Name of group session |
| `session_date` | String (ISO 8601) | Date of session |
| `duration_minutes` | Number | Session duration |
| `attendance_status` | String | Attendance status |
| `topic` | String | Session topic/focus |

#### Preferences
Patient preferences and settings

| Field | Type | Description |
|-------|------|-------------|
| `communication_preferences` | Object | Preferred contact methods |
| `language_preference` | String | Preferred language for communication |
| `privacy_preferences` | Object | Privacy and confidentiality preferences |

### Metadata Fields

The `meta` object contains export information:

| Field | Type | Description |
|-------|------|-------------|
| `patient_id` | Number | Internal patient identifier |
| `patient_mr` | String | Patient medical record number |
| `exported_at` | String (ISO 8601) | Export timestamp |
| `exported_by` | String | Name of user who generated export |
| `schema_url` | String | URL to JSON schema document |
| `documentation_url` | String | URL to this documentation |

---

## Implementation Guides

### For Patients

**Understanding Your Export:**
Your health information export contains all available electronic health information in your medical record. This includes personal information, diagnoses, medications, test results, and treatment notes.

**Sharing Your Information:**
You may share this file with new healthcare providers, health apps, or personal health record systems. The JSON format is a standard format supported by many healthcare systems.

**Privacy and Security:**
- Store your health information export securely
- Only share with trusted healthcare providers or applications
- Be aware that this file contains sensitive personal health information

### For Healthcare Providers

**Importing Patient Data:**
When receiving an EHI export from a patient:
1. Review the schema documentation at the URL provided in the export metadata
2. Parse the JSON structure according to the schema
3. Map fields to your system's data model
4. Validate data integrity and completeness
5. Import into your EHR system following your organization's procedures

**Technical Support:**
For technical questions about importing data, refer to the JSON schema or contact Kipu Health technical support.

### For Software Developers

**Integration Guidelines:**
1. Parse JSON according to RFC 8259 specifications
2. Follow JSON:API conventions for structure interpretation
3. Reference the JSON schema for field validation
4. Handle all data types appropriately (strings, numbers, dates, etc.)
5. Implement proper error handling for missing or invalid data
6. Maintain data security and privacy during processing

**Schema Validation:**
Use the JSON schema provided at the `schema_url` in the export metadata to validate the structure and data types.

---

## Terms of Use

### Patient Rights

In accordance with federal regulations including the 21st Century Cures Act and HIPAA:

- **Right to Access:** Patients have the right to access their electronic health information without unreasonable barriers
- **No Charge:** EHI exports are provided at no charge (except reasonable physical media costs)
- **Timely Access:** Exports are provided promptly, typically within 30 days of request
- **Complete Information:** Exports include all available electronic health information
- **Format:** Information is provided in a machine-readable, electronic format

### Data Use and Privacy

**By accessing this export, you acknowledge:**

- This information is protected health information (PHI) under HIPAA
- Substance use disorder treatment information may be protected under 42 CFR Part 2
- You are responsible for maintaining the security and confidentiality of this information
- Unauthorized disclosure may violate federal and state privacy laws
- You will use this information only for lawful purposes

**Permitted Uses:**
- Personal health management
- Sharing with healthcare providers for treatment
- Personal health record keeping
- Coordination of care
- Exercise of patient rights

**Prohibited Uses:**
- Unauthorized disclosure to third parties
- Use for marketing without consent
- Sale of information
- Use for discrimination or harassment

### Disclaimer

This export represents electronic health information available in the certified health IT system at the time of export. Kipu Health makes no warranties regarding:

- Completeness of information from external sources
- Clinical accuracy of information entered by healthcare providers
- Suitability for specific medical decisions
- Compatibility with specific third-party systems

Healthcare decisions should be made in consultation with qualified healthcare providers.

### Liability

Kipu Health is not liable for:
- Consequences of using or relying on exported information
- Issues arising from importing data into third-party systems
- Loss or corruption of export files after delivery
- Unauthorized access or disclosure by recipients

---

## Format Updates and Version Control

### Current Version

**Version 1.0** (Released October 11, 2025)
- Initial ONC-certified EHI export format
- JSON format with JSON:API structure
- Comprehensive patient data coverage

### Format Maintenance

This export format and documentation are maintained and updated to:
- Comply with current ONC certification requirements
- Reflect changes in federal regulations
- Support healthcare industry standards
- Improve data completeness and usability

### Version History and Changes

When the export format is updated:
- Documentation is updated to reflect all changes
- Version history is maintained in this document
- Backward compatibility information is provided
- Migration guides are published if needed
- This hyperlink remains current with the latest documentation

### Accessing Previous Versions

If you have an export from a previous version of this system and need documentation for that format, contact Kipu Health support with:
- The export date (found in the `exported_at` field)
- The patient ID or MR number
- The version number if available

---

## Support and Contact Information

### For Patients

If you need assistance with:
- Requesting your health information export
- Understanding your export data
- Accessing your export file
- Resolving issues with export requests

**Contact your healthcare provider's office:**
They can assist you with export requests and explain your health information.

### For Healthcare Providers

For questions about:
- Importing patient data
- Technical integration
- Data mapping
- System compatibility

**Contact Kipu Health Support:**
- Email: support@kipuhealth.com
- Phone: [Contact your account representative]
- Support Portal: [Available through your Kipu EMR system]

### For Software Developers

For technical documentation and integration support:
- API Documentation: Available through Kipu Health developer portal
- JSON Schema: Available at the `schema_url` in export metadata
- Technical Support: Contact your Kipu Health technical account manager

---

## Compliance and Certification

### Regulatory Compliance

This EHI export format complies with:

- **21st Century Cures Act** - Information blocking provisions (45 CFR Part 171)
- **ONC Certification Criteria** - § 170.315(b)(10) Electronic Health Information Export
- **HIPAA Privacy Rule** - 45 CFR § 164.524 (Right of access)
- **HIPAA Security Rule** - 45 CFR Parts 160, 162, and 164
- **42 CFR Part 2** - Confidentiality of substance use disorder patient records

### Certification Information

- **Certified Product:** Kipu EMR
- **Certification Date:** [To be completed upon certification]
- **Certification Number:** [To be completed upon certification]
- **Testing Lab:** Drummond Group
- **CHPL Listing:** [Link to be added upon certification]

### Standards Compliance

- **Data Format:** JSON (RFC 8259)
- **API Standard:** JSON:API (jsonapi.org)
- **Date/Time:** ISO 8601
- **Character Encoding:** UTF-8 (RFC 3629)

---

## Accessibility

This documentation is publicly accessible without:
- Authentication requirements
- Account creation
- Fees or charges
- Preconditions or additional steps
- Geographic restrictions

The hyperlink to this documentation:
- Is provided in every EHI export
- Is published on the Certified Health IT Product List (CHPL)
- Remains current with the latest documentation
- Is maintained for the lifetime of the certified product

---

## Questions and Feedback

We welcome feedback on this documentation to improve clarity and usability.

For documentation feedback:
- Email: ehi-feedback@kipuhealth.com
- Subject line: "ONC EHI Export Documentation Feedback"

Your input helps us improve access to health information for all users.

---

**Document Version:** 1.0
**Last Updated:** October 11, 2025
**Next Review Date:** January 11, 2026

---

*This documentation is maintained as part of ONC Health IT Certification requirements and is updated regularly to ensure accuracy and compliance.*
