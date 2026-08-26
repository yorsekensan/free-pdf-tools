# free-pdf-tools

A completely free, browser-based PDF editor designed with absolute data privacy in mind. 

Most free PDF editors require you to upload your sensitive documents to a third-party server, exposing you to data leaks and privacy breaches. **FREE-PDF-TOOLS** flips the model: the application runs entirely in your local web browser. Your files never leave your device.

## 🛡️ The "Zero Leak" Guarantee (Architecture)
This application has **no backend server**. It leverages modern browser APIs and WebAssembly to process files in your device's local memory (RAM).
* **Zero Uploads:** Documents are read locally via the `FileReader` API.
* **Zero Storage:** Refreshing the page wipes the document from memory.
* **Zero Costs:** Hosted statically, meaning no server fees, forever.

## 🚀 Feature Roadmap

We are building this iteratively, prioritizing native file manipulation before moving to heavy visual processing.

### Phase 1: Native Manipulation (Current Focus)
Lightning-fast operations that modify the PDF binary structure directly.
- [ ] **Merge:** Combine multiple PDFs into a single document.
- [ ] **Split:** Extract specific pages or separate a PDF into multiple files.
- [ ] **Rotate:** Rotate individual pages or the entire document.
- [ ] **Delete Pages:** Remove unwanted pages effortlessly.
- [ ] **Protect/Unlock:** Add or remove password encryption.

### Phase 2: Visual & Image Processing (Planned)
Canvas-based operations for visual modifications.
- [ ] Add Watermarks (Text/Image).
- [ ] PDF to JPG / JPG to PDF conversion.
- [ ] Add basic text annotations.

### Phase 3: Complex Conversion (Exploratory)
- [ ] OCR (Optical Character Recognition) via client-side WebAssembly.

## 🛠️ Tech Stack
To keep the footprint lightweight and dependency-free, we use static frontend technologies:
* **UI/Styling:** HTML5, Vanilla JavaScript, Tailwind CSS (via CDN).
* **PDF Rendering:** [`pdf.js`](https://mozilla.github.io/pdf.js/) by Mozilla.
* **PDF Manipulation:** [`pdf-lib`](https://pdf-lib.js.org/) for modifying PDF structures in memory.
* **Hosting:** GitHub Pages.

## 💻 Local Development

Since this is a 100% client-side application, getting started is incredibly simple. No databases or Node.js backends to configure.
