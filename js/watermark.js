const { PDFDocument, StandardFonts, rgb, degrees } = PDFLib;

const fileInput = document.getElementById('fileInput');
const watermarkInput = document.getElementById('watermarkInput');
const watermarkBtn = document.getElementById('watermarkBtn');
const statusText = document.getElementById('statusText');

let selectedFile = null;

function checkFormValidity() {
    if (selectedFile && watermarkInput.value.trim() !== '') {
        watermarkBtn.disabled = false;
        watermarkBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        watermarkBtn.disabled = true;
        watermarkBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    checkFormValidity();
});

watermarkInput.addEventListener('input', checkFormValidity);

watermarkBtn.addEventListener('click', async () => {
    try {
        statusText.innerText = "Applying watermark... please wait.";
        statusText.className = "mt-4 text-sm text-blue-600";
        watermarkBtn.disabled = true;

        // 1. Read file and load font
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        const textToStamp = watermarkInput.value.trim();
        const textSize = 60;

        // 2. Loop through every page
        const pages = pdfDoc.getPages();
        pages.forEach((page) => {
            const { width, height } = page.getSize();
            
            // Calculate text dimensions to find the exact center
            const textWidth = helveticaFont.widthOfTextAtSize(textToStamp, textSize);
            const textHeight = helveticaFont.heightAtSize(textSize);
            
            // 3. Draw text diagonally in the center
            page.drawText(textToStamp, {
                x: width / 2 - textWidth / 2,
                y: height / 2 - textHeight / 2,
                size: textSize,
                font: helveticaFont,
                color: rgb(0.8, 0.2, 0.2), // Faded Red
                opacity: 0.3,              // 30% transparency
                rotate: degrees(45),
            });
        });

        // 4. Save and Download
        const modifiedPdfBytes = await pdfDoc.save();
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `YS-Watermarked.pdf`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        statusText.innerText = "Success! Your watermarked PDF has been downloaded.";
        statusText.className = "mt-4 text-sm text-green-600";
        
    } catch (error) {
        console.error("Watermark error:", error);
        statusText.innerText = "An error occurred. Check the console.";
        statusText.className = "mt-4 text-sm text-red-600";
    } finally {
        watermarkBtn.disabled = false;
    }
});
