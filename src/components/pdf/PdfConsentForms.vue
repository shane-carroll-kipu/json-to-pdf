<template>
  <div
    v-for="(form, index) in forms"
    :key="form.id"
    class="consent-section page-break-before"
    :id="`consent-${form.id}`"
  >
      <a :id="`consent-${form.id}-start`"></a>
      <h1 class="section-title">{{ form.attributes?.consent_form_name || 'Consent Form' }}</h1>
      
      <div v-if="form.attributes?.content">
        <div class="value" v-html="form.attributes.content"></div>
      </div>
      
      <!-- Signatures Section -->
      <div v-if="hasSignatures(form)" style="margin-top: 30pt; border-top: 1pt solid #ccc; padding-top: 10pt;">
        <div v-if="form.attributes?.signature_user_name && form.attributes?.signature_timestamp" style="margin-bottom: 8pt;">
          Electronically signed by {{ form.attributes.signature_user_name }} on {{ formatDateTime(form.attributes.signature_timestamp) }}
        </div>
        <div v-if="form.attributes?.staff_signature" style="margin-bottom: 8pt;">
          Staff signature on file
        </div>
        <div v-if="form.attributes?.guardian_signature_required" style="margin-bottom: 8pt;">
          Guardian signature required
        </div>
      </div>
      
      <!-- Section end marker for page range detection -->
      <a :id="`consent-${form.id}-end`"></a>
      <div class="section-end-marker" :data-section-end="`consent-${form.id}`"></div>
  </div>
</template>

<script>
export default {
  name: 'PdfConsentForms',
  props: {
    forms: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatDateTime(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString()
    },
    hasSignatures(form) {
      const attrs = form.attributes || {}
      return !!(
        (attrs.signature_user_name && attrs.signature_timestamp) ||
        attrs.staff_signature ||
        attrs.guardian_signature_required
      )
    }
  }
}
</script>

