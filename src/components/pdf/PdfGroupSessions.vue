<template>
  <div class="group-sessions-section page-break-before" id="group-sessions">
    <a id="group-sessions-start"></a>
    <h1 class="section-title">GROUP SESSIONS</h1>
    
    <div v-for="session in sessions" :key="session.id" class="card page-break-avoid">
      <div class="card-title">
        {{ session.attributes?.session_title || 'Group Session' }}
      </div>
      
      <div class="two-column">
        <div>
          <div class="field-group">
            <div class="label">Date:</div>
            <div class="value">{{ formatDateTime(session.attributes?.session_start_time) }}</div>
          </div>
          <div class="field-group">
            <div class="label">Duration:</div>
            <div class="value">{{ session.attributes?.duration_display || 'N/A' }}</div>
          </div>
        </div>
        <div>
          <div class="field-group">
            <div class="label">Attendance Status:</div>
            <div class="value">{{ session.attributes?.attendance_status || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Completed:</div>
            <div class="value">{{ session.attributes?.completed ? 'Yes' : 'No' }}</div>
          </div>
        </div>
      </div>
      
      <!-- Group Session Leader Information -->
      <div v-if="session.attributes?.group_session_leader" style="margin-top: 12pt;">
        <h3 class="subsection-title" style="font-size: 11pt; margin: 8pt 0 6pt 0;">Session Details</h3>
        
        <div v-if="session.attributes.group_session_leader.group_session_topic" class="field-group">
          <div class="label">Topic:</div>
          <div class="value">{{ session.attributes.group_session_leader.group_session_topic }}</div>
        </div>
        
        <div v-if="session.attributes.group_session_leader.group_session_notes" class="field-group">
          <div class="label">Session Notes:</div>
          <div class="value" style="white-space: pre-wrap;">{{ session.attributes.group_session_leader.group_session_notes }}</div>
        </div>
        
        <div v-if="session.attributes.group_session_leader.place_of_service" class="field-group">
          <div class="label">Place of Service:</div>
          <div class="value">{{ session.attributes.group_session_leader.place_of_service }}</div>
        </div>
      </div>
      
      <!-- Personal Notes -->
      <div v-if="session.attributes?.personal_notes" style="margin-top: 12pt;">
        <div class="label">Personal Notes:</div>
        <div class="value" style="white-space: pre-wrap;">{{ session.attributes.personal_notes }}</div>
      </div>
    </div>
    
    <!-- Section end marker for page range detection -->
    <a id="group-sessions-end"></a>
    <div class="section-end-marker" data-section-end="group-sessions"></div>
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
    },
    formatDateTime(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString()
    }
  }
}
</script>

