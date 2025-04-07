document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const cleanBtn = document.getElementById("clean-btn");
    const summarizeBtn = document.getElementById("summarize-btn");
    const themeSwitch = document.getElementById("theme-switch");
    const textSizeSlider = document.getElementById("text-size");
    const textSizeValue = document.getElementById("text-size-value");
    const autoCleanCheckbox = document.getElementById("auto-clean");
    const viewButtons = document.querySelectorAll(".view-btn");
    const modeButtons = document.querySelectorAll(".mode-btn");
    const readTimeValue = document.getElementById("read-time-value");

    // Load saved settings
    chrome.storage.sync.get(
        {
            theme: "light",
            textSize: 100,
            autoClean: false,
            viewMode: "raw",
            summaryMode: "tldr",
        },
        (items) => {
            // Apply theme
            if (items.theme === "dark") {
                document.body.classList.add("dark-theme");
                themeSwitch.checked = true;
            }

            // Apply text size
            textSizeSlider.value = items.textSize;
            textSizeValue.textContent = `${items.textSize}%`;

            // Apply auto-clean setting
            autoCleanCheckbox.checked = items.autoClean;

            // Apply view mode
            viewButtons.forEach((btn) => {
                if (btn.id === `${items.viewMode}-view`) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });

            // Apply summary mode
            modeButtons.forEach((btn) => {
                if (btn.id === `${items.summaryMode}-mode`) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });
        }
    );

    // Get current tab's read time (if available)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            { action: "getReadTime" },
            (response) => {
                if (response && response.readTime) {
                    readTimeValue.textContent = `Estimated Read Time: ${response.readTime}`;
                }
            }
        );
    });

    // Clean button click handler
    cleanBtn.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "cleanPage" });
        });
    });

    // Summarize button click handler
    summarizeBtn.addEventListener("click", () => {
        // Get active summary mode
        let mode = "tldr";
        modeButtons.forEach((btn) => {
            if (btn.classList.contains("active")) {
                mode = btn.id.replace("-mode", "");
            }
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "summarize", mode });
        });
    });

    // Theme toggle handler
    themeSwitch.addEventListener("change", () => {
        if (themeSwitch.checked) {
            document.body.classList.add("dark-theme");
            chrome.storage.sync.set({ theme: "dark" });

            // Update theme on the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "setTheme",
                    theme: "dark",
                });
            });
        } else {
            document.body.classList.remove("dark-theme");
            chrome.storage.sync.set({ theme: "light" });

            // Update theme on the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "setTheme",
                    theme: "light",
                });
            });
        }
    });

    // Text size slider handler
    textSizeSlider.addEventListener("input", () => {
        const size = textSizeSlider.value;
        textSizeValue.textContent = `${size}%`;
        chrome.storage.sync.set({ textSize: parseInt(size) });

        // Update text size on the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "setTextSize",
                size: parseInt(size),
            });
        });
    });

    // Auto-clean checkbox handler
    autoCleanCheckbox.addEventListener("change", () => {
        chrome.storage.sync.set({ autoClean: autoCleanCheckbox.checked });
    });

    // View mode buttons handler
    viewButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            viewButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const mode = btn.id.replace("-view", "");
            chrome.storage.sync.set({ viewMode: mode });

            // Update view mode on the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "setViewMode",
                    mode,
                });
            });
        });
    });

    // Summary mode buttons handler
    modeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            modeButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const mode = btn.id.replace("-mode", "");
            chrome.storage.sync.set({ summaryMode: mode });
        });
    });
});
