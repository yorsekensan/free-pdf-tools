const { PDFDocument } = PDFLib;

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const mergeBtn = document.getElementById('mergeBtn');
const btnText = document.getElementById('btnText');
const loadingSpinner = document.getElementById('loadingSpinner');
const statusText = document.getElementById('statusText');

let selectedFiles = [];

// --- Drag and Drop Logic ---

// Click the hidden input when the zone is clicked
dropZone.addEventListener('click', () => fileInput.click());

// Highlight drop zone when dragging over
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-blue-400', 'bg-blue-50');
});

// Remove highlight when leaving
dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-blue-400', 'bg-blue-50');
});

// Handle dropped files
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-blue-400', 'bg-blue-50');
    handleFiles(e.dataTransfer.files);
});

// Handle files selected via click
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// --- File Preview Logic ---

function handleFiles(files) {
    // Filter out non-PDFs and add to our array
    const validFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    selectedFiles = [...selectedFiles, ...validFiles];
    renderFileList();
    checkValidity();
}

// Function to remove a file from the array via the UI
window.removeFile = function(index) {
    selectedFiles.splice(index, 1);
    renderFileList();
    checkValidity();
};

function renderFileList() {
    fileList.innerHTML = '';
    if (selectedFiles.length > 0) {
        fileList.classList.remove('hidden');
        selectedFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center bg-gray-50 p-2 rounded border";
            li.innerHTML = `
                <span class="truncate pr-4">${file.name}</span>
                <button onclick="removeFile(${index})" class="text-red-500 hover:text-red-700 font-bold px-2">&times;</button>
            `;
            fileList.appendChild(li);
        });
    } else {
        fileList.classList.add('hidden');
    }
}

function checkValidity() {
    if (selectedFiles.length > 1) {
        mergeBtn.disabled = false;
        mergeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        statusText.innerText = "";
    } else {
        mergeBtn.disabled = true;
        mergeBtn.classList.add('opacity-50', 'cursor-not-allowed');
        statusText.innerText = selectedFiles.length === 1 ? "Please add at least one more PDF to merge." : "";
    }
}

// --- Loading State & Execution Logic ---

mergeBtn.addEventListener('click', async () => {
    try {
        // UI Loading State
        mergeBtn.disabled = true;
        mergeBtn.classList.add('opacity-75');
        loadingSpinner.classList.remove('hidden');
        btnText.innerText = "Processing...";
        statusText.innerText = "";

        const mergedPdf = await PDFDocument.create();

        for (const file of selectedFiles) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'YS-Merged-Document.pdf';
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        statusText.innerText = "Success! Document merged.";
        statusText.className = "mt-4 text-sm text-green-600";
        
    } catch (error) {
        console.error("Merge error:", error);
        statusText.innerText = "An error occurred. Check the console.";
        statusText.className = "mt-4 text-sm text-red-600";
    } finally {
        // Reset UI State
        mergeBtn.disabled = false;
        mergeBtn.classList.remove('opacity-75');
        loadingSpinner.classList.add('hidden');
        btnText.innerText = "Merge PDFs";
        
        // Clear the workspace
        selectedFiles = [];
        renderFileList();
        checkValidity();
    }
});
