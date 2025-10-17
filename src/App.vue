<template>
  <div class="container no-print">
    <div class="header">
      <h1>JSON to PDF Converter</h1>
      <p>Upload your structured JSON file and convert it to a beautiful PDF document</p>
    </div>

    <div 
      class="upload-area"
      :class="{ dragover: isDragOver }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        @change="handleFileSelect"
        class="file-input"
        tabindex="0"
      />
      
      <div class="upload-icon">📄</div>
      <div class="upload-text">
        {{ selectedFile ? 'File Selected' : 'Drop your JSON file here' }}
      </div>
      <div class="upload-subtext">
        {{ selectedFile ? selectedFile.name : 'or click to browse' }}
      </div>
      
      <button 
        v-if="selectedFile" 
        @click="clearFile" 
        class="clear-button"
        type="button"
      >
        Clear File
      </button>
    </div>

    <div v-if="selectedFile" class="file-info">
      <h3>Selected File</h3>
      <p><strong>Name:</strong> {{ selectedFile.name }}</p>
      <p><strong>Size:</strong> {{ formatFileSize(selectedFile.size) }}</p>
      <p><strong>Type:</strong> {{ selectedFile.type || 'application/json' }}</p>
    </div>

    <button 
      class="convert-btn"
      @click="convertToPDF"
      :disabled="!selectedFile || isConverting"
    >
      <div v-if="isConverting" class="loading"></div>
      <span v-else>📄</span>
      {{ isConverting ? 'Converting...' : 'Convert to PDF' }}
    </button>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="success" class="success">
      {{ success }}
    </div>

    <div v-if="pdfPreview" class="pdf-preview">
      <h3>PDF Preview</h3>
      <div class="pdf-content" v-html="pdfPreview"></div>
    </div>
  </div>
  
  <!-- Hidden PDF template for printing -->
  <PdfTemplate v-if="patientData" :patientData="patientData" />
</template>

<script>
import { ref } from 'vue'
import PdfTemplate from './components/PdfTemplate.vue'

export default {
  name: 'App',
  components: {
    PdfTemplate
  },
  setup() {
    const selectedFile = ref(null)
    const isDragOver = ref(false)
    const isConverting = ref(false)
    const error = ref('')
    const success = ref('')
    const pdfPreview = ref('')
    const fileInput = ref(null)
    const patientData = ref(null)

    // Removed programmatic click to avoid double-open behavior
    const triggerFileInput = () => {}

    const handleDragOver = (e) => {
      isDragOver.value = true
    }

    const handleDragLeave = (e) => {
      isDragOver.value = false
    }

    const handleDrop = (e) => {
      isDragOver.value = false
      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFile(files[0])
      }
    }

    const handleFileSelect = (e) => {
      console.log('File selected:', e.target.files[0]?.name)
      const file = e.target.files[0]
      if (file) {
        handleFile(file)
      }
    }

    const handleFile = (file) => {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        error.value = 'Please select a valid JSON file'
        return
      }
      
      selectedFile.value = file
      error.value = ''
      success.value = ''
      pdfPreview.value = ''
    }

    const clearFile = () => {
      selectedFile.value = null
      error.value = ''
      success.value = ''
      pdfPreview.value = ''
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const convertToPDF = async () => {
      if (!selectedFile.value) return

      isConverting.value = true
      error.value = ''
      success.value = ''
      pdfPreview.value = ''

      try {
        const text = await selectedFile.value.text()
        const jsonData = JSON.parse(text)
        
        // Set patient data to render the PDF template
        patientData.value = jsonData.data
        
        // Generate a simple preview
        const patientName = jsonData.data?.attributes?.demographics?.name || {}
        const previewHTML = `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: white;">
            <h1 style="color: #333;">PDF Generation Ready</h1>
            <p>Patient: ${patientName.first_name || 'Unknown'} ${patientName.last_name || ''}</p>
            <p>Medical Record: ${jsonData.data?.attributes?.identifiers?.medical_record_number || 'N/A'}</p>
            <p>Date: ${new Date().toLocaleString()}</p>
            <p style="color: #2563eb; font-weight: bold;">Browser print dialog will open - use "Save as PDF" to generate your document.</p>
          </div>
        `
        pdfPreview.value = previewHTML

        // Wait a moment for Vue to render the PDF template
        await new Promise(resolve => setTimeout(resolve, 500))

        // Trigger print dialog
        const startTime = Date.now()
        window.print()
        const endTime = Date.now()
        
        console.log(`Print dialog opened in ${endTime - startTime}ms`)

        success.value = `PDF template ready! Use the print dialog to save as PDF.`
        
      } catch (err) {
        error.value = `Error converting file: ${err.message}`
        console.error('Conversion error:', err)
      } finally {
        isConverting.value = false
      }
    }


    return {
      selectedFile,
      isDragOver,
      isConverting,
      error,
      success,
      pdfPreview,
      fileInput,
      patientData,
      triggerFileInput,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleFileSelect,
      clearFile,
      formatFileSize,
      convertToPDF
    }
  }
}
</script>

<style scoped>
.clear-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background-color: #c53030;
}
</style>
