const { PDFDocument } = PDFLib;

const fileInput = document.getElementById('fileInput');
const sequenceInput = document.getElementById('sequenceInput');
const organizeBtn = document.getElementById('organizeBtn');
const statusText = document.getElementById('statusText');
const pageCountDisplay = document.getElementById('pageCountDisplay');
const pageCountSpan = document.getElementById('pageCount');

let selectedFile = null;
let totalPages = 0;

// Quick helper to read the PDF just to get the page count when uploaded
fileInput.addEventListener('change', async (e) => {
    selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    statusText.innerText = "Reading document...";
    
    try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        totalPages = pdfDoc.getPageCount();
        
        pageCountSpan.innerText = totalPages;
        pageCountDisplay.classList.remove('hidden');
        sequenceInput.disabled = false;
        statusText.innerText = "";
        checkFormValidity();
    } catch (error) {
        statusText.innerText = "Error reading PDF.";
    }
});

function checkFormValidity() {
    if (selectedFile && sequenceInput.value.trim() !== '') {
        organizeBtn.disabled = false;
        organizeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        organizeBtn.disabled = true;
        organizeBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

sequenceInput.addEventListener('input', checkFormValidity);

organizeBtn.addEventListener('click', async () => {
    try {
        statusText.innerText = "Rebuilding document... please wait.";
        statusText.className = "mt-4 text-sm text-blue-600";
        organizeBtn.disabled = true;

        // Parse the user's string: "4, 1, 2 " -> [4, 1, 2]
        const rawInput = sequenceInput.value;
        const requestedPages = rawInput.split(',')
            .map(num => parseInt(num.trim()))
            .filter(num => !isNaN(num)); // Remove any accidental non-numbers
            
        if (requestedPages.length === 0) throw new Error("Please enter a valid sequence of numbers.");
        
        // Convert to 0-based index and validate against total pages
        const pageIndices = requestedPages.map(num => {
            if (num < 1 || num > totalPages) {
                throw new Error(`Page ${num} does not exist. Document only has ${totalPages} pages.`);
            }
            return num - 1; 
        });

        // Load original and create blank destination
        const arrayBuffer = await selectedFile.arrayBuffer();
        const originalPdf = await PDFDocument.load(arrayBuffer);
        const newPdf = await PDFDocument.create();

        // Copy the requested pages in the exact order the user typed
        const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        // Save and download
        const newPdfBytes = await newPdf.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `YS-Organized-PDF.pdf`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        statusText.innerText = "Success! Your organized PDF has been downloaded.";
        statusText.className = "mt-4 text-sm text-green-600";
        
    } catch (error) {
        console.error("Organize error:", error);
        statusText.innerText = error.message || "An error occurred. Check the console.";
        statusText.className = "mt-4 text-sm text-red-600";
    } finally {
        organizeBtn.disabled = false;
    }
});
