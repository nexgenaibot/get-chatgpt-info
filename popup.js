function log(message) {
    const logDiv = document.getElementById('log');
    const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    logDiv.innerHTML += `[${timestamp}] ${message}<br>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        const originalText = button.textContent;
        button.textContent = '已复制';
        button.classList.add('copied');
        button.disabled = true;
        log('>> 内容已复制到剪贴板');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
            button.disabled = false;
        }, 2000);
    } catch (err) {
        log('>> 复制失败: ' + err);
    }
}

function displayInfo(info) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
    <div class="result-container">
      <div class="result-label">订阅令牌 (accessToken):</div>
      <input type="text" value="${info.accessToken}" readonly>
      <button class="copy-btn" data-text="${info.accessToken}">复制</button>
    </div>
    <div class="result-container">
      <div class="result-label">订阅到期时间 (北京时间):</div>
      <input type="text" value="${info.formattedTime}" readonly>
      <button class="copy-btn" data-text="${info.formattedTime}">复制</button>
    </div>
    <div class="result-container">
      <div class="result-label">账号邮箱:</div>
      <input type="text" value="${info.email}" readonly>
      <button class="copy-btn" data-text="${info.email}">复制</button>
    </div>
  `;

    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            copyToClipboard(this.getAttribute('data-text'), this);
        });
    });

    log('>> 信息显示完成');
}

async function fetchInfo() {
    log('>> 开始手动获取信息...');
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, { action: "fetchInfo" });
    } catch (error) {
        log(`>> 错误: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['chatgptInfo'], (result) => {
        if (result.chatgptInfo) {
            displayInfo(result.chatgptInfo);
        } else {
            log('>> 未找到缓存的信息，请点击"手动获取信息"按钮');
        }
    });

    document.getElementById('fetchInfo').addEventListener('click', fetchInfo);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchInfo") {
        chrome.storage.local.set({ chatgptInfo: request.data });
        displayInfo(request.data);
    }
});
