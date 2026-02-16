# HRMS Time Calculator Extension

An Edge/Chrome browser extension that helps employees track their work hours on the HRMS portal. It calculates exactly when you will reach the target of **5 hours and 6 minutes** based on your biometric punch-in/out logs.

## Features

- **Automatic Calculation**: Instantly calculates work time when you open the extension.
- **Active Session Tracking**: Accounts for the current ongoing session even if you haven't punched out yet.
- **Precision**: Shows worked and remaining time down to the second.
- **Target Time**: Tells you the exact clock time you can leave to meet your daily quota.
- **Safety Checks**: Only runs on the specific HRMS timesheet page to avoid errors.

## Installation

1.  Clone this repository or download the source code.
2.  Open Microsoft Edge (or Chrome) and go to `edge://extensions/` (or `chrome://extensions/`).
3.  Enable **Developer mode** (toggle in the bottom left or top right).
4.  Click **Load unpacked**.
5.  Select the folder containing this extension.

## Usage

1.  Navigate to your HRMS Timesheet page.
2.  **Important**: Open the "Biometric Hours" popup/section on the page so the extension can read the logs.
3.  Click the **HRMS Time Calculator** icon in your browser toolbar.
4.  View your worked hours, remaining time, and estimated finish time.

## Customization

This extension is tailored for a specific HRMS HTML structure. If you want to adapt it for another system, modify `content.js` and update the `CONFIG` object with your specific CSS selectors.

## Disclaimer

This is a personal project developed by **praveen.ponduru** to assist with daily time tracking. It is not officially affiliated with the HRMS provider.
