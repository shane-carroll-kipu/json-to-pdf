import express from 'express'
import cors from 'cors'
import { getBrowser, generatePdfFromHtml, injectTOCPageNumbers } from './src/services/puppeteerGenerator.js'

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Serve Paged.js from node_modules so it can be loaded reliably in Puppeteer
app.use('/pagedjs', express.static('node_modules/pagedjs/dist'))


// Browser is managed in puppeteerGenerator.js

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
    const debug = String(req.query.debug || '').toLowerCase() === '1'
    
    if (!htmlContent) {
      return res.status(400).json({ error: 'htmlContent is required' })
    }
    
    console.log(`Generating PDF: ${filename}`)
    
    // Render HTML in headless browser and wait for Paged.js readiness
    const browserInstance = await getBrowser()
    const renderResult = await generatePdfFromHtml(browserInstance, htmlContent, { waitForReady: true, returnPage: true })
    page = renderResult.page
    const metrics = renderResult.metrics || {}
    
    // Check for console messages from the page (for debugging Paged.js)
    page.on('console', msg => {
      console.log('Browser console:', msg.type(), msg.text())
    })
    
    // Inject TOC page numbers by querying Paged.js internal structure
    const tocResult = await injectTOCPageNumbers(page)
    console.log('TOC injection complete:', tocResult)
    
    // In debug mode return the fully rendered HTML to help devs inspect pagination
    if (debug) {
      const html = await page.content()
      await page.close()
      const endTime = Date.now()
      console.log(`HTML preview generated in ${endTime - startTime}ms`)
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.send(html)
    }

    // Generate PDF with options
    let pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true
    })
    
    // Close the page
    await page.close()
    
    const endTime = Date.now()
    const totalMs = endTime - startTime
    
    // Log comprehensive metrics
    console.log(`PDF generated successfully:`, {
      filename,
      paginateMs: metrics.paginateMs || 0,
      pdfMs: metrics.pdfMs || 0,
      totalMs,
      sizeKB: Math.round(pdfBuffer.length / 1024),
      tocEntries: tocResult.tocEntriesInjected,
      totalPages: tocResult.totalPages
    })
    
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
app.get('/health', async (req, res) => {
  try {
    const browser = await getBrowser()
    res.json({
      status: 'ok',
      browserConnected: browser ? browser.isConnected() : false
    })
  } catch (error) {
    res.json({
      status: 'ok',
      browserConnected: false
    })
  }
})

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('Shutting down server...')
  
  const browser = await getBrowser().catch(() => null)
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

