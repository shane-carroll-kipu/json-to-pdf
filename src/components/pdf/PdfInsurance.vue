<template>
  <div class="insurance-section page-break-before" id="insurance">
    <a id="insurance-start"></a>
    <h1 class="section-title">INSURANCE INFORMATION</h1>
    
    <div v-for="insurance in insurances" :key="insurance.id" class="card page-break-avoid">
      <div class="card-title">
        {{ insurance.attributes?.insurance_company || 'Insurance Policy' }}
      </div>
      
      <div class="two-column">
        <div>
          <div class="field-group">
            <div class="label">Policy Number:</div>
            <div class="value">{{ insurance.attributes?.policy_number || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Group ID:</div>
            <div class="value">{{ insurance.attributes?.group_id || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Group Plan Name:</div>
            <div class="value">{{ insurance.attributes?.group_plan_name || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Status:</div>
            <div class="value">{{ insurance.attributes?.status || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Insurance Type:</div>
            <div class="value">{{ insurance.attributes?.insurance_type || 'N/A' }}</div>
          </div>
        </div>
        <div>
          <div class="field-group">
            <div class="label">Effective Date:</div>
            <div class="value">{{ insurance.attributes?.effective_date || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Termination Date:</div>
            <div class="value">{{ insurance.attributes?.termination_date || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Insurance Phone:</div>
            <div class="value">{{ insurance.attributes?.insurance_phone || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Payer ID:</div>
            <div class="value">{{ insurance.attributes?.payer_id || insurance.attributes?.ext_payor_id || 'N/A' }}</div>
          </div>
        </div>
      </div>
      
      <!-- Subscriber Information -->
      <div v-if="insurance.attributes?.subscriber">
        <h3 style="font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 8pt;">Subscriber Information</h3>
        <div class="two-column">
          <div>
            <div class="field-group">
              <div class="label">Relationship:</div>
              <div class="value">{{ insurance.attributes.subscriber.relationship || 'N/A' }}</div>
            </div>
            <div class="field-group">
              <div class="label">Name:</div>
              <div class="value">{{ getSubscriberName(insurance.attributes.subscriber) }}</div>
            </div>
            <div class="field-group">
              <div class="label">Date of Birth:</div>
              <div class="value">{{ insurance.attributes.subscriber.date_of_birth || 'N/A' }}</div>
            </div>
          </div>
          <div>
            <div class="field-group">
              <div class="label">Gender:</div>
              <div class="value">{{ insurance.attributes.subscriber.gender || 'N/A' }}</div>
            </div>
            <div class="field-group">
              <div class="label">Employer:</div>
              <div class="value">{{ insurance.attributes.subscriber.employer || 'N/A' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Section end marker for page range detection -->
    <a id="insurance-end"></a>
    <div class="section-end-marker" data-section-end="insurance"></div>
  </div>
</template>

<script>
export default {
  name: 'PdfInsurance',
  props: {
    insurances: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getSubscriberName(subscriber) {
      if (!subscriber) return 'N/A'
      const { first_name, middle_name, last_name, full_name } = subscriber
      if (full_name) return full_name
      return [first_name, middle_name, last_name].filter(Boolean).join(' ') || 'N/A'
    }
  }
}
</script>

