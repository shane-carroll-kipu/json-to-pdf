import puppeteer from 'puppeteer'

let browserSingleton = null

/**
 * Get or create browser singleton with optimized flags
 */
export async function getBrowser() {
  if (!browserSingleton || !browserSingleton.isConnected()) {
    console.log('Launching browser (singleton) ...')
    browserSingleton = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=medium'
      ]
    })
  }
  return browserSingleton
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry(fn, options = {}) {
  const { retries = 2, baseDelay = 1000, label = 'operation' } = options
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === retries) {
        console.error(`${label} failed after ${retries + 1} attempts:`, error.message)
        throw error
      }
      
      const delay = baseDelay * Math.pow(2, attempt)
      console.warn(`${label} attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

/**
 * Generate PDF from HTML with retry logic and metrics
 */
export async function generatePdfFromHtml(browser, htmlContent, { waitForReady = true, returnPage = false } = {}) {
  const startTime = Date.now()
  const metrics = { paginateMs: 0, pdfMs: 0, pageCount: 0, totalMs: 0 }
  
  return await withRetry(async () => {
    const page = await browser.newPage()
    
    try {
      await page.setViewport({ width: 794, height: 1123 })
      await page.emulateMediaType('print')
      
      // Set content and wait for network to be idle (ensures Paged.js script loads)
      await page.setContent(htmlContent, { waitUntil: ['domcontentloaded', 'networkidle0'] })

      if (waitForReady) {
        const paginateStart = Date.now()
        try {
          // Wait up to 120 seconds for Paged.js to complete pagination (large documents can take time)
          await page.waitForFunction('window._pdfReady === true', { timeout: 120000 })
          metrics.paginateMs = Date.now() - paginateStart
          console.log(`Paged.js pagination completed in ${metrics.paginateMs}ms`)
        } catch (e) {
          console.warn('Paged.js readiness timeout after 120s — proceeding to print anyway')
          metrics.paginateMs = Date.now() - paginateStart
        }
      }

      if (returnPage) {
        metrics.totalMs = Date.now() - startTime
        return { page, metrics }
      }

      const pdfStart = Date.now()
      const buffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        preferCSSPageSize: true
      })
      metrics.pdfMs = Date.now() - pdfStart
      
      // Estimate page count (A4 is roughly 595x842 points)
      metrics.pageCount = Math.ceil(buffer.length / 15000) // Rough estimate
      
      await page.close()
      
      metrics.totalMs = Date.now() - startTime
      return { buffer, metrics }
    } catch (error) {
      // Clean up page on error
      try {
        await page.close()
      } catch (closeError) {
        // Ignore close errors
      }
      throw error
    }
  }, { retries: 2, baseDelay: 1000, label: 'PDF generation' })
}

/**
 * Inject TOC page numbers by querying Paged.js internal page structure
 * This runs after Paged.js pagination is complete
 */
export async function injectTOCPageNumbers(page) {
  const result = await page.evaluate(() => {
    // Query Paged.js pages but filter for actual content
    const allPages = document.querySelectorAll('.pagedjs_page')
    const pagedPages = Array.from(allPages).filter(pageEl => {
      const pageContent = pageEl.querySelector('.pagedjs_page_content')
      // Only count pages that have meaningful content (not just whitespace)
      return pageContent && pageContent.textContent.trim().length > 0
    })
    
    console.log(`Found ${allPages.length} total pages, ${pagedPages.length} with content`)
    
    // Build mapping of section IDs to START page numbers only
    // We'll calculate end pages based on where the next section starts
    const sectionStarts = []
    
    pagedPages.forEach((pageEl, idx) => {
      const pageNum = idx + 1
      
      // Paged.js wraps content in .pagedjs_page_content within each .pagedjs_page
      const pageContent = pageEl.querySelector('.pagedjs_page_content') || pageEl
      
      // Find all section start anchors on this page
      const startAnchors = pageContent.querySelectorAll('a[id$="-start"]')
      
      startAnchors.forEach(anchor => {
        const fullId = anchor.id
        const sectionId = fullId.replace(/-start$/, '')
        
        // Check if we've already recorded this section (only want FIRST occurrence)
        const existing = sectionStarts.find(s => s.id === sectionId)
        if (!existing) {
          sectionStarts.push({ id: sectionId, start: pageNum })
        }
      })
    })
    
    // Sort sections by start page
    sectionStarts.sort((a, b) => a.start - b.start)
    
    // Calculate end pages: each section ends one page before the next section starts
    const sectionToPage = {}
    const totalPages = pagedPages.length
    
    sectionStarts.forEach((section, idx) => {
      const nextSection = sectionStarts[idx + 1]
      const endPage = nextSection ? nextSection.start - 1 : totalPages
      
      sectionToPage[section.id] = {
        start: section.start,
        end: endPage
      }
    })
    
    console.log('Section to page mapping:', JSON.stringify(sectionToPage, null, 2))
    
    // Inject page numbers into TOC entries
    const tocEntries = document.querySelectorAll('[data-toc-target]')
    let injectedCount = 0
    let missingCount = 0
    
    tocEntries.forEach(entry => {
      const target = entry.getAttribute('data-toc-target')
      const pageSpan = entry.querySelector('.toc-pages')
      
      if (pageSpan && sectionToPage[target]) {
        const { start, end } = sectionToPage[target]
        pageSpan.textContent = start === end ? `${start}` : `${start}-${end}`
        injectedCount++
      } else if (pageSpan) {
        // Mark missing page numbers for debugging
        console.warn('Missing page number for TOC target:', target)
        pageSpan.textContent = '?'
        missingCount++
      }
    })
    
    return { 
      totalPages: pagedPages.length,
      sectionsFound: Object.keys(sectionToPage).length,
      tocEntriesInjected: injectedCount,
      tocEntriesMissing: missingCount,
      sectionMapping: sectionToPage
    }
  })
  
  console.log(`TOC page numbers injected: ${result.tocEntriesInjected} entries, ${result.tocEntriesMissing} missing, across ${result.totalPages} pages`)
  if (result.tocEntriesMissing > 0) {
    console.warn('Some TOC entries are missing page numbers. Check that section anchors exist.')
  }
  return result
}


