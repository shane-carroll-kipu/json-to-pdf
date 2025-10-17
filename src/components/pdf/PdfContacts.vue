<template>
  <div class="contacts-section page-break-before" id="contacts">
    <h1 class="section-title">PATIENT CONTACTS</h1>
    
    <div v-for="contact in contacts" :key="contact.id" class="card page-break-avoid">
      <div class="card-title">
        {{ contact.attributes?.name?.full_name || 'Contact' }}
      </div>
      
      <div class="two-column">
        <div>
          <div class="field-group">
            <div class="label">Relationship:</div>
            <div class="value">{{ contact.attributes?.relationship || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Contact Type:</div>
            <div class="value">{{ contact.attributes?.contact_type || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Phone:</div>
            <div class="value">{{ contact.attributes?.phone || 'N/A' }}</div>
          </div>
        </div>
        <div>
          <div class="field-group">
            <div class="label">Alternate Phone:</div>
            <div class="value">{{ contact.attributes?.alternate_phone || 'N/A' }}</div>
          </div>
          <div class="field-group">
            <div class="label">Email:</div>
            <div class="value">{{ contact.attributes?.email || 'N/A' }}</div>
          </div>
          <div class="field-group" v-if="contact.attributes?.address">
            <div class="label">Address:</div>
            <div class="value">{{ formatAddress(contact.attributes.address) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PdfContacts',
  props: {
    contacts: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatAddress(address) {
      if (!address) return 'N/A'
      const parts = []
      if (address.street) parts.push(address.street)
      if (address.street2) parts.push(address.street2)
      const cityState = [address.city, address.state, address.zip].filter(Boolean).join(', ')
      if (cityState) parts.push(cityState)
      return parts.length > 0 ? parts.join(', ') : 'N/A'
    }
  }
}
</script>

