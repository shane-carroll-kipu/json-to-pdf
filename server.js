import express from 'express'
import cors from 'cors'
import puppeteer from 'puppeteer'

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Browser instance for reuse
let browser = null

/**
 * Get or create browser instance
 * Reusing browser improves performance
 */
async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    console.log('Launching new browser instance...')
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    })
  }
  return browser
}

/**
 * Generate PDF from HTML content
 * POST /api/generate-pdf
 * Body: { htmlContent: string, filename?: string }
 */
app.post('/api/generate-pdf', async (req, res) => {
  const startTime = Date.now()
  let page = null
  
  try {
    const { htmlContent, filename = 'medical_record.pdf' } = req.body
    
    if (!htmlContent) {
      return res.status(400).json({ error: 'htmlContent is required' })
    }
    
    console.log(`Generating PDF: ${filename}`)
    
    // Get browser and create new page
    const browserInstance = await getBrowser()
    page = await browserInstance.newPage()
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 1600 })
    
    // Set content and wait for it to be ready
    await page.setContent(htmlContent, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    })
    
    // Generate PDF with options
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false, // We use CSS @page rules instead
      margin: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      },
      preferCSSPageSize: true // Use CSS page size from @page rules
    })
    
    // Close the page
    await page.close()
    
    const endTime = Date.now()
    console.log(`PDF generated in ${endTime - startTime}ms`)
    
    // Send PDF as response
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', pdfBuffer.length)
    res.send(pdfBuffer)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    
    // Clean up page if it exists
    if (page) {
      try {
        await page.close()
      } catch (closeError) {
        console.error('Error closing page:', closeError)
      }
    }
    
    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error.message
    })
  }
})

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    browserConnected: browser ? browser.isConnected() : false
  })
})

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('Shutting down server...')
  
  if (browser) {
    await browser.close()
    console.log('Browser closed')
  }
  
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`PDF Generation Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})

