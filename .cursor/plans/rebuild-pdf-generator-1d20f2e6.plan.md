<!-- 1d20f2e6-68cf-4ca2-a25e-a75cb6931f54 91fb842d-84d2-4fa7-a967-20ee042b781d -->
# Migrate to Puppeteer for Dynamic Section Headers

## Overview
Replace pdfmake with Puppeteer to enable true section-aware dynamic headers using CSS `@page` rules. Architecture will support client-side POC with server-side migration path.

## Phase 1: Setup & Dependencies

### Install Puppeteer
- Add `puppeteer` package for server-side usage
- For client-side POC, use browser's print API with CSS print styles (no Puppeteer install needed for now)
- Keep architecture Puppeteer-ready for easy server migration

### Create PDF Service Abstraction
- Create `src/services/pdfService.js` with two implementations:
  - `ClientPrintService` - uses `window.print()` with CSS
  - `PuppeteerService` - for future server-side (stub for now)
- Both implement same interface: `generatePDF(htmlContent, options)`

## Phase 2: HTML Template System

### Create Vue PDF Template Component
- Create `src/components/PdfTemplate.vue`
- Props: `patientData` (same JSON structure as current)
- Sections as child components:
  - `PdfTableOfContents.vue`
  - `PdfPatientInfo.vue`
  - `PdfInsurance.vue`
  - `PdfContacts.vue`
  - `PdfMedications.vue`
  - `PdfMAR.vue`
  - `PdfAssessments.vue`
  - `PdfGroupSessions.vue`
  - `PdfConsentForms.vue`
  - `PdfEvaluations.vue`

### Add Print Styles
- Create `src/styles/print.css` with:
  - `@page` rules for each section type
  - Running headers with section titles
  - Page break rules
  - Professional medical document styling
  - Header: patient name, MR, DOB, diagnosis, section title, page numbers

## Phase 3: Port Existing Logic to HTML/CSS

### Convert Section Builders
- Port each `build*Section()` method to corresponding Vue component
- Use same data processing logic
- Replace pdfmake table/layout objects with HTML tables and divs
- Maintain same visual structure and information display

### Implement CSS Print Headers
```css
@page {
  margin: 1in 0.5in;
  @top-left { content: "Patient Name: " var(--patient-name); }
  @top-right { content: "Page " counter(page); }
}

@page toc {
  @top-center { content: "Table of Contents"; }
}

@page patient-info {
  @top-center { content: "Patient Information"; }
}
```

### Style Tables and Content
- Convert pdfmake table styles to CSS table styling
- Ensure consistent fonts, spacing, colors
- Add print-specific media queries

## Phase 4: Integration

### Update App.vue
- Remove pdfmake import and generator
- Add hidden print container that holds `PdfTemplate` component
- On "Generate PDF":
  - Render `PdfTemplate` with patient data
  - Trigger browser print dialog (client-side POC)
  - Or call `pdfService.generatePDF()` (abstracted for future)

### Handle Print Dialog
- Use `window.print()` for immediate client-side demo
- User can "Save as PDF" from browser print dialog
- Add option to auto-download (requires additional library like `html2pdf.js` or `jsPDF` + `html2canvas`)

## Phase 5: Future Server-Side Path (Documentation Only)

### Server Migration Notes
- Install `puppeteer` on Node.js server
- Implement `PuppeteerService`:
  ```js
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(htmlContent)
  const pdf = await page.pdf({ format: 'A4', printBackground: true })
  ```
- Add API endpoint: `POST /api/generate-pdf`
- Browser pool for concurrent generation

## Key Files to Modify/Create

- `package.json` - dependencies (optional puppeteer for now)
- `src/services/pdfService.js` - new abstraction layer
- `src/components/PdfTemplate.vue` - main template
- `src/components/pdf/*.vue` - section components
- `src/styles/print.css` - all print styling
- `src/App.vue` - integrate new print system
- Remove: `src/pdfGenerator.js` (old pdfmake code)

## Benefits Achieved

✅ Dynamic section-aware headers (CSS running headers)
✅ Flexible header layout (any HTML/CSS)
✅ Fast generation (browser print engine)
✅ Professional output (full CSS control)
✅ Easy to iterate (HTML/CSS vs programmatic)
✅ Server-ready architecture (swap print → Puppeteer)
✅ No PDF generation delay in client POC (instant print dialog)

### To-dos

- [ ] Create src/services/pdfService.js with ClientPrintService implementation
- [ ] Create src/styles/print.css with @page rules and section-specific headers
- [ ] Create src/components/PdfTemplate.vue as main container component
- [ ] Create src/components/pdf/PdfTableOfContents.vue
- [ ] Create src/components/pdf/PdfPatientInfo.vue (port from buildPatientInformation)
- [ ] Create src/components/pdf/PdfInsurance.vue (port from buildInsuranceSection)
- [ ] Create src/components/pdf/PdfContacts.vue (port from buildContactsSection)
- [ ] Create src/components/pdf/PdfMedications.vue (port from buildMedicationsSection)
- [ ] Create src/components/pdf/PdfMAR.vue (port from buildMARSection)
- [ ] Create src/components/pdf/PdfAssessments.vue (port from buildAssessmentsSection)
- [ ] Create src/components/pdf/PdfGroupSessions.vue (port from buildGroupSessionsSection)
- [ ] Create src/components/pdf/PdfConsentForms.vue (port from buildConsentForms)
- [ ] Create src/components/pdf/PdfEvaluations.vue (port from buildEvaluations)
- [ ] Update App.vue to use new PDF template and print service
- [ ] Test complete PDF generation with response.json, verify headers appear correctly on each page