<template>
  <div class="assessments-section page-break-before" id="assessments">
    <a id="assessments-start"></a>
    <h1 class="section-title">INTEGRATED ASSESSMENTS</h1>
    
    <!-- Vital Signs -->
    <div v-if="groupedAssessments.vital_signs">
      <h2 class="subsection-title">Vital Signs</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>BP Systolic</th>
            <th>BP Diastolic</th>
            <th>Temp</th>
            <th>Pulse</th>
            <th>Resp</th>
            <th>O2 Sat</th>
            <th>Recorded By</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="assessment in groupedAssessments.vital_signs" :key="assessment.id">
            <td>{{ formatDateTime(assessment.attributes?.timestamp) }}</td>
            <td>{{ assessment.attributes?.blood_pressure_systolic || 'N/A' }}</td>
            <td>{{ assessment.attributes?.blood_pressure_diastolic || 'N/A' }}</td>
            <td>{{ assessment.attributes?.temperature || 'N/A' }}</td>
            <td>{{ assessment.attributes?.pulse || 'N/A' }}</td>
            <td>{{ assessment.attributes?.respirations || 'N/A' }}</td>
            <td>{{ assessment.attributes?.o2_saturation || 'N/A' }}</td>
            <td>{{ assessment.attributes?.recorded_by || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Glucose -->
    <div v-if="groupedAssessments.glucose">
      <h2 class="subsection-title">Glucose</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Reading</th>
            <th>Type of Check</th>
            <th>Intervention</th>
            <th>Note</th>
            <th>Recorded By</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="assessment in groupedAssessments.glucose" :key="assessment.id">
            <td>{{ formatDateTime(assessment.attributes?.timestamp) }}</td>
            <td>{{ assessment.attributes?.reading || 'N/A' }}</td>
            <td>{{ assessment.attributes?.type_of_check || 'N/A' }}</td>
            <td>{{ formatArray(assessment.attributes?.intervention) }}</td>
            <td>{{ assessment.attributes?.note || 'N/A' }}</td>
            <td>{{ assessment.attributes?.recorded_by || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- CIWA-AR -->
    <div v-if="groupedAssessments.ciwa_ar">
      <h2 class="subsection-title">CIWA-AR</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Total Score</th>
            <th>Nausea</th>
            <th>Tremor</th>
            <th>Sweats</th>
            <th>Anxiety</th>
            <th>Agitation</th>
            <th>Recorded By</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="assessment in groupedAssessments.ciwa_ar" :key="assessment.id">
            <td>{{ formatDateTime(assessment.attributes?.timestamp) }}</td>
            <td>{{ assessment.attributes?.total_score || 'N/A' }}</td>
            <td>{{ assessment.attributes?.nausea || 'N/A' }}</td>
            <td>{{ assessment.attributes?.tremor || 'N/A' }}</td>
            <td>{{ assessment.attributes?.paroxysmal_sweats || 'N/A' }}</td>
            <td>{{ assessment.attributes?.anxiety || 'N/A' }}</td>
            <td>{{ assessment.attributes?.agitation || 'N/A' }}</td>
            <td>{{ assessment.attributes?.recorded_by || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- CIWA-B -->
    <div v-if="groupedAssessments.ciwa_b">
      <h2 class="subsection-title">CIWA-B</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Total Score</th>
            <th>Anxiety</th>
            <th>Tremors</th>
            <th>Sweating</th>
            <th>Irritable</th>
            <th>Recorded By</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="assessment in groupedAssessments.ciwa_b" :key="assessment.id">
            <td>{{ formatDateTime(assessment.attributes?.timestamp) }}</td>
            <td>{{ assessment.attributes?.total_score || 'N/A' }}</td>
            <td>{{ assessment.attributes?.anxiety || 'N/A' }}</td>
            <td>{{ assessment.attributes?.tremors || 'N/A' }}</td>
            <td>{{ assessment.attributes?.sweating_agitation || 'N/A' }}</td>
            <td>{{ assessment.attributes?.irritable || 'N/A' }}</td>
            <td>{{ assessment.attributes?.recorded_by || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- COWS -->
    <div v-if="groupedAssessments.cows">
      <h2 class="subsection-title">COWS</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Total Score</th>
            <th>Pulse Rate</th>
            <th>Sweating</th>
            <th>Restlessness</th>
            <th>Pupil Size</th>
            <th>Recorded By</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="assessment in groupedAssessments.cows" :key="assessment.id">
            <td>{{ formatDateTime(assessment.attributes?.timestamp) }}</td>
            <td>{{ assessment.attributes?.total_score || 'N/A' }}</td>
            <td>{{ assessment.attributes?.pulse_rate || 'N/A' }}</td>
            <td>{{ assessment.attributes?.sweating || 'N/A' }}</td>
            <td>{{ assessment.attributes?.restlessness || 'N/A' }}</td>
            <td>{{ assessment.attributes?.pupil_size || 'N/A' }}</td>
            <td>{{ assessment.attributes?.recorded_by || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Height & Weight -->
    <div v-if="groupedAssessments.height || groupedAssessments.weight">
      <h2 class="subsection-title">Height & Weight</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Type</th>
            <th>Value</th>
            <th>Unit</th>
            <th>Recorded By</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="assessment in heightWeightAssessments" :key="assessment.id">
            <td>{{ formatDateTime(assessment.attributes?.timestamp) }}</td>
            <td>{{ assessment.type === 'height' ? 'Height' : 'Weight' }}</td>
            <td>{{ assessment.attributes?.value || 'N/A' }}</td>
            <td>{{ assessment.attributes?.unit || 'N/A' }}</td>
            <td>{{ assessment.attributes?.recorded_by || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Section end marker for page range detection -->
    <a id="assessments-end"></a>
    <div class="section-end-marker" data-section-end="assessments"></div>
  </div>
</template>

<script>
export default {
  name: 'PdfAssessments',
  props: {
    assessments: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    validAssessments() {
      return this.assessments.filter(assessment => assessment.attributes?.status !== 'empty')
    },
    groupedAssessments() {
      return this.validAssessments.reduce((groups, assessment) => {
        const type = assessment.type
        if (!groups[type]) {
          groups[type] = []
        }
        groups[type].push(assessment)
        return groups
      }, {})
    },
    heightWeightAssessments() {
      const height = this.groupedAssessments.height || []
      const weight = this.groupedAssessments.weight || []
      return [...height, ...weight].sort((a, b) => {
        const timeA = new Date(a.attributes?.timestamp || 0)
        const timeB = new Date(b.attributes?.timestamp || 0)
        return timeA - timeB
      })
    }
  },
  methods: {
    formatDateTime(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString()
    },
    formatArray(value) {
      if (Array.isArray(value)) return value.join(', ')
      return value || 'N/A'
    }
  }
}
</script>

