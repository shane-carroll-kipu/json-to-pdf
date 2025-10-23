<template>
  <div class="group-sessions-section page-break-before" id="group-sessions">
    <a id="group-sessions-start"></a>
    <h1 class="section-title">GROUP SESSIONS</h1>
    
    <div v-for="session in sessions" :key="session.id" class="card page-break-avoid" style="margin-bottom: 12pt; padding: 10pt;">
      <!-- Row 1: Title, Start, Duration -->
      <div style="margin-bottom: 4pt;">
        <span style="font-weight: bold;">{{ session.attributes?.session_title || 'Group Session' }}</span>
        <span> | </span>
        <span>{{ formatDateTime(session.attributes?.session_start_time) }}</span>
        <span> | </span>
        <span>Duration: {{ session.attributes?.duration_display || '—' }}</span>
      </div>
      
      <!-- Row 2: Attendance Status, Place of Service (conditional) -->
      <div v-if="hasRow2Data(session)" style="margin-bottom: 4pt;">
        <span>Attendance: {{ session.attributes?.attendance_status || '—' }}</span>
        <span v-if="getPlaceOfService(session) !== '—'"> | Place of Service: {{ getPlaceOfService(session) }}</span>
      </div>
      
      <!-- Row 3: Topic -->
      <div style="margin-bottom: 4pt;">
        <span>Topic: {{ getSessionTopic(session) }}</span>
      </div>
      
      <!-- Row 4: Completed -->
      <div style="margin-bottom: 4pt;">
        <span>Completed: {{ session.attributes?.completed ? 'Yes' : 'No' }}</span>
      </div>
      
      <!-- Session Notes -->
      <div v-if="getSessionNotes(session)" style="margin-top: 8pt;">
        <div class="label">Session Notes:</div>
        <div class="value" style="white-space: pre-wrap;">{{ getSessionNotes(session) }}</div>
      </div>
      
      <!-- Personal Notes -->
      <div v-if="session.attributes?.personal_notes" style="margin-top: 8pt;">
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
    },
    getSessionTopic(session) {
      return session.attributes?.group_session_leader?.group_session_topic || '—'
    },
    getPlaceOfService(session) {
      return session.attributes?.group_session_leader?.place_of_service || '—'
    },
    getSessionNotes(session) {
      return session.attributes?.group_session_leader?.group_session_notes || null
    },
    hasRow2Data(session) {
      const attendance = session.attributes?.attendance_status
      const placeOfService = session.attributes?.group_session_leader?.place_of_service
      return attendance || placeOfService
    }
  }
}
</script>

