/**
 * PDF Service - Abstraction layer for PDF generation
 * Supports both client-side (browser print) and server-side (Puppeteer) implementations
 */

/**
 * Client-side PDF service using browser print API
 * For prototype/demo purposes - triggers browser print dialog
 */
export class ClientPrintService {
  /**
   * Generate PDF using browser's print functionality
   * @param {string} htmlContent - HTML string to print
   * @param {Object} options - Generation options
   * @returns {Promise<void>}
   */
  async generatePDF(htmlContent, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Create hidden iframe for printing
        const printFrame = document.createElement('iframe')
        printFrame.style.position = 'absolute'
        printFrame.style.width = '0'
        printFrame.style.height = '0'
        printFrame.style.border = 'none'
        
        document.body.appendChild(printFrame)
        
        // Write content to iframe
        const doc = printFrame.contentDocument || printFrame.contentWindow.document
        doc.open()
        doc.write(htmlContent)
        doc.close()
        
        // Wait for content to load
        printFrame.onload = () => {
          try {
            // Trigger print dialog
            printFrame.contentWindow.focus()
            printFrame.contentWindow.print()
            
            // Clean up after print dialog closes
            setTimeout(() => {
              document.body.removeChild(printFrame)
              resolve()
            }, 1000)
          } catch (error) {
            document.body.removeChild(printFrame)
            reject(error)
          }
        }
      } catch (error) {
        reject(error)
      }
    })
  }
}

/**
 * Server-side PDF service using Puppeteer
 * For production use - generates PDF blob via server API
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
 * Factory function to get appropriate PDF service
 * @param {string} mode - 'client' or 'server'
 * @returns {ClientPrintService|PuppeteerService}
 */
export function createPdfService(mode = 'client') {
  if (mode === 'server') {
    return new PuppeteerService()
  }
  return new ClientPrintService()
}

// Default export for convenience
export default createPdfService

