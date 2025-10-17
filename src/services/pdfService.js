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
 * For production use - generates PDF blob
 * 
 * NOTE: This is a stub for future server-side implementation
 * Requires: npm install puppeteer
 */
export class PuppeteerService {
  /**
   * Generate PDF using Puppeteer (server-side)
   * @param {string} htmlContent - HTML string to convert
   * @param {Object} options - Generation options
   * @returns {Promise<Blob>}
   */
  async generatePDF(htmlContent, options = {}) {
    // This will be implemented when moving to server-side
    // For now, throw an error if someone tries to use it
    throw new Error('PuppeteerService requires server-side implementation. Use ClientPrintService for browser-based generation.')
    
    /* Server-side implementation example:
    const puppeteer = require('puppeteer');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      margin: {
        top: '1in',
        bottom: '1in',
        left: '0.5in',
        right: '0.5in'
      }
    });
    
    await browser.close();
    
    return new Blob([pdfBuffer], { type: 'application/pdf' });
    */
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

