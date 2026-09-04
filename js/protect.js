const { PDFDocument } = PDFLib;

const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const lockSection = document.getElementById('lockSection');
const unlockSection = document.getElementById('unlockSection');

const newPassword = document.getElementById('newPassword');
const lockBtn = document.getElementById('lockBtn');

const currentPassword = document.getElementById('currentPassword');
const unlockBtn = document.getElementById('unlockBtn');

const statusText = document.getElementById('statusText');

let rawBuffer = null;
let isEncrypted = false;

// --- Upload Logic ---
uploadZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    statusText.innerText = "Inspecting document security...";
    rawBuffer = await file.arrayBuffer();

    try {
        // Attempt to load. If it's encrypted, this throws an error.
        const doc = await PDFDocument.load(rawBuffer);
        
        // If it succeeds, the file is unlocked.
        isEncrypted = false;
        lockSection.classList.remove('hidden');
        unlockSection.classList.add('hidden');
        statusText.innerText = "";
        
    } catch (error) {
        // If it throws an error containing "encrypted", trigger unlock UI
        if (error.message.includes('encrypted')) {
            isEncrypted = true;
            lockSection.classList.add('hidden');
            unlockSection.classList.remove('hidden');
            statusText.innerText = "";
        } else {
            statusText.innerText = "Error reading PDF structure.";
            console.error(error);
        }
    }
});

// --- Validate Inputs ---
newPassword.addEventListener('input', () => {
    if (newPassword.value.length > 0) {
        lockBtn.disabled = false;
        lockBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        lockBtn.disabled = true;
        lockBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
});

currentPassword.addEventListener('input', () => {
    if (currentPassword.value.length > 0) {
        unlockBtn.disabled = false;
        unlockBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        unlockBtn.disabled = true;
        unlockBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
});

// --- Execution Logic ---

// Lock the file
lockBtn.addEventListener('click', async () => {
    try {
        lockBtn.disabled = true;
        statusText.innerText = "Encrypting... please wait.";
        
        const doc = await PDFDocument.load(rawBuffer);
        
        // Apply standard encryption using the user's password
        // Note: By default, pdf-lib removes all permissions (printing, copying) 
        // when encrypting, making it highly secure.
        const pdfBytes = await doc.save({
            userPassword: newPassword.value,
            ownerPassword: newPassword.value,
        });

        downloadFile(pdfBytes, 'YS-Protected.pdf');
        
        statusText.innerText = "Success! Document locked.";
        statusText.className = "mt-4 text-sm text-slate-800 font-bold";
    } catch (error) {
        console.error(error);
        statusText.innerText = "Error applying encryption.";
        lockBtn.disabled = false;
    }
});

// Unlock the file
unlockBtn.addEventListener('click', async () => {
    try {
        unlockBtn.disabled = true;
        statusText.innerText = "Decrypting... please wait.";
        
        // Attempt to load the document with the provided password
        const doc = await PDFDocument.load(rawBuffer, { password: currentPassword.value });
        
        // Saving it without passing encryption options strips the password entirely
        const pdfBytes = await doc.save();

        downloadFile(pdfBytes, 'YS-Unlocked.pdf');
        
        statusText.innerText = "Success! Password removed.";
        statusText.className = "mt-4 text-sm text-green-600 font-bold";
    } catch (error) {
        if (error.message.includes('password')) {
            statusText.innerText = "Incorrect password. Try again.";
        } else {
            statusText.innerText = "Error removing encryption.";
        }
        statusText.className = "mt-4 text-sm text-red-600";
        unlockBtn.disabled = false;
    }
});

// Helper for downloading
function downloadFile(bytes, filename) {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
