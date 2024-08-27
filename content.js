async function fetchChatGPTInfo() {
  try {
    const sessionResponse = await fetch('https://chatgpt.com/api/auth/session', {
      credentials: 'include'
    });

    if (!sessionResponse.ok) {
      throw new Error(`会话请求失败: ${sessionResponse.status}`);
    }

    const sessionData = await sessionResponse.json();
    const accessToken = sessionData.accessToken;

    if (!accessToken) {
      throw new Error('未找到访问令牌。请确保已登录 ChatGPT。');
    }

    const accountResponse = await fetch('https://chatgpt.com/backend-api/accounts/check/v4-2023-04-27?timezone_offset_min=-480', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      credentials: 'include'
    });

    if (!accountResponse.ok) {
      throw new Error(`账户请求失败: ${accountResponse.status}`);
    }

    const accountData = await accountResponse.json();
    const expiresAt = new Date(accountData.accounts.default.entitlement.expires_at);
    const beijingTime = new Date(expiresAt.getTime() + (8 * 60 * 60 * 1000));
    const formattedTime = beijingTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

    const meResponse = await fetch('https://chatgpt.com/backend-api/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      credentials: 'include'
    });

    if (!meResponse.ok) {
      throw new Error(`获取用户信息失败: ${meResponse.status}`);
    }

    const meData = await meResponse.json();
    const email = meData.email;

    chrome.runtime.sendMessage({
      action: "fetchInfo",
      data: { accessToken, formattedTime, email }
    });
  } catch (error) {
    console.error('获取 ChatGPT 信息时出错:', error);
  }
}

fetchChatGPTInfo();
