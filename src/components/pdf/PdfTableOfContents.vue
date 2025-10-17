<template>
  <div class="toc-section page-break-after">
    <h1 class="toc-title">Table of Contents</h1>
    
    <div class="toc-items">
      <a href="#patient-info" class="toc-item">Patient Information</a>
      
      <a href="#insurance" class="toc-item" v-if="hasInsurance">Insurance Information</a>
      
      <a href="#contacts" class="toc-item" v-if="hasContacts">Patient Contacts</a>
      
      <a href="#medications" class="toc-item" v-if="hasMedications">Medication Orders</a>
      
      <a href="#mar" class="toc-item" v-if="hasMAR">Medication Administration Record (MAR)</a>
      
      <a href="#assessments" class="toc-item" v-if="hasAssessments">Integrated Assessments</a>
      
      <a href="#group-sessions" class="toc-item" v-if="hasGroupSessions">Group Sessions</a>
      
      <template v-if="hasConsentForms">
        <div class="toc-item" style="font-weight: bold; margin-top: 12pt; color: #000;">Consent Forms</div>
        <a
          v-for="form in consentForms"
          :key="form.id"
          :href="`#consent-${form.id}`"
          class="toc-item"
          style="margin-left: 20pt;"
        >
          • {{ form.attributes?.consent_form_name || 'Consent Form' }}
        </a>
      </template>
      
      <template v-if="hasEvaluations">
        <div class="toc-item" style="font-weight: bold; margin-top: 12pt; color: #000;">Patient Evaluations</div>
        <a
          v-for="evaluation in evaluations"
          :key="evaluation.id"
          :href="`#evaluation-${evaluation.id}`"
          class="toc-item"
          style="margin-left: 20pt;"
        >
          • {{ evaluation.attributes?.evaluation_name || 'Patient Evaluation' }}
        </a>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PdfTableOfContents',
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
    consentForms() {
      return this.attrs.consent_forms || []
    },
    evaluations() {
      return this.attrs.patient_evaluations || []
    }
  }
}
</script>

