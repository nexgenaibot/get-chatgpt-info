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

async function fetchInfo() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    log('>> 开始获取信息...');

    try {
        log('>> 正在建立连接...');
        const sessionResponse = await fetch('https://chatgpt.com/api/auth/session', {
            credentials: 'include'
        });

        if (!sessionResponse.ok) {
            throw new Error(`会话请求失败: ${sessionResponse.status}`);
        }

        log('>> 连接成功，正在提取数据...');
        const sessionData = await sessionResponse.json();
        const accessToken = sessionData.accessToken;

        if (!accessToken) {
            throw new Error('未找到访问令牌。请确保已登录 ChatGPT。');
        }

        log('>> 访问令牌获取成功，正在验证账户信息...');
        const accountResponse = await fetch('https://chatgpt.com/backend-api/accounts/check/v4-2023-04-27?timezone_offset_min=-480', {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            credentials: 'include'
        });

        if (!accountResponse.ok) {
            throw new Error(`账户请求失败: ${accountResponse.status}`);
        }

        log('>> 账户信息验证成功，正在处理数据...');
        const accountData = await accountResponse.json();
        const expiresAt = new Date(accountData.accounts.default.entitlement.expires_at);
        const beijingTime = new Date(expiresAt.getTime() + (8 * 60 * 60 * 1000));
        const formattedTime = beijingTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

        resultsDiv.innerHTML = `
        <div class="result-container">
          <div class="result-label">订阅令牌 (accessToken):</div>
          <input type="text" value="${accessToken}" readonly>
          <button class="copy-btn" data-text="${accessToken}">复制</button>
        </div>
        <div class="result-container">
          <div class="result-label">订阅到期时间 (北京时间):</div>
          <input type="text" value="${formattedTime}" readonly>
          <button class="copy-btn" data-text="${formattedTime}">复制</button>
        </div>
      `;

        // 为新添加的按钮绑定事件
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                copyToClipboard(this.getAttribute('data-text'), this);
            });
        });

        log('>> 信息获取完成');
    } catch (error) {
        log(`>> 错误: ${error.message}`);
        resultsDiv.innerHTML = `<div style="color: #ff4040;">错误: ${error.message}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fetchInfo').addEventListener('click', fetchInfo);
});