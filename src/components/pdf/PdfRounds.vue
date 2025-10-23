<template>
  <div class="rounds-section page-break-before" id="rounds">
    <a id="rounds-start"></a>
    <h1 class="section-title">ROUNDS & OBSERVATIONS</h1>
    
    <table>
      <thead>
        <tr>
          <th>Observed At</th>
          <th>Observed By</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="round in rounds" :key="round.id">
          <td>{{ formatDateTime(round.attributes?.created_at) }}</td>
          <td>{{ round.attributes?.created_by || 'N/A' }}</td>
        </tr>
      </tbody>
    </table>
    
    <!-- Section end marker for page range detection -->
    <a id="rounds-end"></a>
    <div class="section-end-marker" data-section-end="rounds"></div>
  </div>
</template>

<script>
export default {
  name: 'PdfRounds',
  props: {
    rounds: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatDateTime(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString()
    }
  }
}
</script>


