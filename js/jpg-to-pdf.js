const { PDFDocument } = PDFLib;

const fileInput = document.getElementById('fileInput');
const convertBtn = document.getElementById('convertBtn');
const statusText = document.getElementById('statusText');

let selectedFiles = [];

fileInput.addEventListener('change', (e) => {
    selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
        convertBtn.disabled = false;
        convertBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        statusText.innerText = `${selectedFiles.length} image(s) ready.`;
    } else {
        convertBtn.disabled = true;
        convertBtn.classList.add('opacity-50', 'cursor-not-allowed');
        statusText.innerText = "";
    }
});

convertBtn.addEventListener('click', async () => {
    try {
        statusText.innerText = "Building PDF... please wait.";
        statusText.className = "mt-4 text-sm text-blue-600";
        convertBtn.disabled = true;

        // 1. Create a blank PDF
        const pdfDoc = await PDFDocument.create();

        // 2. Loop through each uploaded image
        for (const file of selectedFiles) {
            const imageBytes = await file.arrayBuffer();
            let pdfImage;
            
            // Embed based on file type
            if (file.type === 'image/jpeg') {
                pdfImage = await pdfDoc.embedJpg(imageBytes);
            } else if (file.type === 'image/png') {
                pdfImage = await pdfDoc.embedPng(imageBytes);
            } else {
                continue; // Skip unsupported formats
            }
            
            // 3. Get image dimensions
            const { width, height } = pdfImage.scale(1);
            
            // 4. Add a blank page matching the image dimensions
            const page = pdfDoc.addPage([width, height]);
            
            // 5. Draw the image to fill the page
            page.drawImage(pdfImage, {
                x: 0,
                y: 0,
                width: width,
                height: height,
            });
        }

        // 6. Save and Download
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'YS-Images.pdf';
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        statusText.innerText = "Success! Your PDF has been downloaded.";
        statusText.className = "mt-4 text-sm text-green-600";
        
    } catch (error) {
        console.error("Conversion error:", error);
        statusText.innerText = "An error occurred. Check the console.";
        statusText.className = "mt-4 text-sm text-red-600";
    } finally {
        convertBtn.disabled = false;
    }
});
