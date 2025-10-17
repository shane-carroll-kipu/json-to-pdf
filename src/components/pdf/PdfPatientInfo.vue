<template>
  <div class="patient-info-section" id="patient-info">
    <h1 class="section-title">PATIENT INFORMATION</h1>
    
    <!-- Demographics -->
    <h2 class="subsection-title">Demographics</h2>
    <div class="two-column">
      <div>
        <div class="field-group">
          <div class="label">Full Name:</div>
          <div class="value">{{ fullName }}</div>
        </div>
        <div class="field-group">
          <div class="label">Date of Birth:</div>
          <div class="value">{{ demographics.date_of_birth || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Age:</div>
          <div class="value">{{ demographics.age || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Sex:</div>
          <div class="value">{{ demographics.sex || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Gender Identity:</div>
          <div class="value">{{ demographics.gender_identity || 'N/A' }}</div>
        </div>
      </div>
      <div>
        <div class="field-group">
          <div class="label">Marital Status:</div>
          <div class="value">{{ demographics.marital_status || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Race:</div>
          <div class="value">{{ demographics.race || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Ethnicity:</div>
          <div class="value">{{ demographics.ethnicity || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Preferred Language:</div>
          <div class="value">{{ demographics.preferred_language || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Occupation:</div>
          <div class="value">{{ demographics.occupation || 'N/A' }}</div>
        </div>
      </div>
    </div>
    
    <!-- Contact Information -->
    <h2 class="subsection-title">Contact Information</h2>
    <div class="two-column">
      <div>
        <div class="field-group">
          <div class="label">Address:</div>
          <div class="value">{{ addressLine1 }}</div>
        </div>
        <div class="field-group">
          <div class="label">City, State ZIP:</div>
          <div class="value">{{ cityStateZip }}</div>
        </div>
        <div class="field-group">
          <div class="label">Country:</div>
          <div class="value">{{ address.country || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Phone:</div>
          <div class="value">{{ demographics.phone || 'N/A' }}</div>
        </div>
      </div>
      <div>
        <div class="field-group">
          <div class="label">Alternate Phone:</div>
          <div class="value">{{ demographics.alternate_phone || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Email:</div>
          <div class="value">{{ demographics.email || 'N/A' }}</div>
        </div>
        <div v-if="hasEmployer">
          <div class="field-group">
            <div class="label">Employer:</div>
            <div class="value">{{ demographics.employer.name }}</div>
          </div>
          <div class="field-group">
            <div class="label">Employer Phone:</div>
            <div class="value">{{ demographics.employer.phone || 'N/A' }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Identifiers -->
    <h2 class="subsection-title">Identifiers</h2>
    <div class="two-column">
      <div>
        <div class="field-group">
          <div class="label">Medical Record Number:</div>
          <div class="value">{{ identifiers.medical_record_number || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Patient Number:</div>
          <div class="value">{{ identifiers.patient_number || 'N/A' }}</div>
        </div>
      </div>
      <div>
        <div class="field-group">
          <div class="label">SSN:</div>
          <div class="value">{{ identifiers.ssn || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">CID:</div>
          <div class="value">{{ identifiers.cid || 'N/A' }}</div>
        </div>
      </div>
    </div>
    
    <!-- Allergies -->
    <div v-if="allergies.length > 0">
      <h2 class="subsection-title">Allergies</h2>
      <div v-for="allergy in allergies" :key="allergy.id" class="card">
        <div class="field-group">
          <div class="label">Allergen:</div>
          <div class="value">{{ allergy.attributes?.allergen || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Allergy Type:</div>
          <div class="value">{{ allergy.attributes?.allergy_type || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Reaction:</div>
          <div class="value">{{ allergy.attributes?.reaction || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Severity:</div>
          <div class="value">{{ allergy.attributes?.severity || 'N/A' }}</div>
        </div>
        <div class="field-group">
          <div class="label">Status:</div>
          <div class="value">{{ allergy.attributes?.status || 'N/A' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PdfPatientInfo',
  props: {
    patientData: {
      type: Object,
      required: true
    }
  },
  computed: {
    attrs() {
      return this.patientData.attributes || {}
    },
    demographics() {
      return this.attrs.demographics || {}
    },
    name() {
      return this.demographics.name || {}
    },
    address() {
      return this.demographics.address || {}
    },
    identifiers() {
      return this.attrs.identifiers || {}
    },
    allergies() {
      return this.attrs.allergies || []
    },
    fullName() {
      const { first_name, middle_name, last_name } = this.name
      return [first_name, middle_name, last_name].filter(Boolean).join(' ') || 'N/A'
    },
    addressLine1() {
      const { street, street2 } = this.address
      return [street, street2].filter(Boolean).join(' ') || 'N/A'
    },
    cityStateZip() {
      const { city, state, zip } = this.address
      const parts = []
      if (city) parts.push(city)
      if (state) parts.push(state)
      if (zip) parts.push(zip)
      return parts.length > 0 ? parts.join(', ') : 'N/A'
    },
    hasEmployer() {
      return this.demographics.employer && this.demographics.employer.name
    }
  }
}
</script>

