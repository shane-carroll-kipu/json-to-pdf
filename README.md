# JSON to PDF Medical Record Converter

A Vue.js web application for converting structured JSON medical records into professional, paginated PDF documents with table of contents and dynamic headers.

## Features

- **Table of Contents with Page Numbers**: Automatically generated TOC with accurate page numbers and page ranges for multi-page documents
- **Dynamic Section Headers**: Each section displays its own title in the header using Paged.js
- **Automatic Pagination**: Paged.js polyfill handles page breaks and pagination automatically
- **Server-Side PDF Generation**: Uses Puppeteer for high-performance, reliable PDF generation
- **Fast Performance**: ~5-6 seconds for 180+ page documents
- **No Print Dialog**: PDFs download directly without user interaction

## Technology Stack

- **Frontend**: Vue 3, Vite
- **Backend**: Express.js, Puppeteer
- **PDF Engine**: Paged.js polyfill for pagination, Puppeteer for rendering
- **Styling**: CSS with `@page` rules for print-specific layouts

## Architecture

### Frontend (Vue + Vite)

The frontend is responsible for:
- File upload interface
- JSON parsing and data processing
- Rendering PDF template components
- Sending HTML to server for PDF generation

**Key Files**:
- `src/App.vue` - Main application logic, file upload, PDF generation orchestration
- `src/components/PdfTemplate.vue` - PDF template orchestrator, renders all sections
- `src/components/pdf/*.vue` - Individual section components (patient info, medications, etc.)
- `src/styles/print.css` - Print-specific CSS with `@page` rules and TOC styling

### Backend (Express + Puppeteer)

The backend handles:
- PDF generation via Puppeteer
- Serving Paged.js polyfill locally
- TOC page number injection after pagination
- Browser instance pooling for performance

**Key Files**:
- `server.js` - Express API server with `/api/generate-pdf` endpoint
- `src/services/puppeteerGenerator.js` - Core PDF generation and TOC injection logic
- `src/services/pdfService.js` - Frontend service abstraction for calling the API

### PDF Generation Flow

1. **User uploads JSON** → Vue parses and renders PDF template
2. **Frontend extracts HTML** → Captures rendered content and print CSS
3. **Send to server** → POST request to `/api/generate-pdf` with HTML content
4. **Puppeteer renders** → Server loads HTML with Paged.js polyfill
5. **Paged.js paginates** → Polyfill automatically runs and creates paginated layout
6. **Inject TOC numbers** → Server-side script fills in page numbers and ranges
7. **Generate PDF** → Puppeteer converts final HTML to PDF
8. **Download** → PDF blob returned to frontend and auto-downloaded

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd "JSON to PDF"

# Install dependencies
npm install

# Start both servers (frontend + backend)
npm run dev:all
```

This will start:
- Vite dev server on `http://localhost:3000`
- PDF generation server on `http://localhost:3001`

### Alternative: Run Servers Separately

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - PDF Server:**
```bash
npm run server
```

## Usage

1. Open `http://localhost:3000` in your browser
2. Click the upload area or drag-and-drop a JSON file (e.g., `response.json`)
3. Click "Convert to PDF"
4. Wait for generation to complete (~5-6 seconds for large documents)
5. PDF will automatically download

## Technical Details

### Paged.js Integration

The application uses Paged.js polyfill for automatic pagination:

- **Served locally**: `/pagedjs` endpoint serves the polyfill from `node_modules`
- **Automatic execution**: Polyfill runs automatically when loaded, no manual initialization
- **Detection**: Frontend polls for `.pagedjs_pages` container to detect completion
- **Timeout**: 30-second safety timeout in case of failures

```javascript
// Frontend waits for Paged.js completion
var checkInterval = setInterval(function() {
  var pagedContainer = document.querySelector('.pagedjs_pages');
  if (pagedContainer) {
    var pages = pagedContainer.querySelectorAll('.pagedjs_page');
    if (pages.length > 0) {
      window._pdfReady = true;
      clearInterval(checkInterval);
    }
  }
}, 100);
```

### Table of Contents Generation

TOC page numbers are injected server-side after Paged.js completes pagination:

1. **Section anchors**: Each section has a `<a id="section-name-start"></a>` anchor
2. **Page detection**: Server script queries all `.pagedjs_page` elements
3. **Filter empty pages**: Only pages with actual content are counted
4. **Calculate ranges**: Start page from anchor, end page from next section's start - 1
5. **Inject numbers**: Fill in `.toc-pages` spans with calculated page numbers

```javascript
// Example TOC entry
<div class="toc-entry" data-toc-target="patient-info">
  <span class="toc-title">Patient Information</span>
  <span class="toc-dots"></span>
  <span class="toc-pages"></span> <!-- Filled by server -->
</div>
```

### Page Number Detection

The system filters out empty Paged.js artifact pages:

```javascript
const pagedPages = Array.from(allPages).filter(pageEl => {
  const pageContent = pageEl.querySelector('.pagedjs_page_content')
  return pageContent && pageContent.textContent.trim().length > 0
})
```

This ensures accurate page counts (e.g., 181 actual pages instead of 360 total Paged.js pages).

### Dynamic Headers

CSS `@page` rules define different headers for different sections:

```css
@page toc {
  @top-center {
    content: "Table of Contents";
    font-size: 12pt;
    font-weight: bold;
  }
  @top-right {
    content: "Page " counter(page);
    font-size: 10pt;
  }
}

.toc-section {
  page: toc;
}
```

### Performance Optimizations

- **Browser singleton**: Reuses single Puppeteer browser instance across requests
- **Retry logic**: Exponential backoff for failed PDF generations
- **Network idle wait**: Ensures Paged.js script fully loads before pagination
- **120-second timeout**: Accommodates large documents with thousands of pages

## Project Structure

```
├── src/
│   ├── App.vue                     # Main application
│   ├── main.js                     # Vue app entry point
│   ├── style.css                   # General styles
│   ├── components/
│   │   ├── PdfTemplate.vue         # PDF orchestrator
│   │   └── pdf/                    # Section components
│   │       ├── PdfTableOfContents.vue
│   │       ├── PdfPatientInfo.vue
│   │       ├── PdfInsurance.vue
│   │       ├── PdfContacts.vue
│   │       ├── PdfMedications.vue
│   │       ├── PdfMAR.vue
│   │       ├── PdfAssessments.vue
│   │       ├── PdfGroupSessions.vue
│   │       ├── PdfConsentForms.vue
│   │       └── PdfEvaluations.vue
│   ├── services/
│   │   ├── pdfService.js           # API client for PDF generation
│   │   └── puppeteerGenerator.js   # Core PDF generation logic
│   └── styles/
│       └── print.css               # Print CSS with @page rules
├── server.js                       # Express API server
├── index.html                      # HTML entry point
├── package.json                    # Dependencies and scripts
├── vite.config.js                  # Vite configuration
└── response.json                   # Sample medical record data
```

## API Reference

### POST /api/generate-pdf

Generate PDF from HTML content.

**Request:**
```json
{
  "htmlContent": "<html>...</html>",
  "filename": "medical_record.pdf"
}
```

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="medical_record.pdf"`
- Body: PDF binary data

**Query Parameters:**
- `debug=1` - Returns HTML instead of PDF for debugging

**Error Response:**
```json
{
  "error": "Failed to generate PDF",
  "message": "Error details..."
}
```

### GET /health

Check server and browser status.

**Response:**
```json
{
  "status": "ok",
  "browserConnected": true
}
```

## Development Notes

- **Port 3000**: Frontend Vite dev server
- **Port 3001**: Backend PDF generation server
- **Browser console**: Shows Paged.js pagination progress
- **Server logs**: Display TOC injection metrics and timing

### Debugging

**Enable debug HTML output:**
```bash
curl 'http://localhost:3001/api/generate-pdf?debug=1' \
  -H 'Content-Type: application/json' \
  --data '{"htmlContent":"<html>...</html>","filename":"test.pdf"}' \
  -o debug.html
```

**Check server health:**
```bash
curl http://localhost:3001/health
```

**View server logs:**
```bash
npm run server
# Watch for:
# - "Paged.js pagination completed in Xms"
# - "TOC page numbers injected: X entries, Y missing, across Z pages"
# - "PDF generated successfully"
```

## Troubleshooting

### Server Won't Start

**Issue**: Port 3001 already in use

**Solution**:
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9

# Or change port in server.js
const PORT = 3002
```

### PDF Not Generating

**Issue**: Server not running or unreachable

**Check**:
```bash
# Test server health
curl http://localhost:3001/health

# Check server logs
npm run server
```

### Missing Page Numbers in TOC

**Issue**: Section anchors not found

**Check**:
- Ensure each section has `<a id="section-name-start"></a>` anchor
- Verify `data-toc-target` matches anchor ID (without `-start` suffix)
- Check server logs for "Missing page number for TOC target" warnings

### Styles Not Applied

**Issue**: CSS not loading properly

**Solution**: Ensure Vite dev server is running so `/src/styles/print.css` is accessible

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
