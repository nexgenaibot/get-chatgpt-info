async function fetchChatGPTInfo() {
    try {
      // Fetch session info
      const sessionResponse = await fetch('https://chatgpt.com/api/auth/session');
      const sessionData = await sessionResponse.json();
      const accessToken = sessionData.accessToken;
  
      // Fetch account info
      const accountResponse = await fetch('https://chatgpt.com/backend-api/accounts/check/v4-2023-04-27?timezone_offset_min=-480', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const accountData = await accountResponse.json();
      const expiresAt = new Date(accountData.accounts.default.entitlement.expires_at);
      const beijingTime = new Date(expiresAt.getTime() + (8 * 60 * 60 * 1000));
  
      // Display results
      const resultsDiv = document.createElement('div');
      resultsDiv.innerHTML = `
        <h2>ChatGPT Info</h2>
        <p>Access Token: <input type="text" value="${accessToken}" readonly> <button class="copy-btn" data-target="accessToken">Copy</button></p>
        <p>Expires At (Beijing Time): <input type="text" value="${beijingTime.toISOString().replace('T', ' ').substr(0, 19)}" readonly> <button class="copy-btn" data-target="expiresAt">Copy</button></p>
      `;
      document.body.appendChild(resultsDiv);
  
      // Add copy functionality
      document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const input = this.previousElementSibling;
          input.select();
          document.execCommand('copy');
          this.textContent = 'Copied!';
          setTimeout(() => this.textContent = 'Copy', 2000);
        });
      });
    } catch (error) {
      console.error('Error fetching ChatGPT info:', error);
    }
  }
  
  fetchChatGPTInfo();