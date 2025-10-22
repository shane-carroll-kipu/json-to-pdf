<template>
  <div
    v-for="(form, index) in forms"
    :key="form.id"
    class="consent-section page-break-before"
    :id="`consent-${form.id}`"
  >
      <a :id="`consent-${form.id}-start`"></a>
      <h1 class="section-title">{{ form.attributes?.consent_form_name || 'Consent Form' }}</h1>
      
      <div class="two-column">
        <div>
          <div class="field-group">
            <div class="label">Form Name:</div>
            <div class="value">{{ form.attributes?.consent_form_name || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Status:</div>
            <div class="value">{{ form.attributes?.status || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Signed Date:</div>
            <div class="value">{{ formatDate(form.attributes?.signed_date) }}</div>
          </div>
        </div>
        <div>
          <div class="field-group">
            <div class="label">Signed By:</div>
            <div class="value">{{ form.attributes?.signed_by || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Witness:</div>
            <div class="value">{{ form.attributes?.witness || 'N/A' }}</div>
          </div>
        </div>
      </div>
      
      <div v-if="form.attributes?.content" style="margin-top: 20pt;">
        <div class="label">Form Content:</div>
        <div class="value" v-html="form.attributes.content"></div>
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
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    },
    stripHtml(html) {
      if (!html) return ''
      // Basic HTML stripping - create a temporary div to parse HTML
      const tmp = document.createElement('div')
      tmp.innerHTML = html
      return tmp.textContent || tmp.innerText || ''
    }
  }
}
</script>

