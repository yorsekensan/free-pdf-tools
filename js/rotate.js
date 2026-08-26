// We need 'degrees' to tell pdf-lib how much to rotate
const { PDFDocument, degrees } = PDFLib;

const fileInput = document.getElementById('fileInput');
const rotationSelect = document.getElementById('rotationSelect');
const rotateBtn = document.getElementById('rotateBtn');
const statusText = document.getElementById('statusText');

let selectedFile = null;

fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        rotateBtn.disabled = false;
        rotateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        rotateBtn.disabled = true;
        rotateBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
});

rotateBtn.addEventListener('click', async () => {
    try {
        statusText.innerText = "Applying rotation... please wait.";
        statusText.className = "mt-4 text-sm text-blue-600";
        rotateBtn.disabled = true;

        // 1. Read the file
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // 2. Get the requested rotation degree from the dropdown
        const rotationAngle = parseInt(rotationSelect.value);

        // 3. Loop through every page and apply the rotation
        const pages = pdfDoc.getPages();
        pages.forEach((page) => {
            // Get current rotation in case the page is already rotated
            const currentRotation = page.getRotation().angle;
            // Apply new rotation on top of the old one
            page.setRotation(degrees(currentRotation + rotationAngle));
        });

        // 4. Save and trigger download
        const rotatedPdfBytes = await pdfDoc.save();
        const blob = new Blob([rotatedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `YS-Rotated-PDF.pdf`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        statusText.innerText = "Success! Your rotated PDF has been downloaded.";
        statusText.className = "mt-4 text-sm text-green-600";
        
    } catch (error) {
        console.error("Rotate error:", error);
        statusText.innerText = "An error occurred. Check the console.";
        statusText.className = "mt-4 text-sm text-red-600";
    } finally {
        rotateBtn.disabled = false;
    }
});
