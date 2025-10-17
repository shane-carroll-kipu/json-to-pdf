<template>
  <div class="pdf-container" :style="cssVariables">
    <PdfTableOfContents :patientData="patientData" />
    <PdfPatientInfo :patientData="patientData" />
    <PdfInsurance :insurances="patientData.attributes?.insurances" v-if="hasInsurance" />
    <PdfContacts :contacts="patientData.attributes?.contacts" v-if="hasContacts" />
    <PdfMedications :medications="patientData.attributes?.medications?.ordered" v-if="hasMedications" />
    <PdfMAR :administrations="patientData.attributes?.medications?.administered" v-if="hasMAR" />
    <PdfAssessments :assessments="patientData.attributes?.integrated_assessments" v-if="hasAssessments" />
    <PdfGroupSessions :sessions="patientData.attributes?.group_sessions" v-if="hasGroupSessions" />
    <PdfConsentForms :forms="patientData.attributes?.consent_forms" v-if="hasConsentForms" />
    <PdfEvaluations :evaluations="patientData.attributes?.patient_evaluations" v-if="hasEvaluations" />
  </div>
</template>

<script>
import PdfTableOfContents from './pdf/PdfTableOfContents.vue'
import PdfPatientInfo from './pdf/PdfPatientInfo.vue'
import PdfInsurance from './pdf/PdfInsurance.vue'
import PdfContacts from './pdf/PdfContacts.vue'
import PdfMedications from './pdf/PdfMedications.vue'
import PdfMAR from './pdf/PdfMAR.vue'
import PdfAssessments from './pdf/PdfAssessments.vue'
import PdfGroupSessions from './pdf/PdfGroupSessions.vue'
import PdfConsentForms from './pdf/PdfConsentForms.vue'
import PdfEvaluations from './pdf/PdfEvaluations.vue'

export default {
  name: 'PdfTemplate',
  components: {
    PdfTableOfContents,
    PdfPatientInfo,
    PdfInsurance,
    PdfContacts,
    PdfMedications,
    PdfMAR,
    PdfAssessments,
    PdfGroupSessions,
    PdfConsentForms,
    PdfEvaluations
  },
  props: {
    patientData: {
      type: Object,
      required: true
    }
  },
  computed: {
    attrs() {
      return this.patientData.attributes || {}
    },
    demographics() {
      return this.attrs.demographics || {}
    },
    name() {
      return this.demographics.name || {}
    },
    identifiers() {
      return this.attrs.identifiers || {}
    },
    diagnoses() {
      return this.attrs.diagnoses || []
    },
    // Computed properties for conditional rendering
    hasInsurance() {
      return this.attrs.insurances && this.attrs.insurances.length > 0
    },
    hasContacts() {
      return this.attrs.contacts && this.attrs.contacts.length > 0
    },
    hasMedications() {
      return this.attrs.medications?.ordered && this.attrs.medications.ordered.length > 0
    },
    hasMAR() {
      const administered = this.attrs.medications?.administered || []
      return administered.filter(entry => entry.attributes?.administered !== null).length > 0
    },
    hasAssessments() {
      const assessments = this.attrs.integrated_assessments || []
      return assessments.filter(a => a.attributes?.status !== 'empty').length > 0
    },
    hasGroupSessions() {
      return this.attrs.group_sessions && this.attrs.group_sessions.length > 0
    },
    hasConsentForms() {
      return this.attrs.consent_forms && this.attrs.consent_forms.length > 0
    },
    hasEvaluations() {
      return this.attrs.patient_evaluations && this.attrs.patient_evaluations.length > 0
    },
    // CSS variables for @page rules
    cssVariables() {
      const patientName = `${this.name.first_name || ''} ${this.name.last_name || ''}`.trim()
      const mrNumber = this.identifiers.medical_record_number || 'N/A'
      const dob = this.demographics.date_of_birth || 'N/A'
      
      // Format diagnosis
      const diagnosisText = this.diagnoses.length > 0
        ? this.diagnoses.map(d => {
            const code = d.attributes?.code || ''
            const dxName = d.attributes?.name || ''
            return dxName ? `${code} (${dxName})` : code
          }).join(', ')
        : 'N/A'
      
      return {
        '--patient-name': `"${patientName}"`,
        '--mr-number': `"${mrNumber}"`,
        '--dob': `"${dob}"`,
        '--diagnosis': `"${diagnosisText}"`
      }
    }
  }
}
</script>

<style>
/* Import print styles */
@import '../styles/print.css';
</style>

