/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to determine the redirect URI dynamically
  function getRedirectUri(req: any) {
    if (process.env.APP_URL) {
      let url = process.env.APP_URL;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      return `${url.replace(/\/$/, '')}/auth/callback`;
    }
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers.host || 'localhost:3000';
    return `${proto}://${host}/auth/callback`;
  }

  // API Route: Check auth status and config presence
  app.get('/api/auth/status', (req, res) => {
    res.json({
      hasClientId: !!process.env.OAUTH_CLIENT_ID,
      hasClientSecret: !!process.env.OAUTH_CLIENT_SECRET,
      appUrl: process.env.APP_URL || null,
    });
  });

  // API Route: Generate Google OAuth URL
  app.get('/api/auth/url', (req, res) => {
    const clientId = process.env.OAUTH_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({
        error: 'OAUTH_CLIENT_ID matches empty. Bạn hãy cài đặt mã Client ID trong mục Secrets.',
      });
    }

    const redirectUri = getRedirectUri(req);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile openid email',
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    res.json({ url: authUrl });
  });

  // OAuth Callback: Exchanges auth code for an access token
  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send('Không tìm thấy mã authorization code từ Google.');
    }

    try {
      const clientId = process.env.OAUTH_CLIENT_ID;
      const clientSecret = process.env.OAUTH_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        throw new Error('Cấu hình OAUTH_CLIENT_ID hoặc OAUTH_CLIENT_SECRET bị khuyết trong biến môi trường.');
      }

      const redirectUri = getRedirectUri(req);
      
      // Exchange code for token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Google token exchange error: ${errorText}`);
      }

      const tokenData: any = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Fetch user profile info
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      let profileResult = null;
      if (profileResponse.ok) {
        profileResult = await profileResponse.json();
      }

      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Xác thực Google Sheets thành công</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background-color: #f8fafc;
                color: #1e293b;
              }
              .card {
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
                max-width: 420px;
                width: 105%;
                box-sizing: border-box;
                text-align: center;
                border: 1px solid #e2e8f0;
              }
              .icon-container {
                width: 56px;
                height: 56px;
                background-color: #d1fae5;
                color: #059669;
                border-radius: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
              }
              h2 {
                margin: 0 0 10px 0;
                font-size: 20px;
                font-weight: 700;
              }
              p {
                margin: 0 0 24px 0;
                font-size: 13.5px;
                color: #64748b;
                line-height: 1.5;
              }
              .status {
                font-size: 11px;
                color: #94a3b8;
                font-family: monospace;
                background: #f1f5f9;
                padding: 10px;
                border-radius: 8px;
                display: inline-block;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="icon-container">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2>Liên kết hoàn tất!</h2>
              <p>Hệ thống Đánh giá Thi đua Thống kê đã kết nối thành công với tài khoản Google Drive & Sheets của bạn.</p>
              <div class="status">Đang giữ phiên và đóng cửa sổ...</div>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  accessToken: '${accessToken}',
                  profile: ${JSON.stringify(profileResult)}
                }, '*');
                setTimeout(() => {
                  window.close();
                }, 800);
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error('Error in OAuth callback exchange:', err);
      res.status(500).send(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #dc2626;">Lỗi trao đổi mã xác thực Google</h2>
          <p>${err.message}</p>
          <p style="color: #64748b; font-size: 12px;">Đảm bảo bạn đã lưu OAUTH_CLIENT_ID và OAUTH_CLIENT_SECRET chính xác.</p>
        </div>
      `);
    }
  });

  // Setup Vite development or production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FULLSTACK] Server listining on http://0.0.0.0:${PORT} under NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
