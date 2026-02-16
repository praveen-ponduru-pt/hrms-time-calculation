// content.js

// Configuration for the specific HRMS structure provided
const CONFIG = {
    rowSelector: '.punch-in-punch-out-row',
    startTimeSelector: '.punch:nth-child(1)',
    endTimeSelector: '.punch:nth-child(2)'
};

/**
 * Parses a time string like "01:46:52 PM" into a Date object (for today).
 * @param {string} timeStr 
 * @returns {Date|null}
 */
function parseTime(timeStr) {
    if (!timeStr) return null;
    timeStr = timeStr.trim();

    // Check if it's "MISSING" or invalid
    if (timeStr.toUpperCase() === 'MISSING' || timeStr === '') {
        return null;
    }

    // Expected format: HH:MM:SS AM/PM
    // We can use native Date parsing by appending the date, but typically "Time Date" string parsing is safer.
    // Let's do manual 12h parsing to be safe and consistent with "today".

    const parts = timeStr.match(/(\d+):(\d+):(\d+)\s*(AM|PM)/i);
    if (!parts) return null;

    let [_, hours, minutes, seconds, period] = parts;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    seconds = parseInt(seconds, 10);

    if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, seconds, 0);
    return date;
}

/**
 * Main calculation function
 */
function calculateEndTime() {
    // URL Validation
    // Expected format: .../hrms/me/time-sheet?timesheetDate=YYYY-MM-DD
    if (!window.location.href.match(/\/hrms\/me\/time-sheet\?timesheetDate=\d{4}-\d{2}-\d{2}/)) {
        return {
            success: false,
            message: "Incorrect page. Please navigate to the HRMS Timesheet page."
        };
    }

    const rows = document.querySelectorAll(CONFIG.rowSelector);

    if (rows.length === 0) {
        // Fallback or error if the popup isn't open or structure changed
        return {
            success: false,
            message: "No punch-in/out rows found. Make sure the 'Biometric Hours' popup is open."
        };
    }

    let totalCompletedMillis = 0;
    let lastPunchIn = null;
    let isCurrentlyWorking = false;

    rows.forEach(row => {
        const startElem = row.querySelector(CONFIG.startTimeSelector);
        const endElem = row.querySelector(CONFIG.endTimeSelector);

        if (!startElem) return;

        const startTime = parseTime(startElem.innerText);
        // The end element might exist but contain "MISSING" or be empty
        const endTime = endElem ? parseTime(endElem.innerText) : null;

        if (startTime && endTime) {
            // Completed session
            let diff = endTime - startTime;
            if (diff < 0) {
                // Handle case where session spans midnight
                diff += 24 * 60 * 60 * 1000;
            }
            totalCompletedMillis += diff;
        } else if (startTime && !endTime) {
            // Active session (MISSING end time)
            lastPunchIn = startTime;
            isCurrentlyWorking = true;
        }
    });

    const targetMinutes = (5 * 60) + 6; // 5 hours 6 minutes
    const targetMillis = targetMinutes * 60 * 1000;

    // Calculate current session duration if working
    let currentSessionMillis = 0;
    if (isCurrentlyWorking && lastPunchIn) {
        currentSessionMillis = Date.now() - lastPunchIn.getTime();
        // Handle negative if system time is messed up or crossing midnight logic needed (simple for now)
        if (currentSessionMillis < 0) currentSessionMillis = 0;
    }

    const totalWorkedMillis = totalCompletedMillis + currentSessionMillis;
    const remainingMillis = targetMillis - totalWorkedMillis;

    const totalWorkedSeconds = Math.floor(totalWorkedMillis / 1000);
    const workedHours = Math.floor(totalWorkedSeconds / 3600);
    const workedMins = Math.floor((totalWorkedSeconds % 3600) / 60);
    const workedSecs = totalWorkedSeconds % 60;

    if (remainingMillis <= 0) {
        return {
            success: true,
            html: `<strong>Target reached!</strong> You have worked ${workedHours}h ${workedMins}m ${workedSecs}s.`
        };
    }

    // Target time calculation
    // If working, we just add remaining time to NOW.
    // If not working, we add remaining time to NOW (assuming start immediately).
    // The logic is actually the same for "Target Time Clock" if we consider remaining from *now*.
    // Verify:
    // Target Total = 5h. Worked = 4h (3h closed + 1h current). Remaining = 1h.
    // Time Now = 12:00. Target Time = 1:00. Correct.

    const targetTime = new Date(Date.now() + remainingMillis);
    const timeString = targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const remainingSecondsTotal = Math.floor(remainingMillis / 1000);
    const remMins = Math.floor(remainingSecondsTotal / 60);
    const remSecs = remainingSecondsTotal % 60;

    let messagePrefix = isCurrentlyWorking ? "At this rate:" : "If you start now:";

    return {
        success: true,
        html: `<div style="margin-bottom: 5px;"><strong>Worked:</strong> ${workedHours}h ${workedMins}m ${workedSecs}s</div>
               <div style="margin-bottom: 5px;"><strong>Remaining:</strong> ${remMins}m ${remSecs}s</div>
               <div><strong>${messagePrefix}</strong> Finish at ${timeString}</div>`
    };
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "calculateTime") {
        try {
            const result = calculateEndTime();
            sendResponse(result);
        } catch (e) {
            sendResponse({ success: false, message: "Error: " + e.message });
        }
    }
    return true;
});
