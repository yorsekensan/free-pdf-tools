const { PDFDocument } = PDFLib;

const cameraBtn = document.getElementById('cameraBtn');
const cameraInput = document.getElementById('cameraInput');
const galleryBtn = document.getElementById('galleryBtn');
const galleryInput = document.getElementById('galleryInput');
const fileList = document.getElementById('fileList');
const buildBtn = document.getElementById('buildBtn');
const btnText = document.getElementById('btnText');
const loadingSpinner = document.getElementById('loadingSpinner');
const statusText = document.getElementById('statusText');

let selectedFiles = [];

// --- Input Triggers ---
cameraBtn.addEventListener('click', () => cameraInput.click());
galleryBtn.addEventListener('click', () => galleryInput.click());

cameraInput.addEventListener('change', (e) => handleFiles(e.target.files));
galleryInput.addEventListener('change', (e) => handleFiles(e.target.files));

// --- UI Management ---
function handleFiles(files) {
    // Mobile cameras sometimes drop extensions; we assume valid image formats
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    selectedFiles = [...selectedFiles, ...validFiles];
    renderFileList();
    checkValidity();
    
    // Reset inputs so the same file/photo can be triggered again if needed
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
                <button onclick="removeFile(${index})" class="text-red-500 hover:text-red-700 font-bold px-2">&times;</button>
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
        statusText.innerText = "";
    } else {
        buildBtn.disabled = true;
        buildBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

// --- PDF Generation ---
buildBtn.addEventListener('click', async () => {
    try {
        buildBtn.disabled = true;
        buildBtn.classList.add('opacity-75');
        loadingSpinner.classList.remove('hidden');
        btnText.innerText = "Processing...";
        statusText.innerText = "";

        const pdfDoc = await PDFDocument.create();

        for (const file of selectedFiles) {
            const imageBytes = await file.arrayBuffer();
            let pdfImage;
            
            // Note: Most mobile captures default to JPEG. If iOS captures in HEIC, 
            // native Safari usually converts it to JPEG on upload when accept="image/*".
            if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                pdfImage = await pdfDoc.embedJpg(imageBytes);
            } else if (file.type === 'image/png') {
                pdfImage = await pdfDoc.embedPng(imageBytes);
            } else {
                // Fallback attempt as JPG for unknown raw image types
                try { pdfImage = await pdfDoc.embedJpg(imageBytes); } 
                catch(e) { continue; } 
            }
            
            const { width, height } = pdfImage.scale(1);
            const page = pdfDoc.addPage([width, height]);
            page.drawImage(pdfImage, { x: 0, y: 0, width, height });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'YS-Scanned-Document.pdf';
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        statusText.innerText = "Success! Scanned document saved.";
        statusText.className = "mt-4 text-sm text-teal-600";
        
    } catch (error) {
        console.error("Build error:", error);
        statusText.innerText = "An error occurred. Make sure your browser isn't blocking large image processing.";
        statusText.className = "mt-4 text-sm text-red-600";
    } finally {
        buildBtn.disabled = false;
        buildBtn.classList.remove('opacity-75');
        loadingSpinner.classList.add('hidden');
        btnText.innerText = "Build PDF";
        selectedFiles = [];
        renderFileList();
        checkValidity();
    }
});
