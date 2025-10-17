import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

// Set up pdfmake fonts
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs
} else if (pdfFonts && pdfFonts.vfs) {
  pdfMake.vfs = pdfFonts.vfs
} else {
  console.warn('pdfFonts not loaded correctly')
}

/**
 * PDF Generator for Medical Records
 * Converts patient JSON data to professional PDF documents
 */
export class MedicalRecordPDFGenerator {
  constructor() {
    this.docDefinition = null
    this.patientData = null
    this.sectionTitles = []
    this.sectionPageMap = new Map()
  }

  /**
   * Generate PDF from patient data
   * @param {Object} patientData - Patient JSON data
   * @returns {Promise<Blob>} - PDF blob
   */
async generatePDF(patientData) {
      this.patientData = patientData
      this.collectSectionTitles()
      this.buildSectionPageMap()
      this.docDefinition = this.buildDocumentDefinition()
      
      return new Promise((resolve, reject) => {
        try {
          const pdfDoc = pdfMake.createPdf(this.docDefinition)
          pdfDoc.getBlob((blob) => {
            resolve(blob)
          })
        } catch (error) {
          reject(error)
        }
      })
    }

  /**
   * Collect section titles for header tracking
   */
  collectSectionTitles() {
    this.sectionTitles = []
    
    // Add patient information (first section)
    this.sectionTitles.push('Patient Information')
    
    // Add other sections if they exist
    const attrs = this.patientData.attributes || {}
    
    if (attrs.insurances && attrs.insurances.length > 0) {
      this.sectionTitles.push('Insurance Information')
    }
    
    if (attrs.contacts && attrs.contacts.length > 0) {
      this.sectionTitles.push('Patient Contacts')
    }
    
    if (attrs.medications?.ordered && attrs.medications.ordered.length > 0) {
      this.sectionTitles.push('Medication Orders')
    }
    
    if (attrs.medications?.administered && attrs.medications.administered.length > 0) {
      this.sectionTitles.push('Medication Administration Record (MAR)')
    }
    
    if (attrs.integrated_assessments && attrs.integrated_assessments.length > 0) {
      this.sectionTitles.push('Integrated Assessments')
    }
    
    if (attrs.group_sessions && attrs.group_sessions.length > 0) {
      this.sectionTitles.push('Group Sessions')
    }
    
    // Add consent forms
    if (attrs.consent_forms && attrs.consent_forms.length > 0) {
      attrs.consent_forms.forEach(form => {
        this.sectionTitles.push(form.attributes?.consent_form_name || 'Consent Form')
      })
    }
    
    // Add evaluations
    if (attrs.patient_evaluations && attrs.patient_evaluations.length > 0) {
      attrs.patient_evaluations.forEach(evaluation => {
        this.sectionTitles.push(evaluation.attributes?.evaluation_name || 'Patient Evaluation')
      })
    }
  }

  /**
   * Build section-to-page mapping
   * Since each major section and form has pageBreak: 'before', they start on new pages
   */
  buildSectionPageMap() {
    this.sectionPageMap = new Map()
    let currentPage = 1
    
    // Patient Information starts on page 1 (no page break)
    this.sectionPageMap.set(currentPage, 'Patient Information')
    currentPage++
    
    const attrs = this.patientData.attributes || {}
    
    // Each section with pageBreak: 'before' starts on a new page
    if (attrs.insurances && attrs.insurances.length > 0) {
      this.sectionPageMap.set(currentPage, 'Insurance Information')
      currentPage++
    }
    
    if (attrs.contacts && attrs.contacts.length > 0) {
      this.sectionPageMap.set(currentPage, 'Patient Contacts')
      currentPage++
    }
    
    if (attrs.medications?.ordered && attrs.medications.ordered.length > 0) {
      this.sectionPageMap.set(currentPage, 'Medication Orders')
      currentPage++
    }
    
    if (attrs.medications?.administered && attrs.medications.administered.length > 0) {
      const validEntries = (attrs.medications.administered || []).filter(
        entry => entry.attributes?.administered !== null
      )
      if (validEntries.length > 0) {
        this.sectionPageMap.set(currentPage, 'Medication Administration Record (MAR)')
        currentPage++
      }
    }
    
    if (attrs.integrated_assessments && attrs.integrated_assessments.length > 0) {
      const validAssessments = attrs.integrated_assessments.filter(
        assessment => assessment.attributes?.status !== 'empty'
      )
      if (validAssessments.length > 0) {
        this.sectionPageMap.set(currentPage, 'Integrated Assessments')
        currentPage++
      }
    }
    
    if (attrs.group_sessions && attrs.group_sessions.length > 0) {
      this.sectionPageMap.set(currentPage, 'Group Sessions')
      currentPage++
    }
    
    // Each consent form starts on its own page
    if (attrs.consent_forms && attrs.consent_forms.length > 0) {
      attrs.consent_forms.forEach(form => {
        this.sectionPageMap.set(currentPage, form.attributes?.consent_form_name || 'Consent Form')
        currentPage++
      })
    }
    
    // Each evaluation starts on its own page
    if (attrs.patient_evaluations && attrs.patient_evaluations.length > 0) {
      attrs.patient_evaluations.forEach(evaluation => {
        this.sectionPageMap.set(currentPage, evaluation.attributes?.evaluation_name || 'Patient Evaluation')
        currentPage++
      })
    }
    
    console.log('Section Page Map:', Array.from(this.sectionPageMap.entries()))
  }

  /**
   * Build Table of Contents
   */
  buildTableOfContents() {
    const attrs = this.patientData.attributes || {}
    const tocItems = []
    
    // Add main sections
    tocItems.push({ text: 'Patient Information', style: 'tocItem', link: 'patient_info' })
    
    if (attrs.insurances && attrs.insurances.length > 0) {
      tocItems.push({ text: 'Insurance Information', style: 'tocItem', link: 'insurance' })
    }
    
    if (attrs.contacts && attrs.contacts.length > 0) {
      tocItems.push({ text: 'Patient Contacts', style: 'tocItem', link: 'contacts' })
    }
    
    if (attrs.medications?.ordered && attrs.medications.ordered.length > 0) {
      tocItems.push({ text: 'Medication Orders', style: 'tocItem', link: 'medications' })
    }
    
    if (attrs.medications?.administered && attrs.medications.administered.length > 0) {
      const validEntries = (attrs.medications.administered || []).filter(
        entry => entry.attributes?.administered !== null
      )
      if (validEntries.length > 0) {
        tocItems.push({ text: 'Medication Administration Record (MAR)', style: 'tocItem', link: 'mar' })
      }
    }
    
    if (attrs.integrated_assessments && attrs.integrated_assessments.length > 0) {
      const validAssessments = attrs.integrated_assessments.filter(
        assessment => assessment.attributes?.status !== 'empty'
      )
      if (validAssessments.length > 0) {
        tocItems.push({ text: 'Integrated Assessments', style: 'tocItem', link: 'assessments' })
      }
    }
    
    if (attrs.group_sessions && attrs.group_sessions.length > 0) {
      tocItems.push({ text: 'Group Sessions', style: 'tocItem', link: 'group_sessions' })
    }
    
    // Add consent forms
    if (attrs.consent_forms && attrs.consent_forms.length > 0) {
      tocItems.push({ text: 'Consent Forms', style: 'tocItem', bold: true, margin: [0, 10, 0, 5] })
      attrs.consent_forms.forEach((form, idx) => {
        tocItems.push({ 
          text: `  • ${form.attributes?.consent_form_name || 'Consent Form'}`, 
          style: 'tocItem',
          link: `consent_${form.id}`
        })
      })
    }
    
    // Add evaluations
    if (attrs.patient_evaluations && attrs.patient_evaluations.length > 0) {
      tocItems.push({ text: 'Patient Evaluations', style: 'tocItem', bold: true, margin: [0, 10, 0, 5] })
      attrs.patient_evaluations.forEach((evaluation, idx) => {
        tocItems.push({ 
          text: `  • ${evaluation.attributes?.evaluation_name || 'Patient Evaluation'}`, 
          style: 'tocItem',
          link: `evaluation_${evaluation.id}`
        })
      })
    }
    
    return [
      {
        text: 'Table of Contents',
        style: 'tocTitle',
        margin: [0, 40, 0, 20]
      },
      {
        stack: tocItems,
        pageBreak: 'after'
      }
    ]
  }

  /**
   * Build the complete document definition
   */
  buildDocumentDefinition() {
    const attrs = this.patientData.attributes || {}
    const demographics = attrs.demographics || {}
    const name = demographics.name || {}
    
    return {
      pageSize: 'A4',
      pageMargins: [40, 110, 40, 60],
      
      // Header on every page (skip TOC page)
      header: (currentPage, pageCount) => {
        // Don't show header on Table of Contents page
        if (currentPage === 1) {
          return {}
        }
        
        const diagnoses = attrs.diagnoses || []
        
        // Get diagnosis string (code + name if available)
        const diagnosisText = diagnoses.length > 0
          ? diagnoses.map(d => {
              const code = d.attributes?.code || ''
              const dxName = d.attributes?.name || ''
              return dxName ? `${code} (${dxName})` : code
            }).join(', ')
          : 'N/A'
        
        return {
          stack: [
            // Row 1: Patient name, MR, DOB, Page numbers
            {
              columns: [
                {
                  text: `${name.first_name || ''} ${name.last_name || ''}`,
                  style: 'headerText',
                  width: '*'
                },
                {
                  text: `MR: ${attrs.identifiers?.medical_record_number || 'N/A'} | DOB: ${demographics.date_of_birth || 'N/A'}`,
                  style: 'headerText',
                  alignment: 'center',
                  width: 'auto'
                },
                {
                  text: `Page ${currentPage} of ${pageCount}`,
                  style: 'headerText',
                  alignment: 'right',
                  width: 'auto'
                }
              ],
              margin: [0, 0, 0, 3]
            },
            // Row 2: Diagnosis
            {
              text: `Diagnosis: ${diagnosisText}`,
              style: 'headerText',
              width: '*'
            }
          ],
          margin: [40, 20, 40, 5]
        }
      },


      // Document content
      content: [
        ...this.buildTableOfContents(),
        this.buildPatientInformation(),
        this.buildInsuranceSection(),
        this.buildContactsSection(),
        this.buildMedicationsSection(),
        this.buildMARSection(),
        this.buildAssessmentsSection(),
        this.buildGroupSessionsSection(),
        this.buildConsentForms(),
        this.buildEvaluations()
      ],

      // Table of contents
      toc: {
        title: { text: 'Table of Contents', style: 'sectionTitle' }
      },

      // Styles
      styles: {
        headerText: {
          fontSize: 10,
          color: '#666666'
        },
        footerText: {
          fontSize: 9,
          color: '#999999'
        },
        title: {
          fontSize: 18,
          bold: true,
          color: '#2d3748',
          margin: [0, 0, 0, 10]
        },
        sectionTitle: {
          fontSize: 16,
          bold: true,
          color: '#667eea',
          margin: [0, 20, 0, 10]
        },
        subsectionTitle: {
          fontSize: 14,
          bold: true,
          color: '#4a5568',
          margin: [0, 15, 0, 8]
        },
        label: {
          fontSize: 11,
          bold: true,
          color: '#2d3748'
        },
        value: {
          fontSize: 11,
          color: '#4a5568',
          margin: [0, 0, 0, 5]
        },
        formTitle: {
          fontSize: 16,
          bold: true,
          color: '#2d3748',
          margin: [0, 0, 0, 15],
          pageBreak: 'before'
        },
        formField: {
          fontSize: 11,
          margin: [0, 0, 0, 8]
        },
        formLabel: {
          fontSize: 11,
          bold: true,
          color: '#2d3748'
        },
        formValue: {
          fontSize: 11,
          color: '#4a5568',
          margin: [0, 0, 0, 5]
        },
        table: {
          margin: [0, 5, 0, 15]
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          fillColor: '#f0f0f0',
          color: '#333333'
        },
        tableCell: {
          fontSize: 9,
          margin: [3, 3, 3, 3]
        },
        tocTitle: {
          fontSize: 20,
          bold: true,
          color: '#1a202c',
          alignment: 'center'
        },
        tocItem: {
          fontSize: 12,
          margin: [0, 3, 0, 3],
          color: '#2563eb'
        }
      }
    }
  }


  /**
   * Build patient information section
   */
  buildPatientInformation() {
    const attrs = this.patientData.attributes || {}
    const demographics = attrs.demographics || {}
    const name = demographics.name || {}
    const address = demographics.address || {}
    
    return {
      stack: [
        {
          text: 'PATIENT INFORMATION',
          style: 'sectionTitle',
          id: 'patient_info'
        },
        {
          text: 'Demographics',
          style: 'subsectionTitle'
        },
        {
          columns: [
            {
              stack: [
                { text: 'Full Name:', style: 'label' },
                { text: `${name.first_name || ''} ${name.middle_name || ''} ${name.last_name || ''}`, style: 'value' },
                { text: 'Date of Birth:', style: 'label' },
                { text: demographics.date_of_birth || 'N/A', style: 'value' },
                { text: 'Age:', style: 'label' },
                { text: demographics.age || 'N/A', style: 'value' },
                { text: 'Sex:', style: 'label' },
                { text: demographics.sex || 'N/A', style: 'value' },
                { text: 'Gender Identity:', style: 'label' },
                { text: demographics.gender_identity || 'N/A', style: 'value' }
              ],
              width: '50%'
            },
            {
              stack: [
                { text: 'Marital Status:', style: 'label' },
                { text: demographics.marital_status || 'N/A', style: 'value' },
                { text: 'Race:', style: 'label' },
                { text: demographics.race || 'N/A', style: 'value' },
                { text: 'Ethnicity:', style: 'label' },
                { text: demographics.ethnicity || 'N/A', style: 'value' },
                { text: 'Preferred Language:', style: 'label' },
                { text: demographics.preferred_language || 'N/A', style: 'value' },
                { text: 'Occupation:', style: 'label' },
                { text: demographics.occupation || 'N/A', style: 'value' }
              ],
              width: '50%'
            }
          ]
        },
        {
          text: 'Contact Information',
          style: 'subsectionTitle'
        },
        {
          columns: [
            {
              stack: [
                { text: 'Address:', style: 'label' },
                { text: `${address.street || ''} ${address.street2 || ''}`, style: 'value' },
                { text: 'City, State ZIP:', style: 'label' },
                { text: `${address.city || 'N/A'}, ${address.state || 'N/A'} ${address.zip || ''}`, style: 'value' },
                { text: 'Country:', style: 'label' },
                { text: address.country || 'N/A', style: 'value' },
                { text: 'Phone:', style: 'label' },
                { text: demographics.phone || 'N/A', style: 'value' }
              ],
              width: '50%'
            },
            {
              stack: [
                { text: 'Alternate Phone:', style: 'label' },
                { text: demographics.alternate_phone || 'N/A', style: 'value' },
                { text: 'Email:', style: 'label' },
                { text: demographics.email || 'N/A', style: 'value' },
                ...(demographics.employer && demographics.employer.name ? [
                  { text: 'Employer:', style: 'label' },
                  { text: demographics.employer.name, style: 'value' },
                  { text: 'Employer Phone:', style: 'label' },
                  { text: demographics.employer.phone || 'N/A', style: 'value' }
                ] : [])
              ],
              width: '50%'
            }
          ]
        },
        ...this.buildEmergencyContacts(),
        ...this.buildIdentifiers(),
        ...this.buildAllergies()
      ]
    }
  }

  /**
   * Build emergency contacts section
   */
  buildEmergencyContacts() {
    const contacts = this.patientData.attributes?.contacts || []
    
    if (contacts.length === 0) return []
    
    return [
      {
        text: 'Emergency Contacts',
        style: 'subsectionTitle'
      },
      ...contacts.map(contact => ({
        stack: [
          { text: 'Name:', style: 'label' },
          { text: contact.attributes?.name?.full_name || 'N/A', style: 'value' },
          { text: 'Relationship:', style: 'label' },
          { text: contact.attributes?.relationship || 'N/A', style: 'value' },
          { text: 'Contact Type:', style: 'label' },
          { text: contact.attributes?.contact_type || 'N/A', style: 'value' },
          { text: 'Phone:', style: 'label' },
          { text: contact.attributes?.phone || 'N/A', style: 'value' },
          { text: 'Email:', style: 'label' },
          { text: contact.attributes?.email || 'N/A', style: 'value' }
        ],
        margin: [0, 0, 0, 10]
      }))
    ]
  }

  /**
   * Build identifiers section
   */
  buildIdentifiers() {
    const identifiers = this.patientData.attributes?.identifiers
    
    if (!identifiers) return []
    
    return [
      {
        text: 'Identifiers',
        style: 'subsectionTitle'
      },
      {
        columns: [
          {
            stack: [
              { text: 'Medical Record Number:', style: 'label' },
              { text: identifiers.medical_record_number || 'N/A', style: 'value' },
              { text: 'Patient Number:', style: 'label' },
              { text: identifiers.patient_number || 'N/A', style: 'value' }
            ],
            width: '50%'
          },
          {
            stack: [
              { text: 'SSN:', style: 'label' },
              { text: identifiers.ssn || 'N/A', style: 'value' },
              { text: 'CID:', style: 'label' },
              { text: identifiers.cid || 'N/A', style: 'value' }
            ],
            width: '50%'
          }
        ]
      }
    ]
  }

  /**
   * Build allergies section
   */
  buildAllergies() {
    const allergies = this.patientData.attributes?.allergies || []
    
    if (allergies.length === 0) return []
    
    return [
      {
        text: 'Allergies',
        style: 'subsectionTitle'
      },
      ...allergies.map(allergy => {
        const attrs = allergy.attributes || {}
        return {
          stack: [
            { text: 'Allergen:', style: 'label' },
            { text: attrs.allergen || 'N/A', style: 'value' },
            { text: 'Allergy Type:', style: 'label' },
            { text: attrs.allergy_type || 'N/A', style: 'value' },
            { text: 'Reaction:', style: 'label' },
            { text: attrs.reaction || 'N/A', style: 'value' },
            { text: 'Severity:', style: 'label' },
            { text: attrs.severity || 'N/A', style: 'value' },
            { text: 'Status:', style: 'label' },
            { text: attrs.status || 'N/A', style: 'value' }
          ],
          margin: [0, 0, 0, 10]
        }
      })
    ]
  }


  /**
   * Build insurance section
   */
  buildInsuranceSection() {
    const insurances = this.patientData.attributes?.insurances || []
    
    if (insurances.length === 0) return []
    
    return {
      stack: [
        {
          text: 'INSURANCE INFORMATION',
          style: 'sectionTitle',
          pageBreak: 'before',
          id: 'insurance'
        },
        ...insurances.map(insurance => this.buildInsurancePolicy(insurance))
      ]
    }
  }

  /**
   * Build contacts section
   */
  buildContactsSection() {
    const contacts = this.patientData.attributes?.contacts || []
    
    if (contacts.length === 0) return []
    
    return {
      stack: [
        {
          text: 'PATIENT CONTACTS',
          style: 'sectionTitle',
          pageBreak: 'before',
          id: 'contacts'
        },
        ...contacts.map(contact => this.buildContact(contact))
      ]
    }
  }

  /**
   * Build individual contact
   */
  buildContact(contact) {
    const attrs = contact.attributes || {}
    const name = attrs.name || {}
    const address = attrs.address || {}
    
    return {
      stack: [
        {
          text: `${name.first_name || ''} ${name.last_name || ''}`,
          style: 'formTitle'
        },
        {
          columns: [
            {
              stack: [
                { text: 'Relationship:', style: 'formLabel' },
                { text: attrs.relationship || 'N/A', style: 'formValue' },
                { text: 'Contact Type:', style: 'formLabel' },
                { text: attrs.contact_type || 'N/A', style: 'formValue' },
                { text: 'Phone:', style: 'formLabel' },
                { text: attrs.phone || 'N/A', style: 'formValue' },
                { text: 'Alternative Phone:', style: 'formLabel' },
                { text: attrs.alternative_phone || 'N/A', style: 'formValue' }
              ],
              width: '50%'
            },
            {
              stack: [
                { text: 'Email:', style: 'formLabel' },
                { text: attrs.email || 'N/A', style: 'formValue' },
                { text: 'Fax:', style: 'formLabel' },
                { text: attrs.fax_number || 'N/A', style: 'formValue' },
                { text: 'Address:', style: 'formLabel' },
                { text: address.street || 'N/A', style: 'formValue' },
                { text: 'Notes:', style: 'formLabel' },
                { text: attrs.notes || 'N/A', style: 'formValue' }
              ],
              width: '50%'
            }
          ]
        }
      ],
      margin: [0, 0, 0, 15]
    }
  }

  /**
   * Build medications section
   */
  buildMedicationsSection() {
    const medications = this.patientData.attributes?.medications?.ordered || []
    
    if (medications.length === 0) return []
    
    const headers = ['Medication Name', 'Order Type', 'Route', 'PRN', 'Start Date', 'End Date', 'Status', 'Provider']
    const widths = ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto']
    
    const rows = medications.map(medication => {
      const attrs = medication.attributes || {}
      const provider = attrs.ordering_provider || {}
      
      return [
        attrs.medication_name || 'Unnamed Medication',
        attrs.order_type || 'N/A',
        attrs.route || 'N/A',
        attrs.prn ? 'Yes' : 'No',
        attrs.start_date ? new Date(attrs.start_date).toLocaleDateString() : 'N/A',
        attrs.end_date ? new Date(attrs.end_date).toLocaleDateString() : 'N/A',
        attrs.status || 'N/A',
        `${provider.first_name || ''} ${provider.last_name || ''}`.trim() || 'N/A'
      ]
    })
    
    return {
      stack: [
        {
          text: 'MEDICATION ORDERS',
          style: 'sectionTitle',
          pageBreak: 'before',
          id: 'medications'
        },
        this.buildTable(headers, rows, widths),
        // Add justification and warnings as additional information below the table
        ...medications.filter(med => {
          const attrs = med.attributes || {}
          return attrs.justification || attrs.warnings
        }).map(medication => {
          const attrs = medication.attributes || {}
          const sections = []
          
          if (attrs.justification) {
            sections.push({
              text: `${attrs.medication_name || 'Medication'}: ${attrs.justification}`,
              style: 'formValue',
              margin: [0, 2, 0, 2]
            })
          }
          
          if (attrs.warnings) {
            sections.push({
              text: `⚠️ ${attrs.medication_name || 'Medication'}: ${attrs.warnings}`,
              style: 'formValue',
              margin: [0, 2, 0, 2],
              color: '#d32f2f'
            })
          }
          
          return sections
        }).flat()
      ]
    }
  }


  /**
   * Build MAR (Medication Administration Record) section
   */
  buildMARSection() {
    const administered = this.patientData.attributes?.medications?.administered || []
    
    // Filter out entries where administered is null
    const validEntries = administered.filter(entry => entry.attributes?.administered !== null)
    
    if (validEntries.length === 0) return []
    
    // Sort by scheduled time
    const sortedEntries = validEntries.sort((a, b) => {
      const timeA = new Date(a.attributes?.scheduled_time || 0)
      const timeB = new Date(b.attributes?.scheduled_time || 0)
      return timeA - timeB
    })
    
    const headers = ['Medication Name', 'Dose Given', 'Route', 'Scheduled Time', 'Administration Time', 'Administered By']
    const widths = ['*', 'auto', 'auto', 'auto', 'auto', 'auto']
    
    const rows = sortedEntries.map(entry => {
      const attrs = entry.attributes || {}
      return [
        attrs.medication_name || 'N/A',
        attrs.dose_given || 'N/A',
        attrs.route || 'N/A',
        attrs.scheduled_time ? new Date(attrs.scheduled_time).toLocaleString() : 'N/A',
        attrs.administration_time ? new Date(attrs.administration_time).toLocaleString() : 'Not Administered',
        attrs.administered_by || 'N/A'
      ]
    })
    
    return {
      stack: [
        {
          text: 'MEDICATION ADMINISTRATION RECORD (MAR)',
          style: 'sectionTitle',
          pageBreak: 'before',
          id: 'mar'
        },
        this.buildTable(headers, rows, widths)
      ]
    }
  }

  /**
   * Build assessments section
   */
  buildAssessmentsSection() {
    const assessments = this.patientData.attributes?.integrated_assessments || []
    
    // Filter out empty assessments
    const validAssessments = assessments.filter(assessment => assessment.attributes?.status !== 'empty')
    
    if (validAssessments.length === 0) return []
    
    // Group assessments by type
    const groupedAssessments = validAssessments.reduce((groups, assessment) => {
      const type = assessment.type
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(assessment)
      return groups
    }, {})
    
    const sections = []
    
    // Build table for each assessment type
    Object.entries(groupedAssessments).forEach(([type, typeAssessments]) => {
      switch (type) {
        case 'vital_signs':
          sections.push(this.buildVitalSignsTable(typeAssessments))
          break
        case 'glucose':
          sections.push(this.buildGlucoseTable(typeAssessments))
          break
        case 'orthostatic_vitals':
          sections.push(this.buildOrthostaticVitalsTable(typeAssessments))
          break
        case 'ciwa_ar':
          sections.push(this.buildCIWAARTable(typeAssessments))
          break
        case 'ciwa_b':
          sections.push(this.buildCIWABTable(typeAssessments))
          break
        case 'cows':
          sections.push(this.buildCOWSTable(typeAssessments))
          break
        case 'weight':
        case 'height':
          // Handle height and weight together
          if (!sections.find(s => s.text === 'Height & Weight')) {
            const heightAssessments = groupedAssessments.height || []
            const weightAssessments = groupedAssessments.weight || []
            sections.push(this.buildHeightWeightTable(heightAssessments, weightAssessments))
          }
          break
      }
    })
    
    if (sections.length === 0) return []
    
    return {
      stack: [
        {
          text: 'INTEGRATED ASSESSMENTS',
          style: 'sectionTitle',
          pageBreak: 'before',
          id: 'assessments'
        },
        ...sections
      ]
    }
  }

  /**
   * Build vital signs table
   */
  buildVitalSignsTable(assessments) {
    const headers = ['Timestamp', 'BP Systolic', 'BP Diastolic', 'Temp', 'Pulse', 'Resp', 'O2 Sat', 'Recorded By']
    const widths = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*']
    
    const rows = assessments.map(assessment => {
      const attrs = assessment.attributes || {}
      return [
        attrs.timestamp ? new Date(attrs.timestamp).toLocaleString() : 'N/A',
        attrs.blood_pressure_systolic || 'N/A',
        attrs.blood_pressure_diastolic || 'N/A',
        attrs.temperature || 'N/A',
        attrs.pulse || 'N/A',
        attrs.respirations || 'N/A',
        attrs.o2_saturation || 'N/A',
        attrs.recorded_by || 'N/A'
      ]
    })
    
    return {
      stack: [
        { text: 'Vital Signs', style: 'subsectionTitle' },
        this.buildTable(headers, rows, widths)
      ]
    }
  }

  /**
   * Build glucose table
   */
  buildGlucoseTable(assessments) {
    const headers = ['Timestamp', 'Reading', 'Type of Check', 'Intervention', 'Note', 'Recorded By']
    const widths = ['auto', 'auto', 'auto', '*', '*', '*']
    
    const rows = assessments.map(assessment => {
      const attrs = assessment.attributes || {}
      return [
        attrs.timestamp ? new Date(attrs.timestamp).toLocaleString() : 'N/A',
        attrs.reading || 'N/A',
        attrs.type_of_check || 'N/A',
        Array.isArray(attrs.intervention) ? attrs.intervention.join(', ') : (attrs.intervention || 'N/A'),
        attrs.note || 'N/A',
        attrs.recorded_by || 'N/A'
      ]
    })
    
    return {
      stack: [
        { text: 'Glucose', style: 'subsectionTitle' },
        this.buildTable(headers, rows, widths)
      ]
    }
  }

  /**
   * Build orthostatic vitals table
   */
  buildOrthostaticVitalsTable(assessments) {
    const headers = ['Timestamp', 'BP Lying', 'BP Sitting', 'BP Standing', 'Pulse Lying', 'Pulse Sitting', 'Pulse Standing', 'Temp', 'Recorded By']
    const widths = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*']
    
    const rows = assessments.map(assessment => {
      const attrs = assessment.attributes || {}
      return [
        attrs.timestamp ? new Date(attrs.timestamp).toLocaleString() : 'N/A',
        `${attrs.blood_pressure_systolic_lying || 'N/A'}/${attrs.blood_pressure_diastolic_lying || 'N/A'}`,
        `${attrs.blood_pressure_systolic_sitting || 'N/A'}/${attrs.blood_pressure_diastolic_sitting || 'N/A'}`,
        `${attrs.blood_pressure_systolic_standing || 'N/A'}/${attrs.blood_pressure_diastolic_standing || 'N/A'}`,
        attrs.pulse_lying || 'N/A',
        attrs.pulse_sitting || 'N/A',
        attrs.pulse_standing || 'N/A',
        attrs.temperature || 'N/A',
        attrs.recorded_by || 'N/A'
      ]
    })
    
    return {
      stack: [
        { text: 'Orthostatic Vitals', style: 'subsectionTitle' },
        this.buildTable(headers, rows, widths)
      ]
    }
  }

  /**
   * Build CIWA-AR table
   */
  buildCIWAARTable(assessments) {
    const headers = ['Timestamp', 'Total Score', 'Nausea', 'Tremor', 'Sweats', 'Anxiety', 'Agitation', 'Tactile', 'Auditory', 'Visual', 'Headache', 'Sensorium', 'Status', 'Recorded By']
    const widths = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*']
    
    const rows = assessments.map(assessment => {
      const attrs = assessment.attributes || {}
      return [
        attrs.timestamp ? new Date(attrs.timestamp).toLocaleString() : 'N/A',
        attrs.total_score || 'N/A',
        attrs.nausea || 'N/A',
        attrs.tremor || 'N/A',
        attrs.paroxysmal_sweats || 'N/A',
        attrs.anxiety || 'N/A',
        attrs.agitation || 'N/A',
        attrs.tactile_disturbances || 'N/A',
        attrs.auditory_disturbances || 'N/A',
        attrs.visual_disturbances || 'N/A',
        attrs.headache || 'N/A',
        attrs.clouding_of_sensorium || 'N/A',
        attrs.status || 'N/A',
        attrs.recorded_by || 'N/A'
      ]
    })
    
    return {
      stack: [
        { text: 'CIWA-AR', style: 'subsectionTitle' },
        this.buildTable(headers, rows, widths)
      ]
    }
  }

  /**
   * Build CIWA-B table
   */
  buildCIWABTable(assessments) {
    const headers = ['Timestamp', 'Total Score', 'Anxiety', 'Tremors', 'Sweating', 'Weakness', 'Muscle Ache', 'Head Ache', 'Visual', 'Sleep', 'Appetite', 'Status', 'Recorded By']
    const widths = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*']
    
    const rows = assessments.map(assessment => {
      const attrs = assessment.attributes || {}
      return [
        attrs.timestamp ? new Date(attrs.timestamp).toLocaleString() : 'N/A',
        attrs.total_score || 'N/A',
        attrs.anxiety || 'N/A',
        attrs.tremors || 'N/A',
        attrs.sweating_agitation || 'N/A',
        attrs.weakness || 'N/A',
        attrs.muscle_ache || 'N/A',
        attrs.head_full_achy || 'N/A',
        attrs.visual_disturbances || 'N/A',
        attrs.restful_sleep || 'N/A',
        attrs.loss_of_appetite || 'N/A',
        attrs.status || 'N/A',
        attrs.recorded_by || 'N/A'
      ]
    })
    
    return {
      stack: [
        { text: 'CIWA-B', style: 'subsectionTitle' },
        this.buildTable(headers, rows, widths)
      ]
    }
  }

  /**
   * Build COWS table
   */
  buildCOWSTable(assessments) {
    const headers = ['Timestamp', 'Total Score', 'Pulse Rate', 'Sweating', 'Restlessness', 'Pupil Size', 'Bone/Joint Ache', 'Runny Nose', 'GI Upset', 'Tremor', 'Yawning', 'Anxiety/Irritability', 'Gooseflesh', 'Status', 'Recorded By']
    const widths = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*']
    
    const rows = assessments.map(assessment => {
      const attrs = assessment.attributes || {}
      return [
        attrs.timestamp ? new Date(attrs.timestamp).toLocaleString() : 'N/A',
        attrs.total_score || 'N/A',
        attrs.pulse_rate || 'N/A',
        attrs.sweating || 'N/A',
        attrs.restlessness || 'N/A',
        attrs.pupil_size || 'N/A',
        attrs.bone_joint_ache || 'N/A',
        attrs.runny_nose || 'N/A',
        attrs.gi_upset || 'N/A',
        attrs.tremor || 'N/A',
        attrs.yawning || 'N/A',
        attrs.anxiety_irritability || 'N/A',
        attrs.gooseflesh_skin || 'N/A',
        attrs.status || 'N/A',
        attrs.recorded_by || 'N/A'
      ]
    })
    
    return {
      stack: [
        { text: 'COWS', style: 'subsectionTitle' },
        this.buildTable(headers, rows, widths)
      ]
    }
  }

  /**
   * Build height and weight table
   */
  buildHeightWeightTable(heightAssessments, weightAssessments) {
    const headers = ['Timestamp', 'Height', 'Weight']
    const widths = ['auto', 'auto', 'auto']
    
    // Combine height and weight data by timestamp
    const combinedData = new Map()
    
    heightAssessments.forEach(assessment => {
      const attrs = assessment.attributes || {}
      const timestamp = attrs.timestamp
      if (timestamp) {
        if (!combinedData.has(timestamp)) {
          combinedData.set(timestamp, { timestamp, height: null, weight: null })
        }
        combinedData.get(timestamp).height = `${attrs.value || 'N/A'} ${attrs.unit || ''}`
      }
    })
    
    weightAssessments.forEach(assessment => {
      const attrs = assessment.attributes || {}
      const timestamp = attrs.timestamp
      if (timestamp) {
        if (!combinedData.has(timestamp)) {
          combinedData.set(timestamp, { timestamp, height: null, weight: null })
        }
        combinedData.get(timestamp).weight = `${attrs.value || 'N/A'} ${attrs.unit || ''}`
      }
    })
    
    const rows = Array.from(combinedData.values())
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(data => [
        new Date(data.timestamp).toLocaleString(),
        data.height || 'N/A',
        data.weight || 'N/A'
      ])
    
    return {
      stack: [
        { text: 'Height & Weight', style: 'subsectionTitle' },
        this.buildTable(headers, rows, widths)
      ]
    }
  }

  /**
   * Build group sessions section
   */
  buildGroupSessionsSection() {
    const groupSessions = this.patientData.attributes?.group_sessions || []
    
    if (groupSessions.length === 0) return []
    
    return {
      stack: [
        {
          text: 'GROUP SESSIONS',
          style: 'sectionTitle',
          pageBreak: 'before',
          id: 'group_sessions'
        },
        ...groupSessions.map(session => this.buildGroupSession(session))
      ]
    }
  }

  /**
   * Build individual group session
   */
  buildGroupSession(session) {
    const attrs = session.attributes || {}
    const leader = attrs.group_session_leader || {}
    
    return {
      stack: [
        {
          text: attrs.session_title || 'Unnamed Session',
          style: 'formTitle'
        },
        {
          columns: [
            {
              stack: [
                { text: 'Start Time:', style: 'formLabel' },
                { text: attrs.session_start_time ? new Date(attrs.session_start_time).toLocaleString() : 'N/A', style: 'formValue' },
                { text: 'End Time:', style: 'formLabel' },
                { text: attrs.session_end_time ? new Date(attrs.session_end_time).toLocaleString() : 'N/A', style: 'formValue' },
                { text: 'Duration:', style: 'formLabel' },
                { text: attrs.duration_display || 'N/A', style: 'formValue' },
                { text: 'Attendance Status:', style: 'formLabel' },
                { text: attrs.attendance_status || 'N/A', style: 'formValue' }
              ],
              width: '50%'
            },
            {
              stack: [
                { text: 'Present:', style: 'formLabel' },
                { text: attrs.present ? 'Yes' : 'No', style: 'formValue' },
                { text: 'Completed:', style: 'formLabel' },
                { text: attrs.completed ? 'Yes' : 'No', style: 'formValue' },
                { text: 'Date Completed:', style: 'formLabel' },
                { text: attrs.date_completed ? new Date(attrs.date_completed).toLocaleDateString() : 'N/A', style: 'formValue' },
                { text: 'Billable:', style: 'formLabel' },
                { text: attrs.billable ? 'Yes' : 'No', style: 'formValue' }
              ],
              width: '50%'
            }
          ]
        },
        ...(attrs.personal_notes ? [
          { text: 'Personal Notes:', style: 'formLabel' },
          { text: attrs.personal_notes, style: 'formValue' }
        ] : []),
        ...(leader.group_session_topic ? [
          { text: 'Session Topic:', style: 'formLabel' },
          { text: leader.group_session_topic, style: 'formValue' }
        ] : []),
        ...(leader.group_session_notes ? [
          { text: 'Session Notes:', style: 'formLabel' },
          { text: leader.group_session_notes, style: 'formValue' }
        ] : [])
      ],
      margin: [0, 0, 0, 15]
    }
  }

  /**
   * Build individual insurance policy
   */
  buildInsurancePolicy(insurance) {
    const attrs = insurance.attributes || {}
    const subscriber = attrs.subscriber || {}
    const subscriberAddress = subscriber.address || {}
    
    return {
      stack: [
        {
          text: `Insurance Policy - ${attrs.insurance_company || 'Unknown Company'}`,
          style: 'subsectionTitle'
        },
        {
          columns: [
            {
              stack: [
                { text: 'Insurance Company:', style: 'label' },
                { text: attrs.insurance_company || 'N/A', style: 'value' },
                { text: 'Policy Number:', style: 'label' },
                { text: attrs.policy_number || 'N/A', style: 'value' },
                { text: 'Group ID:', style: 'label' },
                { text: attrs.group_id || 'N/A', style: 'value' },
                { text: 'Status:', style: 'label' },
                { text: attrs.status || 'N/A', style: 'value' }
              ],
              width: '50%'
            },
            {
              stack: [
                { text: 'Effective Date:', style: 'label' },
                { text: attrs.effective_date || 'N/A', style: 'value' },
                { text: 'Termination Date:', style: 'label' },
                { text: attrs.termination_date || 'N/A', style: 'value' },
                { text: 'Insurance Type:', style: 'label' },
                { text: attrs.insurance_type || 'N/A', style: 'value' },
                { text: 'Payer ID:', style: 'label' },
                { text: attrs.ext_payor_id || 'N/A', style: 'value' }
              ],
              width: '50%'
            }
          ]
        },
        {
          text: 'Subscriber Information',
          style: 'label',
          margin: [0, 15, 0, 8]
        },
        {
          columns: [
            {
              stack: [
                { text: 'Name:', style: 'label' },
                { text: `${subscriber.first_name || ''} ${subscriber.last_name || ''}`, style: 'value' },
                { text: 'Relationship:', style: 'label' },
                { text: subscriber.relationship || 'N/A', style: 'value' },
                { text: 'Date of Birth:', style: 'label' },
                { text: subscriber.date_of_birth || 'N/A', style: 'value' },
                { text: 'Gender:', style: 'label' },
                { text: subscriber.gender || 'N/A', style: 'value' }
              ],
              width: '50%'
            },
            {
              stack: [
                { text: 'Address:', style: 'label' },
                { text: `${subscriberAddress.street || ''} ${subscriberAddress.street2 || ''}`, style: 'value' },
                { text: 'City, State ZIP:', style: 'label' },
                { text: `${subscriberAddress.city || 'N/A'}, ${subscriberAddress.state || 'N/A'} ${subscriberAddress.zip || ''}`, style: 'value' },
                { text: 'Employer:', style: 'label' },
                { text: subscriber.employer || 'N/A', style: 'value' }
              ],
              width: '50%'
            }
          ]
        }
      ]
    }
  }

  /**
   * Build consent forms section
   */
  buildConsentForms() {
    const consentForms = this.patientData.attributes?.consent_forms || []
    
    if (consentForms.length === 0) return []
    
    return consentForms.map((form, index) => 
      this.buildConsentForm(form, index === 0)
    )
  }

  /**
   * Build individual consent form
   */
  buildConsentForm(consent, isFirst) {
    const attrs = consent.attributes || {}
    
    return {
      stack: [
        {
          text: attrs.consent_form_name || 'Consent Form',
          style: 'sectionTitle',
          pageBreak: 'before',
          id: `consent_${consent.id}`
        },
        {
          columns: [
            {
              stack: [
                { text: 'Form Name:', style: 'formLabel' },
                { text: attrs.consent_form_name || 'N/A', style: 'formValue' },
                { text: 'Form Type:', style: 'formLabel' },
                { text: attrs.consent_form_type || 'N/A', style: 'formValue' },
                { text: 'Status:', style: 'formLabel' },
                { text: attrs.status || 'N/A', style: 'formValue' }
              ],
              width: '50%'
            },
            {
              stack: [
                { text: 'Signed:', style: 'formLabel' },
                { text: attrs.signed ? 'Yes' : 'No', style: 'formValue' },
                { text: 'Signed By:', style: 'formLabel' },
                { text: attrs.signed_by || 'N/A', style: 'formValue' },
                { text: 'Signed At:', style: 'formLabel' },
                { text: attrs.signed_at ? new Date(attrs.signed_at).toLocaleString() : 'N/A', style: 'formValue' }
              ],
              width: '50%'
            }
          ]
        },
        ...(attrs.content ? [
          {
            text: 'Content:',
            style: 'formLabel',
            margin: [0, 10, 0, 5]
          },
          ...this.parseConsentFormContent(attrs.content)
        ] : [])
      ]
    }
  }

  /**
   * Build evaluations section
   */
  buildEvaluations() {
    const evaluations = this.patientData.attributes?.patient_evaluations || []
    
    if (evaluations.length === 0) return []
    
    return evaluations.map((evaluation, index) => 
      this.buildEvaluation(evaluation, index === 0)
    )
  }

  /**
   * Build individual evaluation
   */
  buildEvaluation(evaluation, isFirst) {
    const attrs = evaluation.attributes || {}
    const items = attrs.items || []
    
    return {
      stack: [
        {
          text: attrs.evaluation_name || 'Patient Evaluation',
          style: 'sectionTitle',
          pageBreak: 'before',
          id: `evaluation_${evaluation.id}`
        },
        {
          columns: [
            {
              stack: [
                { text: 'Evaluation Name:', style: 'formLabel' },
                { text: attrs.evaluation_name || 'N/A', style: 'formValue' },
                { text: 'Date:', style: 'formLabel' },
                { text: attrs.evaluation_date ? new Date(attrs.evaluation_date).toLocaleString() : 'N/A', style: 'formValue' },
                { text: 'Status:', style: 'formLabel' },
                { text: attrs.status || 'N/A', style: 'formValue' }
              ],
              width: '50%'
            },
            {
              stack: [
                { text: 'Complete:', style: 'formLabel' },
                { text: attrs.complete ? 'Yes' : 'No', style: 'formValue' },
                { text: 'Tab Name:', style: 'formLabel' },
                { text: attrs.tab_name || 'N/A', style: 'formValue' },
                { text: 'Items Count:', style: 'formLabel' },
                { text: items.length.toString(), style: 'formValue' }
              ],
              width: '50%'
            }
          ]
        },
        {
          text: 'Evaluation Items',
          style: 'formLabel',
          margin: [0, 15, 0, 8]
        },
        ...this.buildEvaluationItems(items)
      ]
    }
  }

  /**
   * Build evaluation items
   */
  buildEvaluationItems(items) {
    return items.map(item => {
      const attrs = item.attributes || {}
      const content = this.formatFieldContent(attrs)
      const label = this.stripHtml(attrs.label || attrs.field_type || 'Unlabeled Field')
      
      return {
        stack: [
          {
            text: label,
            style: 'formLabel'
          },
          {
            text: content,
            style: 'formValue'
          }
        ],
        margin: [0, 0, 0, 8]
      }
    })
  }

  /**
   * Format field content for display
   */
  formatFieldContent(field) {
    const content = field.content
    const fieldType = field.field_type

    if (content === null || content === undefined) {
      return 'Not provided'
    }

    if (Array.isArray(content)) {
      if (content.length === 0) {
        return 'None'
      }
      return content.map(item => {
        if (typeof item === 'object') {
          return JSON.stringify(item, null, 2)
        }
        return this.stripHtml(item.toString())
      }).join(', ')
    }

    if (typeof content === 'object') {
      // Handle complex objects
      if (content.bed_name) {
        return content.bed_name
      }
      if (content.name) {
        return content.name
      }
      return JSON.stringify(content, null, 2)
    }

    if (typeof content === 'string') {
      // Handle dates
      if (fieldType && (fieldType.includes('date') || fieldType.includes('time'))) {
        try {
          return new Date(content).toLocaleString()
        } catch (e) {
          return this.stripHtml(content)
        }
      }
      return this.stripHtml(content)
    }

    return this.stripHtml(content.toString())
  }

  /**
   * Strip HTML tags and convert to plain text
   */
  stripHtml(html) {
    if (!html || typeof html !== 'string') {
      return html
    }
    
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '')
    
    // Decode common HTML entities
    text = text.replace(/&nbsp;/g, ' ')
    text = text.replace(/&amp;/g, '&')
    text = text.replace(/&lt;/g, '<')
    text = text.replace(/&gt;/g, '>')
    text = text.replace(/&quot;/g, '"')
    text = text.replace(/&#39;/g, "'")
    text = text.replace(/&apos;/g, "'")
    
    // Clean up extra whitespace
    text = text.replace(/\s+/g, ' ').trim()
    
    return text
  }

  /**
   * Parse consent form HTML content into pdfmake format
   */
  parseConsentFormContent(html) {
    if (!html || typeof html !== 'string') {
      return [{ text: 'No content available', style: 'formValue' }]
    }

    const elements = []
    
    // Split by common HTML block elements
    const blocks = html.split(/(<\/?(?:h[1-6]|p|div|br|center)[^>]*>)/i)
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i].trim()
      if (!block) continue
      
      // Handle headings
      if (block.match(/^<h[1-6][^>]*>/i)) {
        const text = this.stripHtml(blocks[i + 1] || '')
        if (text) {
          elements.push({
            text: text,
            style: 'subsectionTitle',
            margin: [0, 10, 0, 5]
          })
        }
        i++ // Skip the content after the opening tag
      }
      // Handle paragraphs and divs
      else if (block.match(/^<(p|div)[^>]*>/i)) {
        const text = this.stripHtml(blocks[i + 1] || '')
        if (text) {
          elements.push({
            text: text,
            style: 'formValue',
            margin: [0, 5, 0, 5]
          })
        }
        i++ // Skip the content after the opening tag
      }
      // Handle center tags
      else if (block.match(/^<center[^>]*>/i)) {
        const text = this.stripHtml(blocks[i + 1] || '')
        if (text) {
          elements.push({
            text: text,
            style: 'formValue',
            alignment: 'center',
            margin: [0, 5, 0, 5]
          })
        }
        i++ // Skip the content after the opening tag
      }
      // Handle line breaks
      else if (block.match(/^<br[^>]*>$/i)) {
        elements.push({ text: '', margin: [0, 5, 0, 0] })
      }
      // Handle closing tags - skip them
      else if (block.match(/^<\/(h[1-6]|p|div|center)>$/i)) {
        continue
      }
      // Handle plain text
      else if (!block.match(/^<[^>]*>$/)) {
        const text = this.stripHtml(block)
        if (text) {
          elements.push({
            text: text,
            style: 'formValue',
            margin: [0, 2, 0, 2]
          })
        }
      }
    }
    
    // If no elements were parsed, fall back to stripped text
    if (elements.length === 0) {
      elements.push({
        text: this.stripHtml(html),
        style: 'formValue'
      })
    }
    
    return elements
  }

  /**
   * Helper method to create standardized tables
   * @param {Array} headers - Array of header strings
   * @param {Array} rows - Array of row arrays
   * @param {Array} widths - Array of column widths
   * @returns {Object} pdfmake table object
   */
  buildTable(headers, rows, widths) {
    const headerRow = headers.map(header => ({
      text: header,
      style: 'tableHeader'
    }))
    
    const bodyRows = rows.map(row => 
      row.map(cell => ({
        text: cell || 'N/A',
        style: 'tableCell'
      }))
    )
    
    return {
      table: {
        headerRows: 1,
        widths: widths,
        body: [headerRow, ...bodyRows]
      },
      style: 'table'
    }
  }
}

/**
 * Convenience function to generate PDF from patient data
 * @param {Object} patientData - Patient JSON data
 * @returns {Promise<Blob>} - PDF blob
 */
export async function generateMedicalRecordPDF(patientData) {
  const generator = new MedicalRecordPDFGenerator()
  return await generator.generatePDF(patientData)
}

