async function performCalculation() {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = 'Calculating...';
    resultDiv.className = '';

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tab.id) {
            throw new Error("No active tab found.");
        }

        // Execute content script functionality
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });

        chrome.tabs.sendMessage(tab.id, { action: "calculateTime" }, (response) => {
            if (chrome.runtime.lastError) {
                // If the receiver is not open, or other errors
                resultDiv.textContent = "Error: Could not communicate with page. Try refreshing the page.";
                resultDiv.className = 'error';
                return;
            }

            if (response && response.success) {
                if (response.html) {
                    resultDiv.innerHTML = response.html;
                } else {
                    resultDiv.textContent = response.message;
                }
                resultDiv.className = 'success';
            } else {
                resultDiv.textContent = response ? response.message : "Unknown error occurred.";
                resultDiv.className = 'error';
            }
        });

    } catch (error) {
        resultDiv.textContent = 'Error: ' + error.message;
        resultDiv.className = 'error';
    }
}

document.addEventListener('DOMContentLoaded', performCalculation);
document.getElementById('calculateBtn').addEventListener('click', performCalculation);
