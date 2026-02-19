let refreshInterval = null;

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
                resultDiv.textContent = "Error: Could not communicate with page. Try refreshing the page.";
                resultDiv.className = 'error';
                stopAutoRefresh();
                return;
            }

            if (response && response.success) {
                if (response.html) {
                    resultDiv.innerHTML = response.html;
                } else {
                    resultDiv.textContent = response.message;
                }
                resultDiv.className = 'success';

                // Only auto-refresh if there is an active clock-in
                if (response.isCurrentlyWorking) {
                    startAutoRefresh();
                } else {
                    stopAutoRefresh();
                }
            } else {
                resultDiv.textContent = response ? response.message : "Unknown error occurred.";
                resultDiv.className = 'error';
                stopAutoRefresh();
            }
        });

    } catch (error) {
        resultDiv.textContent = 'Error: ' + error.message;
        resultDiv.className = 'error';
        stopAutoRefresh();
    }
}

function startAutoRefresh() {
    if (!refreshInterval) {
        refreshInterval = setInterval(performCalculation, 1000);
    }
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

document.addEventListener('DOMContentLoaded', performCalculation);
document.getElementById('calculateBtn').addEventListener('click', () => {
    stopAutoRefresh(); // Reset interval on manual refresh
    performCalculation();
});
