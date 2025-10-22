<template>
  <div class="medications-section page-break-before" id="medications">
    <a id="medications-start"></a>
    <h1 class="section-title">MEDICATION ORDERS</h1>
    
    <table>
      <thead>
        <tr>
          <th>Medication Name</th>
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
          <td>{{ medication.attributes?.route || 'N/A' }}</td>
          <td>{{ medication.attributes?.prn ? 'Yes' : 'No' }}</td>
          <td>{{ formatDate(medication.attributes?.start_date) }}</td>
          <td>{{ formatDate(medication.attributes?.end_date) }}</td>
          <td>{{ medication.attributes?.status || 'N/A' }}</td>
          <td>{{ getProviderName(medication.attributes?.ordering_provider) }}</td>
        </tr>
      </tbody>
    </table>
    
    <!-- Section end marker for page range detection -->
    <a id="medications-end"></a>
    <div class="section-end-marker" data-section-end="medications"></div>
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

