# free-pdf-tools

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Architecture: 100% Client-Side](https://img.shields.io/badge/Architecture-100%25%20Client--Side-success)
![No Tracking](https://img.shields.io/badge/Privacy-Zero%20Data%20Leaks-brightgreen)

A completely free, browser-based PDF editor designed with absolute data privacy in mind. 

Most free PDF editors require you to upload your sensitive documents to a third-party server, exposing you to data leaks and privacy breaches. **free-pdf-tools** flips the model: the application runs entirely in your local web browser. Your files never leave your device.

## 🛡️ The "Zero Leak" Guarantee (Architecture)
This application has **no backend server**. It leverages modern browser APIs to process files in your device's local memory (RAM).
* **Zero Uploads:** Documents are read locally via the `FileReader` API.
* **Zero Storage:** Refreshing the page wipes the document from memory.
* **Zero Costs:** Hosted statically on GitHub Pages, meaning no server fees, forever.

## 🚀 Feature Roadmap

We are building this iteratively, prioritizing native file manipulation before moving to heavy visual processing.

### Phase 1: Native Manipulation (Current Focus)
Lightning-fast operations that modify the PDF binary structure directly.
- [ ] **Merge:** Combine multiple PDFs into a single document.
- [ ] **Split:** Extract specific pages or separate a PDF into multiple files.
- [ ] **Rotate:** Rotate individual pages or the entire document.
- [ ] **Delete Pages:** Remove unwanted pages effortlessly.

### Phase 2: Visual & Image Processing (Planned)
Canvas-based operations for visual modifications.
- [ ] Add Watermarks (Text/Image).
- [ ] PDF to JPG / JPG to PDF conversion.

### Phase 3: Complex Conversion (Exploratory)
- [ ] OCR (Optical Character Recognition) via client-side WebAssembly.

## 🛠️ Tech Stack
To keep the footprint lightweight and dependency-free, we use static frontend technologies:
* **UI/Styling:** HTML5, Vanilla JavaScript, Tailwind CSS (via CDN).
* **PDF Rendering:** [`pdf.js`](https://mozilla.github.io/pdf.js/) by Mozilla.
* **PDF Manipulation:** [`pdf-lib`](https://pdf-lib.js.org/) for modifying PDF structures in memory.
* **Hosting:** GitHub Pages.

## ☁️ 100% Online Development

This project is built and maintained entirely in the cloud. You don't need to clone the repository or set up a local environment to contribute.

1. **Edit in Browser:** Navigate to this repository on GitHub and press the `.` (period) key on your keyboard. This opens the lightweight GitHub Web Editor (VS Code in the browser).
2. **Make Changes:** Write your HTML, JS, or CSS directly in the web editor.
3. **Commit & Push:** Use the built-in source control tab to commit your changes directly to the `main` branch.
4. **Auto-Deploy:** GitHub Pages will automatically detect the changes and deploy the latest version of the static site within minutes.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Since our core philosophy is privacy and speed, any pull requests must strictly adhere to the client-side-only architecture rule. No external API calls for document processing will be accepted.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
