/**
 * PDF Service - Server-side PDF generation using Puppeteer
 */

/**
 * Server-side PDF service using Puppeteer
 * Generates PDF blob via server API
 */
export class PuppeteerService {
  constructor(serverUrl = 'http://localhost:3001') {
    this.serverUrl = serverUrl
  }

  /**
   * Generate PDF using Puppeteer server
   * @param {string} htmlContent - HTML string to convert
   * @param {Object} options - Generation options
   * @returns {Promise<Blob>}
   */
  async generatePDF(htmlContent, options = {}) {
    try {
      const response = await fetch(`${this.serverUrl}/api/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          htmlContent,
          filename: options.filename || 'medical_record.pdf'
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'PDF generation failed')
      }
      
      // Convert response to blob
      const blob = await response.blob()
      return blob
      
    } catch (error) {
      console.error('PuppeteerService error:', error)
      throw new Error(`Failed to generate PDF: ${error.message}`)
    }
  }
}

/**
 * Factory function to create PDF service
 * @returns {PuppeteerService}
 */
export function createPdfService() {
  return new PuppeteerService()
}

// Default export for convenience
export default createPdfService

