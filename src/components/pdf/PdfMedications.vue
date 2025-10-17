<template>
  <div class="medications-section page-break-before" id="medications">
    <h1 class="section-title">MEDICATION ORDERS</h1>
    
    <table>
      <thead>
        <tr>
          <th>Medication Name</th>
          <th>Order Type</th>
          <th>Route</th>
          <th>PRN</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Status</th>
          <th>Provider</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="medication in medications" :key="medication.id">
          <td>{{ medication.attributes?.medication_name || 'Unnamed Medication' }}</td>
          <td>{{ medication.attributes?.order_type || 'N/A' }}</td>
          <td>{{ medication.attributes?.route || 'N/A' }}</td>
          <td>{{ medication.attributes?.prn ? 'Yes' : 'No' }}</td>
          <td>{{ formatDate(medication.attributes?.start_date) }}</td>
          <td>{{ formatDate(medication.attributes?.end_date) }}</td>
          <td>{{ medication.attributes?.status || 'N/A' }}</td>
          <td>{{ getProviderName(medication.attributes?.ordering_provider) }}</td>
        </tr>
      </tbody>
    </table>
    
    <!-- Justifications and Warnings -->
    <div v-for="medication in medicationsWithNotes" :key="medication.id" style="margin-top: 12pt;">
      <div v-if="medication.attributes?.justification" style="font-size: 10pt; color: #4a5568; margin-bottom: 6pt;">
        <strong>{{ medication.attributes.medication_name }}:</strong> {{ medication.attributes.justification }}
      </div>
      <div v-if="medication.attributes?.warnings" style="font-size: 10pt; color: #d32f2f; margin-bottom: 6pt;">
        <strong>⚠️ {{ medication.attributes.medication_name }}:</strong> {{ medication.attributes.warnings }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PdfMedications',
  props: {
    medications: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    medicationsWithNotes() {
      return this.medications.filter(med => {
        const attrs = med.attributes || {}
        return attrs.justification || attrs.warnings
      })
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    },
    getProviderName(provider) {
      if (!provider) return 'N/A'
      const { first_name, last_name } = provider
      return [first_name, last_name].filter(Boolean).join(' ') || 'N/A'
    }
  }
}
</script>

