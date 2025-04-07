// Global variables
let originalContent = null;
let cleanedContent = null;
let summary = null;
let currentView = "raw";
let textSize = 100;
let sidebar = null;

// Initialize when the page is loaded
window.addEventListener("DOMContentLoaded", () => {
    // Save original content
    originalContent = document.body.innerHTML;

    // Check if auto-clean is enabled and apply theme
    chrome.storage.sync.get(
        {
            autoClean: false,
            theme: "light",
        },
        (items) => {
            // Apply theme
            if (items.theme === "dark") {
                applyDarkTheme();
            }

            // Auto-clean if enabled
            if (items.autoClean) {
                cleanPage();
            }
        }
    );
});

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "cleanPage":
            cleanPage();
            sendResponse({ success: true });
            break;
        case "summarize":
            summarize(request.mode);
            sendResponse({ success: true });
            break;
        case "setViewMode":
            setViewMode(request.mode);
            sendResponse({ success: true });
            break;
        case "setTextSize":
            setTextSize(request.size);
            sendResponse({ success: true });
            break;
        case "setTheme":
            setTheme(request.theme);
            sendResponse({ success: true });
            break;
        case "getReadTime":
            sendResponse({ readTime: calculateReadTime() });
            break;
    }
    return true;
});

// Clean the page by removing distractions
function cleanPage() {
    if (!originalContent) {
        originalContent = document.body.innerHTML;
    }

    // Save scroll position
    const scrollPosition = window.scrollY;

    // Create a new DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(originalContent, "text/html");

    // Remove distracting elements
    const distractingSelectors = [
        "header",
        "footer",
        "nav",
        "aside",
        ".ads",
        ".ad",
        ".advertisement",
        ".banner",
        ".social",
        ".share",
        ".comments",
        ".comment-section",
        ".related",
        ".recommended",
        ".sidebar",
        ".widget",
        "iframe",
        ".newsletter",
        ".subscription",
        ".popup",
        ".cookie-notice",
        ".gdpr",
        ".notification",
        // Additional common selectors for distractions
        "#header",
        "#footer",
        "#nav",
        "#sidebar",
        "#comments",
        ".header",
        ".footer",
        ".navigation",
        ".menu",
        ".nav-menu",
        ".advertisement",
        ".sponsor",
        ".sponsored",
        ".promo",
        ".popup",
        ".modal",
        ".overlay",
        ".sticky",
        ".fixed",
        ".share-buttons",
        ".social-buttons",
        ".social-links",
        ".related-posts",
        ".recommended-posts",
        ".popular-posts",
        ".newsletter-signup",
        ".subscribe",
        ".subscription-form",
        ".cookie-banner",
        ".gdpr-notice",
        ".consent-banner",
        ".author-bio",
        ".author-profile",
        ".about-author",
    ];

    distractingSelectors.forEach((selector) => {
        const elements = doc.querySelectorAll(selector);
        elements.forEach((el) => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
    });

    // Find the main content
    let mainContent =
        doc.querySelector("article") ||
        doc.querySelector(".article") ||
        doc.querySelector(".post") ||
        doc.querySelector(".content") ||
        doc.querySelector("main") ||
        doc.querySelector("#content") ||
        doc.querySelector(".main-content");

    // If no main content container is found, try to identify the content area
    if (!mainContent) {
        // Find the element with the most text content
        const paragraphs = Array.from(doc.querySelectorAll("p"));
        const textBlocks = {};

        paragraphs.forEach((p) => {
            let parent = p.parentNode;
            while (parent && parent !== doc.body) {
                const key =
                    parent.tagName +
                    (parent.id ? "#" + parent.id : "") +
                    (parent.className
                        ? "." + parent.className.replace(/\s+/g, ".")
                        : "");
                if (!textBlocks[key]) {
                    textBlocks[key] = { element: parent, textLength: 0 };
                }
                textBlocks[key].textLength += p.textContent.length;
                parent = parent.parentNode;
            }
        });

        // Find the element with the most text
        let maxTextLength = 0;
        let contentElement = null;

        for (const key in textBlocks) {
            if (textBlocks[key].textLength > maxTextLength) {
                maxTextLength = textBlocks[key].textLength;
                contentElement = textBlocks[key].element;
            }
        }

        mainContent = contentElement;
    }

    // If still no main content, use the body
    if (!mainContent) {
        mainContent = doc.body;
    }

    // Clean the content
    cleanedContent = mainContent.innerHTML;

    // Calculate read time
    const readTime = calculateReadTime();

    // Create clean reader view
    const cleanContainer = document.createElement("div");
    cleanContainer.className = "cleanread-container";
    cleanContainer.innerHTML = `
    <div class="cleanread-content">
      ${cleanedContent}
    </div>
  `;

    // Apply clean styles
    document.body.className = "cleanread-active";
    document.body.innerHTML = "";
    document.body.appendChild(cleanContainer);

    // Create or update the sidebar
    createOrUpdateSidebar(readTime);

    // Restore scroll position
    window.scrollTo(0, scrollPosition);

    // Set the view mode to 'clean'
    currentView = "clean";
}

// Calculate estimated read time
function calculateReadTime() {
    if (!cleanedContent) return "--";

    // Create a temporary div to calculate text content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cleanedContent;

    // Get text content and count words
    const text = tempDiv.textContent;
    const wordCount = text
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

    // Average reading speed: 200-250 words per minute
    const readingSpeed = 225;
    const minutes = Math.ceil(wordCount / readingSpeed);

    return minutes === 1 ? "1 min" : `${minutes} mins`;
}

// Create or update the sidebar
function createOrUpdateSidebar(readTime) {
    // Remove existing sidebar if it exists
    if (sidebar) {
        document.body.removeChild(sidebar);
    }

    // Create sidebar
    sidebar = document.createElement("div");
    sidebar.id = "cleanread-sidebar";
    sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 320px;
    height: 100vh;
    background-color: #fff;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
    transform: translateX(${currentView === "raw" ? "100%" : "0"});
  `;

    // Create sidebar header
    const header = document.createElement("div");
    header.style.cssText = `
    padding: 16px;
    border-bottom: 1px solid #e1e4e8;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

    const title = document.createElement("h2");
    title.textContent = "CleanRead";
    title.style.cssText = `
    margin: 0;
    font-size: 18px;
    color: #4a6fa5;
  `;

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  `;
    closeBtn.addEventListener("click", () => {
        setViewMode("raw");
    });

    header.appendChild(title);
    header.appendChild(closeBtn);
    sidebar.appendChild(header);

    // Create view toggle
    const viewToggle = document.createElement("div");
    viewToggle.style.cssText = `
    display: flex;
    padding: 8px 16px;
    border-bottom: 1px solid #e1e4e8;
  `;

    const views = ["clean", "summary"];
    views.forEach((view) => {
        const btn = document.createElement("button");
        btn.textContent = view.charAt(0).toUpperCase() + view.slice(1);
        btn.style.cssText = `
      flex: 1;
      padding: 8px;
      border: 1px solid #e1e4e8;
      background-color: ${currentView === view ? "#4a6fa5" : "#f5f7fa"};
      color: ${currentView === view ? "#fff" : "#333"};
      cursor: pointer;
      margin: 0 4px;
      border-radius: 4px;
    `;
        btn.addEventListener("click", () => {
            setViewMode(view);
        });
        viewToggle.appendChild(btn);
    });

    sidebar.appendChild(viewToggle);

    // Create read time display
    const readTimeDiv = document.createElement("div");
    readTimeDiv.style.cssText = `
    padding: 8px 16px;
    font-size: 14px;
    color: #666;
    border-bottom: 1px solid #e1e4e8;
  `;
    readTimeDiv.textContent = `Estimated Read Time: ${readTime}`;
    sidebar.appendChild(readTimeDiv);

    // Create content area
    const contentArea = document.createElement("div");
    contentArea.style.cssText = `
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    font-size: ${textSize}%;
  `;

    if (currentView === "clean") {
        contentArea.innerHTML = cleanedContent;
    } else if (currentView === "summary") {
        if (summary) {
            contentArea.innerHTML = summary;
        } else {
            contentArea.innerHTML =
                '<p>No summary available. Click "Summarize" to generate one.</p>';

            const summarizeBtn = document.createElement("button");
            summarizeBtn.textContent = "Summarize Now";
            summarizeBtn.style.cssText = `
        padding: 8px 16px;
        background-color: #4a6fa5;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 16px;
      `;
            summarizeBtn.addEventListener("click", () => {
                summarize("tldr");
            });

            contentArea.appendChild(summarizeBtn);
        }
    }

    sidebar.appendChild(contentArea);

    // Add sidebar to the page
    document.body.appendChild(sidebar);

    // Apply dark theme if needed
    chrome.storage.sync.get({ theme: "light" }, (items) => {
        if (items.theme === "dark") {
            applyDarkTheme();
        }
    });
}

// Set the view mode
function setViewMode(mode) {
    // Save the previous view mode
    const previousView = currentView;

    // Update current view mode
    currentView = mode;

    // Save scroll position
    const scrollPosition = window.scrollY;

    if (mode === "raw") {
        // Hide sidebar
        if (sidebar) {
            sidebar.style.transform = "translateX(100%)";
        }

        // Restore original content
        document.body.innerHTML = originalContent;
        document.body.className = "";
    } else if (mode === "clean") {
        // Show sidebar
        if (sidebar) {
            sidebar.style.transform = "translateX(0)";

            // Update content in sidebar
            const contentArea = sidebar.querySelector("div:nth-child(4)");
            if (contentArea) {
                contentArea.innerHTML = cleanedContent;
            }
        }

        // If coming from raw view or not cleaned yet, clean the page
        if (previousView === "raw" || !cleanedContent) {
            cleanPage();
        } else if (previousView === "summary") {
            // Coming from summary view, just update the body content
            const cleanContainer = document.createElement("div");
            cleanContainer.className = "cleanread-container";
            cleanContainer.innerHTML = `
                <div class="cleanread-content">
                    ${cleanedContent}
                </div>
            `;

            // Apply clean styles
            document.body.className = "cleanread-active";
            document.body.innerHTML = "";
            document.body.appendChild(cleanContainer);

            // Recreate sidebar
            createOrUpdateSidebar(calculateReadTime());
        }
    } else if (mode === "summary") {
        // Show sidebar
        if (sidebar) {
            sidebar.style.transform = "translateX(0)";

            // Update content in sidebar
            const contentArea = sidebar.querySelector("div:nth-child(4)");
            if (contentArea) {
                if (summary) {
                    contentArea.innerHTML = summary;
                } else {
                    contentArea.innerHTML =
                        '<p>No summary available. Click "Summarize" to generate one.</p>';

                    const summarizeBtn = document.createElement("button");
                    summarizeBtn.textContent = "Summarize Now";
                    summarizeBtn.style.cssText = `
                        padding: 8px 16px;
                        background-color: #4a6fa5;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-top: 16px;
                    `;
                    summarizeBtn.addEventListener("click", () => {
                        summarize("tldr");
                    });

                    contentArea.appendChild(summarizeBtn);
                }
            }
        }

        // If coming from raw view or not cleaned yet, clean the page first
        if (previousView === "raw" || !cleanedContent) {
            cleanPage();
        }

        // If we have a summary, display it in the main view
        if (summary) {
            const summaryContainer = document.createElement("div");
            summaryContainer.className = "cleanread-container";
            summaryContainer.innerHTML = `
                <div class="cleanread-content cleanread-summary">
                    <h1>Article Summary</h1>
                    ${summary}
                </div>
            `;

            // Apply clean styles
            document.body.className = "cleanread-active";
            document.body.innerHTML = "";
            document.body.appendChild(summaryContainer);

            // Recreate sidebar
            createOrUpdateSidebar(calculateReadTime());
        } else {
            // If no summary, prompt to generate one
            summarize("tldr");
        }
    }

    // Restore scroll position
    window.scrollTo(0, scrollPosition);
}

// Set the text size
function setTextSize(size) {
    textSize = size;

    if (sidebar) {
        const contentArea = sidebar.querySelector("div:nth-child(4)");
        if (contentArea) {
            contentArea.style.fontSize = `${size}%`;
        }
    }
}

// Generate summary using the backend API
function summarize(mode) {
    if (!cleanedContent) {
        cleanPage();
    }

    // Create a temporary div to get text content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cleanedContent;
    const textContent = tempDiv.textContent.trim();

    // Show loading indicator
    if (sidebar) {
        const contentArea = sidebar.querySelector("div:nth-child(4)");
        if (contentArea && currentView === "summary") {
            contentArea.innerHTML = "<p>Generating summary...</p>";
        }
    }

    // Send request to backend
    chrome.runtime.sendMessage(
        {
            action: "summarize",
            content: textContent,
            mode: mode,
        },
        (response) => {
            if (response && response.summary) {
                summary = response.summary;

                // Format summary based on mode
                if (mode === "bullets" || mode === "key") {
                    // Convert to HTML if it's not already
                    if (!summary.includes("<li>")) {
                        const lines = summary
                            .split("\n")
                            .filter((line) => line.trim());
                        summary =
                            "<ul>" +
                            lines
                                .map((line) => {
                                    // Remove bullet characters if present
                                    const cleanLine = line
                                        .replace(/^[\s•\-*]+/, "")
                                        .trim();
                                    return `<li>${cleanLine}</li>`;
                                })
                                .join("") +
                            "</ul>";
                    }
                }

                // Update sidebar if in summary view
                if (sidebar && currentView === "summary") {
                    const contentArea =
                        sidebar.querySelector("div:nth-child(4)");
                    if (contentArea) {
                        contentArea.innerHTML = summary;
                    }
                }

                // Switch to summary view
                setViewMode("summary");
            } else {
                // Show error
                if (sidebar) {
                    const contentArea =
                        sidebar.querySelector("div:nth-child(4)");
                    if (contentArea && currentView === "summary") {
                        contentArea.innerHTML =
                            "<p>Failed to generate summary. Please try again.</p>";
                    }
                }
            }
        }
    );
}

// Set the theme (light or dark)
function setTheme(theme) {
    if (theme === "dark") {
        applyDarkTheme();
    } else {
        removeDarkTheme();
    }
}

// Apply dark theme to the sidebar and main content
function applyDarkTheme() {
    // Apply dark theme to the main content
    document.body.classList.add("cleanread-dark");

    // Apply dark theme to the sidebar
    if (!sidebar) return;

    sidebar.style.backgroundColor = "#1e1e1e";
    sidebar.style.color = "#e1e1e1";

    const header = sidebar.querySelector("div:first-child");
    if (header) {
        header.style.borderBottomColor = "#444";
    }

    const title = sidebar.querySelector("h2");
    if (title) {
        title.style.color = "#6d9eeb";
    }

    const closeBtn = sidebar.querySelector("button");
    if (closeBtn) {
        closeBtn.style.color = "#aaa";
    }

    const viewToggle = sidebar.querySelector("div:nth-child(2)");
    if (viewToggle) {
        viewToggle.style.borderBottomColor = "#444";

        const buttons = viewToggle.querySelectorAll("button");
        buttons.forEach((btn) => {
            if (btn.style.backgroundColor !== "rgb(74, 111, 165)") {
                btn.style.backgroundColor = "#2d2d2d";
                btn.style.color = "#e1e1e1";
                btn.style.borderColor = "#444";
            }
        });
    }

    const readTimeDiv = sidebar.querySelector("div:nth-child(3)");
    if (readTimeDiv) {
        readTimeDiv.style.borderBottomColor = "#444";
        readTimeDiv.style.color = "#aaa";
    }

    // Apply dark theme to the content area in sidebar
    const contentArea = sidebar.querySelector("div:nth-child(4)");
    if (contentArea) {
        contentArea.style.backgroundColor = "#1e1e1e";
        contentArea.style.color = "#e1e1e1";
    }
}

// Remove dark theme from the sidebar and main content
function removeDarkTheme() {
    // Remove dark theme from the main content
    document.body.classList.remove("cleanread-dark");

    // Remove dark theme from the sidebar
    if (!sidebar) return;

    sidebar.style.backgroundColor = "#fff";
    sidebar.style.color = "#333";

    const header = sidebar.querySelector("div:first-child");
    if (header) {
        header.style.borderBottomColor = "#e1e4e8";
    }

    const title = sidebar.querySelector("h2");
    if (title) {
        title.style.color = "#4a6fa5";
    }

    const closeBtn = sidebar.querySelector("button");
    if (closeBtn) {
        closeBtn.style.color = "#666";
    }

    const viewToggle = sidebar.querySelector("div:nth-child(2)");
    if (viewToggle) {
        viewToggle.style.borderBottomColor = "#e1e4e8";

        const buttons = viewToggle.querySelectorAll("button");
        buttons.forEach((btn) => {
            if (btn.style.backgroundColor !== "rgb(74, 111, 165)") {
                btn.style.backgroundColor = "#f5f7fa";
                btn.style.color = "#333";
                btn.style.borderColor = "#e1e4e8";
            }
        });
    }

    const readTimeDiv = sidebar.querySelector("div:nth-child(3)");
    if (readTimeDiv) {
        readTimeDiv.style.borderBottomColor = "#e1e4e8";
        readTimeDiv.style.color = "#666";
    }

    // Remove dark theme from the content area in sidebar
    const contentArea = sidebar.querySelector("div:nth-child(4)");
    if (contentArea) {
        contentArea.style.backgroundColor = "#fff";
        contentArea.style.color = "#333";
    }
}
