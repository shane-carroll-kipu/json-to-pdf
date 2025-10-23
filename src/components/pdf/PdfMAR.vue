<template>
  <div class="mar-section page-break-before" id="mar">
    <a id="mar-start"></a>
    <h1 class="section-title">MEDICATION ADMINISTRATION RECORD (MAR)</h1>
    
    <table>
      <thead>
        <tr>
          <th style="width: 35%;">Medication/Dose</th>
          <th style="width: 10%; min-width: 85px; white-space: nowrap;">Date</th>
          <th style="width: 10%; min-width: 65px; white-space: nowrap;">Scheduled</th>
          <th style="width: 10%; min-width: 65px; white-space: nowrap;">Admin Time</th>
          <th style="width: 8%;">Given</th>
          <th style="width: 27%;">Admin By</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in sortedEntries" :key="entry.id">
          <td>{{ formatMedicationDose(entry) }}</td>
          <td style="white-space: nowrap;">{{ formatDateOnly(entry.attributes?.scheduled_time) }}</td>
          <td style="white-space: nowrap;">{{ formatTimeOnly(entry.attributes?.scheduled_time) }}</td>
          <td style="white-space: nowrap;">{{ formatTimeOnly(entry.attributes?.administration_time) || '—' }}</td>
          <td>{{ entry.attributes?.administered ? 'Yes' : 'No' }}</td>
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
      // Sort by administration time, most recent first
      return [...this.validEntries].sort((a, b) => {
        const timeA = a.attributes?.administration_time ? new Date(a.attributes.administration_time).getTime() : 0
        const timeB = b.attributes?.administration_time ? new Date(b.attributes.administration_time).getTime() : 0
        // Sort descending (most recent first)
        return timeB - timeA
      })
    }
  },
  methods: {
    formatMedicationDose(entry) {
      const attrs = entry.attributes || {}
      const name = attrs.medication_name || 'N/A'
      const amount = attrs.dose_amount ? parseFloat(attrs.dose_amount).toString() : null
      const dose = attrs.dose_given
      const units = attrs.dose_units
      const route = attrs.route
      
      let result = name
      
      // Add dose information with 'x' between amount and dose
      if (amount && dose) {
        result += ` ${amount} x ${dose}`
        if (units) result += ` ${units}`
      } else if (dose) {
        result += ` ${dose}`
        if (units) result += ` ${units}`
      } else if (amount && units) {
        result += ` ${amount} ${units}`
      }
      
      // Add route
      if (route) {
        result += ', ' + route
      }
      
      return result
    },
    formatDateOnly(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const year = date.getFullYear()
      return `${month}/${day}/${year}`
    },
    formatTimeOnly(dateString) {
      if (!dateString) return null
      const date = new Date(dateString)
      const hours = date.getHours()
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${displayHours}:${minutes} ${ampm}`
    }
  }
}
</script>

