<template>
  <div class="toc-section page-break-after">
    <h1 class="toc-title">Table of Contents</h1>
    
    <div class="toc-items">
      <!-- Patient Information -->
      <div class="toc-entry" data-toc-target="patient-info">
        <span class="toc-title">Patient Information</span>
        <span class="toc-dots"></span>
        <span class="toc-pages"></span>
      </div>
      
      <!-- Insurance Information -->
      <div v-if="hasInsurance" class="toc-entry" data-toc-target="insurance">
        <span class="toc-title">Insurance Information</span>
        <span class="toc-dots"></span>
        <span class="toc-pages"></span>
      </div>
      
      <!-- Patient Contacts -->
      <div v-if="hasContacts" class="toc-entry" data-toc-target="contacts">
        <span class="toc-title">Patient Contacts</span>
        <span class="toc-dots"></span>
        <span class="toc-pages"></span>
      </div>
      
      <!-- Medication Orders -->
      <div v-if="hasMedications" class="toc-entry" data-toc-target="medications">
        <span class="toc-title">Medication Orders</span>
        <span class="toc-dots"></span>
        <span class="toc-pages"></span>
      </div>
      
      <!-- MAR -->
      <div v-if="hasMAR" class="toc-entry" data-toc-target="mar">
        <span class="toc-title">Medication Administration Record (MAR)</span>
        <span class="toc-dots"></span>
        <span class="toc-pages"></span>
      </div>
      
      <!-- Integrated Assessments -->
      <div v-if="hasAssessments" class="toc-entry" data-toc-target="assessments">
        <span class="toc-title">Integrated Assessments</span>
        <span class="toc-dots"></span>
        <span class="toc-pages"></span>
      </div>
      
      <!-- Group Sessions -->
      <div v-if="hasGroupSessions" class="toc-entry" data-toc-target="group-sessions">
        <span class="toc-title">Group Sessions</span>
        <span class="toc-dots"></span>
        <span class="toc-pages"></span>
      </div>
      
      <!-- Consent Forms -->
      <template v-if="hasConsentForms">
        <div class="toc-section-header">Consent Forms</div>
        <div
          v-for="form in consentForms"
          :key="form.id"
          class="toc-entry toc-subitem"
          :data-toc-target="`consent-${form.id}`"
        >
          <span class="toc-title">• {{ form.attributes?.consent_form_name || 'Consent Form' }}</span>
          <span class="toc-dots"></span>
          <span class="toc-pages"></span>
        </div>
      </template>
      
      <!-- Patient Evaluations -->
      <template v-if="hasEvaluations">
        <div class="toc-section-header">Patient Evaluations</div>
        <div
          v-for="evaluation in evaluations"
          :key="evaluation.id"
          class="toc-entry toc-subitem"
          :data-toc-target="`evaluation-${evaluation.id}`"
        >
          <span class="toc-title">• {{ evaluation.attributes?.evaluation_name || 'Patient Evaluation' }}</span>
          <span class="toc-dots"></span>
          <span class="toc-pages"></span>
        </div>
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
