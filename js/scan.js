const { PDFDocument } = PDFLib;

const cameraBtn = document.getElementById('cameraBtn');
const cameraInput = document.getElementById('cameraInput');
const galleryBtn = document.getElementById('galleryBtn');
const galleryInput = document.getElementById('galleryInput');
const fileList = document.getElementById('fileList');
const ocrToggle = document.getElementById('ocrToggle');
const buildBtn = document.getElementById('buildBtn');
const btnText = document.getElementById('btnText');
const statusText = document.getElementById('statusText');

let selectedFiles = [];

cameraBtn.addEventListener('click', () => cameraInput.click());
galleryBtn.addEventListener('click', () => galleryInput.click());
cameraInput.addEventListener('change', (e) => handleFiles(e.target.files));
galleryInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleFiles(files) {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    selectedFiles = [...selectedFiles, ...validFiles];
    renderFileList();
    checkValidity();
    cameraInput.value = '';
    galleryInput.value = '';
}

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
                <span class="truncate pr-4">Scan_${index + 1}.${file.type.split('/')[1] || 'jpg'}</span>
                <button onclick="removeFile(${index})" class="text-red-500 font-bold px-2">&times;</button>
            `;
            fileList.appendChild(li);
        });
    } else {
        fileList.classList.add('hidden');
    }
}

function checkValidity() {
    if (selectedFiles.length > 0) {
        buildBtn.disabled = false;
        buildBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        buildBtn.disabled = true;
        buildBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

buildBtn.addEventListener('click', async () => {
    const useOCR = ocrToggle.checked;
    
    try {
        buildBtn.disabled = true;
        btnText.innerText = "Processing...";
        
        const masterPdf = await PDFDocument.create();

        if (useOCR) {
            // --- PHASE 3: AI OCR PATH (v5 Fixed) ---
            statusText.innerText = "Initializing AI Engine (Fast Model)...";
            
            // 1. Create worker using strict v5 syntax and reliable CDN paths
            const worker = await Tesseract.createWorker('eng', 1, {
                workerPath: 'https://unpkg.com/tesseract.js@v5.0.5/dist/worker.min.js',
                langPath: 'https://tessdata.projectnaptha.com/4.0.0_fast',
                corePath: 'https://unpkg.com/tesseract.js-core@v5.0.0/tesseract-core.wasm.js',
                logger: m => {
                    if (m.status === 'recognizing text') {
                        statusText.innerText = `Scanning Text: ${Math.round(m.progress * 100)}%`;
                    }
                }
            });

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                statusText.innerText = `Processing page ${i + 1} of ${selectedFiles.length}...`;
                
                // 2. Request PDF output directly in the recognize options
                const { data } = await worker.recognize(file, { pdfTitle: "YS-Scanned-Doc" }, { pdf: true });
                
                // 3. Tesseract returns data.pdf as an array of bytes. Load it directly into pdf-lib.
                const tempPdf = await PDFDocument.load(data.pdf);
                
                // 4. Extract the page with the invisible searchable text layer and add to master
                const copiedPages = await masterPdf.copyPages(tempPdf, tempPdf.getPageIndices());
                copiedPages.forEach(page => masterPdf.addPage(page));
            }
            
            // 5. Clean up the worker memory
            await worker.terminate();

        } else {
            // --- PHASE 1: STANDARD IMAGE PATH (Flat PDF) ---
            statusText.innerText = "Building flat PDF...";
            for (const file of selectedFiles) {
                const imageBytes = await file.arrayBuffer();
                let pdfImage;
                
                if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                    pdfImage = await masterPdf.embedJpg(imageBytes);
                } else if (file.type === 'image/png') {
                    pdfImage = await masterPdf.embedPng(imageBytes);
                } else {
                    try { pdfImage = await masterPdf.embedJpg(imageBytes); } catch(e) { continue; } 
                }
                
                const { width, height } = pdfImage.scale(1);
                const page = masterPdf.addPage([width, height]);
                page.drawImage(pdfImage, { x: 0, y: 0, width, height });
            }
        }

        // Export logic (Shared by both paths)
        statusText.innerText = "Finalizing document...";
        const pdfBytes = await masterPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = useOCR ? 'YS-Searchable-Scan.pdf' : 'YS-Flat-Scan.pdf';
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        statusText.innerText = "Success! Document saved.";
        statusText.className = "mt-4 text-sm text-teal-600 font-bold";
        
    } catch (error) {
        console.error("Scanner Error:", error);
        statusText.innerText = "An error occurred. Check the console.";
        statusText.className = "mt-4 text-sm text-red-600";
    } finally {
        buildBtn.disabled = false;
        btnText.innerText = "Build PDF";
        selectedFiles = [];
        renderFileList();
        checkValidity();
    }
});
