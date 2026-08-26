// Destructure the needed classes from the pdf-lib global object
const { PDFDocument } = PDFLib;

// UI Elements
const fileInput = document.getElementById('fileInput');
const mergeBtn = document.getElementById('mergeBtn');
const statusText = document.getElementById('statusText');

let selectedFiles = [];

// Listen for file selection
fileInput.addEventListener('change', (e) => {
    selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length > 1) {
        mergeBtn.disabled = false;
        mergeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        statusText.innerText = `${selectedFiles.length} files ready to merge.`;
    } else {
        mergeBtn.disabled = true;
        mergeBtn.classList.add('opacity-50', 'cursor-not-allowed');
        statusText.innerText = "Please select at least 2 PDFs.";
    }
});

// Execute Merge
mergeBtn.addEventListener('click', async () => {
    try {
        statusText.innerText = "Processing in memory... please wait.";
        mergeBtn.disabled = true;

        // Create a new, blank PDFDocument
        const mergedPdf = await PDFDocument.create();

        // Loop through uploaded files
        for (const file of selectedFiles) {
            // 1. Read the file into an ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            
            // 2. Load the binary data into pdf-lib
            const pdf = await PDFDocument.load(arrayBuffer);
            
            // 3. Copy all pages from the current PDF
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            
            // 4. Add the copied pages to our new merged document
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        // Save the merged document as a new byte array
        const mergedPdfBytes = await mergedPdf.save();

        // Trigger local download using a Blob
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'YS-Merged-Document.pdf';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        statusText.innerText = "Success! Your merged PDF has been downloaded.";
        statusText.classList.add('text-green-600');
        
    } catch (error) {
        console.error("Merge error:", error);
        statusText.innerText = "An error occurred. Check the console.";
        statusText.classList.add('text-red-600');
    } finally {
        mergeBtn.disabled = false;
    }
});
