<template>
  <div class="mar-section page-break-before" id="mar">
    <a id="mar-start"></a>
    <h1 class="section-title">MEDICATION ADMINISTRATION RECORD (MAR)</h1>
    
    <table>
      <thead>
        <tr>
          <th>Medication Name</th>
          <th>Dose Given</th>
          <th>Route</th>
          <th>Scheduled Time</th>
          <th>Administration Time</th>
          <th>Administered By</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in sortedEntries" :key="entry.id">
          <td>{{ entry.attributes?.medication_name || 'N/A' }}</td>
          <td>{{ entry.attributes?.dose_given || 'N/A' }}</td>
          <td>{{ entry.attributes?.route || 'N/A' }}</td>
          <td>{{ formatDateTime(entry.attributes?.scheduled_time) }}</td>
          <td>{{ formatDateTime(entry.attributes?.administration_time) || 'Not Administered' }}</td>
          <td>{{ entry.attributes?.administered_by || 'N/A' }}</td>
        </tr>
      </tbody>
    </table>
    
    <!-- Section end marker for page range detection -->
    <a id="mar-end"></a>
    <div class="section-end-marker" data-section-end="mar"></div>
  </div>
</template>

<script>
export default {
  name: 'PdfMAR',
  props: {
    administrations: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    validEntries() {
      // Filter out entries where administered is null
      return this.administrations.filter(entry => entry.attributes?.administered !== null)
    },
    sortedEntries() {
      // Sort by scheduled time
      return [...this.validEntries].sort((a, b) => {
        const timeA = new Date(a.attributes?.scheduled_time || 0)
        const timeB = new Date(b.attributes?.scheduled_time || 0)
        return timeA - timeB
      })
    }
  },
  methods: {
    formatDateTime(dateString) {
      if (!dateString) return null
      return new Date(dateString).toLocaleString()
    }
  }
}
</script>

