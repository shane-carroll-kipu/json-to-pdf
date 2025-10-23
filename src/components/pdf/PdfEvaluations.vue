<template>
  <div
    v-for="(evaluation, index) in evaluations"
    :key="evaluation.id"
    class="evaluation-section page-break-before"
    :id="`evaluation-${evaluation.id}`"
  >
      <a :id="`evaluation-${evaluation.id}-start`"></a>
      <h1 class="section-title">{{ evaluation.attributes?.evaluation_name || 'Patient Evaluation' }}</h1>
      
      <!-- Evaluation Items -->
      <div v-if="evaluation.attributes?.items && evaluation.attributes.items.length > 0">
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
      
      <!-- Signatures Section -->
      <div v-if="hasSignatures(evaluation)" style="margin-top: 30pt; border-top: 1pt solid #ccc; padding-top: 10pt;">
        <div v-if="evaluation.attributes?.document_signer_metadata?.signed_by && evaluation.attributes?.document_signer_metadata?.signed_at" style="margin-bottom: 8pt;">
          Electronically signed by Signer ID: {{ evaluation.attributes.document_signer_metadata.signed_by }} on {{ formatDateTime(evaluation.attributes.document_signer_metadata.signed_at) }}
        </div>
        <div v-if="evaluation.attributes?.document_reviewer_metadata?.reviewed_by && evaluation.attributes?.document_reviewer_metadata?.reviewed_at" style="margin-bottom: 8pt;">
          Reviewed by Reviewer ID: {{ evaluation.attributes.document_reviewer_metadata.reviewed_by }} on {{ formatDateTime(evaluation.attributes.document_reviewer_metadata.reviewed_at) }}
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
    },
    hasSignatures(evaluation) {
      const attrs = evaluation.attributes || {}
      const signerMeta = attrs.document_signer_metadata || {}
      const reviewerMeta = attrs.document_reviewer_metadata || {}
      
      return !!(
        (signerMeta.signed_by && signerMeta.signed_at) ||
        (reviewerMeta.reviewed_by && reviewerMeta.reviewed_at)
      )
    }
  }
}
</script>

