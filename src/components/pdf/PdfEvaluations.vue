<template>
  <div
    v-for="(evaluation, index) in evaluations"
    :key="evaluation.id"
    class="evaluation-section page-break-before"
    :id="`evaluation-${evaluation.id}`"
  >
      <a :id="`evaluation-${evaluation.id}-start`"></a>
      <h1 class="section-title">{{ evaluation.attributes?.evaluation_name || 'Patient Evaluation' }}</h1>
      
      <div class="two-column">
        <div>
          <div class="field-group">
            <div class="label">Evaluation Name:</div>
            <div class="value">{{ evaluation.attributes?.evaluation_name || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Status:</div>
            <div class="value">{{ evaluation.attributes?.status || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Complete:</div>
            <div class="value">{{ evaluation.attributes?.complete ? 'Yes' : 'No' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Evaluation Date:</div>
            <div class="value">{{ formatDateTime(evaluation.attributes?.evaluation_date) }}</div>
          </div>
        </div>
        <div>
          <div class="field-group">
            <div class="label">Tab Name:</div>
            <div class="value">{{ evaluation.attributes?.tab_name || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Signed:</div>
            <div class="value">{{ formatDateTime(evaluation.attributes?.document_signer_metadata?.signed_at) }}</div>
          </div>
          <div class="field-group">
            <div class="label">Reviewed:</div>
            <div class="value">{{ formatDateTime(evaluation.attributes?.document_reviewer_metadata?.reviewed_at) }}</div>
          </div>
        </div>
      </div>
      
      <!-- Evaluation Items -->
      <div v-if="evaluation.attributes?.items && evaluation.attributes.items.length > 0" style="margin-top: 20pt;">
        <h2 class="subsection-title">Evaluation Items</h2>
        
        <div v-for="item in evaluation.attributes.items" :key="item.id" class="page-break-avoid" style="margin-bottom: 16pt;">
          <div v-if="item.attributes?.label && item.attributes.field_type !== 'title'" class="label">
            {{ stripHtml(item.attributes.label) }}
          </div>
          
          <div v-if="item.attributes?.field_type === 'title'" style="font-weight: bold; font-size: 11pt; margin: 12pt 0 6pt 0;">
            {{ stripHtml(item.attributes.label) }}
          </div>
          
          <div v-if="item.attributes?.content" class="value" style="white-space: pre-wrap;">
            {{ item.attributes.content }}
          </div>
        </div>
      </div>
      
      <!-- Section end marker for page range detection -->
      <a :id="`evaluation-${evaluation.id}-end`"></a>
      <div class="section-end-marker" :data-section-end="`evaluation-${evaluation.id}`"></div>
  </div>
</template>

<script>
export default {
  name: 'PdfEvaluations',
  props: {
    evaluations: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatDateTime(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString()
    },
    stripHtml(html) {
      if (!html) return ''
      // Basic HTML stripping
      const tmp = document.createElement('div')
      tmp.innerHTML = html
      return tmp.textContent || tmp.innerText || ''
    }
  }
}
</script>

