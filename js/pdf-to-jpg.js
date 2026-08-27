// Set up the pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const fileInput = document.getElementById('fileInput');
const pageNumberInput = document.getElementById('pageNumberInput');
const convertBtn = document.getElementById('convertBtn');
const statusText = document.getElementById('statusText');
const pageCountDisplay = document.getElementById('pageCountDisplay');
const pageCountSpan = document.getElementById('pageCount');
const canvas = document.getElementById('pdfCanvas');

let pdfDocument = null;
let totalPages = 0;

// Read the PDF when uploaded
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    statusText.innerText = "Loading document engine...";
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        // Load the document via pdf.js
        pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        totalPages = pdfDocument.numPages;
        
        pageCountSpan.innerText = totalPages;
        pageCountDisplay.classList.remove('hidden');
        pageNumberInput.disabled = false;
        pageNumberInput.value = 1; // Default to page 1
        statusText.innerText = "";
        checkFormValidity();
    } catch (error) {
        console.error(error);
        statusText.innerText = "Error reading PDF for conversion.";
    }
});

function checkFormValidity() {
    const requestedPage = parseInt(pageNumberInput.value);
    if (pdfDocument && requestedPage >= 1 && requestedPage <= totalPages) {
        convertBtn.disabled = false;
        convertBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        statusText.innerText = "";
    } else {
        convertBtn.disabled = true;
        convertBtn.classList.add('opacity-50', 'cursor-not-allowed');
        if (pdfDocument) statusText.innerText = `Please enter a valid page (1 - ${totalPages}).`;
    }
}

pageNumberInput.addEventListener('input', checkFormValidity);

convertBtn.addEventListener('click', async () => {
    try {
        statusText.innerText = "Rendering image... please wait.";
        statusText.className = "mt-4 text-sm text-blue-600";
        convertBtn.disabled = true;

        const pageNum = parseInt(pageNumberInput.value);
        
        // 1. Fetch the specific page
        const page = await pdfDocument.getPage(pageNum);
        
        // 2. Set scale. 2.0 = High Resolution (retina display quality)
        const viewport = page.getViewport({ scale: 2.0 });
        
        // 3. Prepare the canvas dimensions
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // 4. Render the PDF page onto the canvas
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        await page.render(renderContext).promise;
        
        // 5. Convert canvas to JPG Data URL
        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.9); // 0.9 = 90% quality
        
        // 6. Trigger Download
        const a = document.createElement('a');
        a.href = imgDataUrl;
        a.download = `YS-Converted-Page-${pageNum}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        statusText.innerText = "Success! Your JPG has been downloaded.";
        statusText.className = "mt-4 text-sm text-green-600";
        
    } catch (error) {
        console.error("Render error:", error);
        statusText.innerText = "An error occurred during rendering. Check the console.";
        statusText.className = "mt-4 text-sm text-red-600";
    } finally {
        convertBtn.disabled = false;
    }
});
