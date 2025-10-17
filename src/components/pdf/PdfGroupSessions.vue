<template>
  <div class="group-sessions-section page-break-before" id="group-sessions">
    <h1 class="section-title">GROUP SESSIONS</h1>
    
    <div v-for="session in sessions" :key="session.id" class="card page-break-avoid">
      <div class="card-title">
        {{ session.attributes?.session_name || 'Group Session' }}
      </div>
      
      <div class="two-column">
        <div>
          <div class="field-group">
            <div class="label">Date:</div>
            <div class="value">{{ formatDate(session.attributes?.session_date) }}</div>
          </div>
          <div class="field-group">
            <div class="label">Facilitator:</div>
            <div class="value">{{ session.attributes?.facilitator || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Duration:</div>
            <div class="value">{{ session.attributes?.duration || 'N/A' }}</div>
          </div>
        </div>
        <div>
          <div class="field-group">
            <div class="label">Attendance Status:</div>
            <div class="value">{{ session.attributes?.attendance_status || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Participation Level:</div>
            <div class="value">{{ session.attributes?.participation_level || 'N/A' }}</div>
          </div>
        </div>
      </div>
      
      <div v-if="session.attributes?.notes" style="margin-top: 12pt;">
        <div class="label">Notes:</div>
        <div class="value" style="white-space: pre-wrap;">{{ session.attributes.notes }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PdfGroupSessions',
  props: {
    sessions: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString()
    }
  }
}
</script>

