const { PDFDocument } = PDFLib;

const fileInput = document.getElementById('fileInput');
const startPageInput = document.getElementById('startPage');
const endPageInput = document.getElementById('endPage');
const splitBtn = document.getElementById('splitBtn');
const statusText = document.getElementById('statusText');

let selectedFile = null;

// Enable button only if a file is selected and range is entered
function checkFormValidity() {
    if (selectedFile && startPageInput.value && endPageInput.value) {
        splitBtn.disabled = false;
        splitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        splitBtn.disabled = true;
        splitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    checkFormValidity();
});

startPageInput.addEventListener('input', checkFormValidity);
endPageInput.addEventListener('input', checkFormValidity);

splitBtn.addEventListener('click', async () => {
    try {
        statusText.innerText = "Extracting pages... please wait.";
        statusText.className = "mt-4 text-sm text-blue-600";
        splitBtn.disabled = true;

        // 1. Read the original file
        const arrayBuffer = await selectedFile.arrayBuffer();
        const originalPdf = await PDFDocument.load(arrayBuffer);
        
        // 2. Validate page range
        const totalPages = originalPdf.getPageCount();
        let start = parseInt(startPageInput.value);
        let end = parseInt(endPageInput.value);
        
        if (start < 1 || end > totalPages || start > end) {
            throw new Error(`Invalid range. Document has ${totalPages} pages.`);
        }

        // 3. Create a new document for the extracted pages
        const newPdf = await PDFDocument.create();

        // 4. Generate the array of indices to extract (adjusting for 0-based index)
        // Example: User wants pages 1 to 3 -> we need indices [0, 1, 2]
        const pageIndices = [];
        for (let i = start - 1; i < end; i++) {
            pageIndices.push(i);
        }

        // 5. Copy and add pages
        const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        // 6. Save and trigger download
        const newPdfBytes = await newPdf.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `YS-Split-Pages-${start}-${end}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        statusText.innerText = "Success! Your split PDF has been downloaded.";
        statusText.className = "mt-4 text-sm text-green-600";
        
    } catch (error) {
        console.error("Split error:", error);
        statusText.innerText = error.message || "An error occurred. Check the console.";
        statusText.className = "mt-4 text-sm text-red-600";
    } finally {
        splitBtn.disabled = false;
    }
});
