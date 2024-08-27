chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchInfo") {
        chrome.storage.local.set({ chatgptInfo: request.data });
    }
});
