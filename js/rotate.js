pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const { PDFDocument, degrees } = PDFLib;

const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const thumbnailGrid = document.getElementById('thumbnailGrid');
const saveBtn = document.getElementById('saveBtn');
const statusText = document.getElementById('statusText');

let originalPdfBytes = null;
let pageRotations = []; // Stores rotation state for each page

// UI Triggers
uploadZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => loadDocument(e.target.files[0]));

async function loadDocument(file) {
    if (!file) return;
    statusText.innerText = "Rendering thumbnails...";
    uploadZone.classList.add('hidden');
    thumbnailGrid.classList.remove('hidden');
    thumbnailGrid.innerHTML = '';
    saveBtn.classList.remove('hidden');
    saveBtn.disabled = true;
    
    try {
        originalPdfBytes = await file.arrayBuffer();
        const pdfData = await pdfjsLib.getDocument({ data: originalPdfBytes }).promise;
        const totalPages = pdfData.numPages;
        
        pageRotations = new Array(totalPages).fill(0); // Initialize all at 0 degrees

        // Render each page
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdfData.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 }); // Low scale for quick thumbnail rendering
            
            // Container for visual rotation logic
            const container = document.createElement('div');
            container.className = "relative flex flex-col items-center justify-center p-2 border rounded bg-gray-50 shadow-sm";
            
            const canvas = document.createElement('canvas');
            canvas.className = "transition-transform duration-300 ease-in-out shadow";
            const ctx = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;

            // Rotation Button
            const rotateBtn = document.createElement('button');
            rotateBtn.innerHTML = "↻ Rotate";
            rotateBtn.className = "absolute bottom-2 bg-black bg-opacity-75 text-white text-xs px-3 py-1 rounded hover:bg-opacity-100 z-10";
            
            // Update state and visual CSS when clicked
            rotateBtn.onclick = () => {
                pageRotations[i - 1] = (pageRotations[i - 1] + 90) % 360;
                canvas.style.transform = `rotate(${pageRotations[i - 1]}deg)`;
            };

            container.appendChild(canvas);
            container.appendChild(rotateBtn);
            thumbnailGrid.appendChild(container);
        }
        
        statusText.innerText = "";
        saveBtn.disabled = false;

    } catch (error) {
        console.error("Render error:", error);
        statusText.innerText = "Error loading document for thumbnails.";
    }
}

saveBtn.addEventListener('click', async () => {
    try {
        saveBtn.disabled = true;
        statusText.innerText = "Applying rotations... please wait.";
        
        // Load the original binary data into pdf-lib
        const pdfDoc = await PDFDocument.load(originalPdfBytes);
        const pages = pdfDoc.getPages();

        // Apply tracked rotations
        pages.forEach((page, index) => {
            const rotationToAdd = pageRotations[index];
            if (rotationToAdd !== 0) {
                const currentRotation = page.getRotation().angle;
                page.setRotation(degrees(currentRotation + rotationToAdd));
            }
        });

        const newPdfBytes = await pdfDoc.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `YS-Custom-Rotated.pdf`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        statusText.innerText = "Success! Document saved.";
        statusText.className = "mt-4 text-sm text-green-600";
        
    } catch (error) {
        console.error("Save error:", error);
        statusText.innerText = "An error occurred while saving.";
    } finally {
        saveBtn.disabled = false;
    }
});
