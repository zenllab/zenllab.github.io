// Dropbox 인증 관리
const DropboxAuth = {
    APP_KEY: 'nubtwdkq9uvn2ka',
    REDIRECT_URI: window.location.origin + '/private.html',
    dbx: null,
    
    elements: {
        authStatus: () => document.getElementById('auth-status'),
        connectBtn: () => document.getElementById('connect-btn'),
        disconnectBtn: () => document.getElementById('disconnect-btn'),
        saveBtn: () => document.getElementById('saveBtn'),
        loadBtn: () => document.getElementById('loadBtn'),
        saveBtntd: () => document.getElementById('saveBtntd'),
        loadBtntd: () => document.getElementById('loadBtntd')
    },

    // PKCE 헬퍼 함수들
    base64URLEncode(str) {
        return btoa(String.fromCharCode.apply(null, str))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    },

    generateRandomString(length) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return this.base64URLEncode(array);
    },

    async sha256(plain) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        return window.crypto.subtle.digest('SHA-256', data);
    },

    async generatePKCEPair() {
        const codeVerifier = this.generateRandomString(32);
        const hashed = await this.sha256(codeVerifier);
        const codeChallenge = this.base64URLEncode(new Uint8Array(hashed));
        return { codeVerifier, codeChallenge };
    },

    // 인증 상태 관리
    updateAuthStatus(status, message) {
        const statusEl = this.elements.authStatus();
        statusEl.className = `auth-status auth-${status}`;
        statusEl.textContent = message;
        
        const isConnected = status === 'success';
        this.elements.connectBtn().style.display = isConnected ? 'none' : 'inline-block';
        this.elements.disconnectBtn().style.display = isConnected ? 'inline-block' : 'none';
        
        [this.elements.saveBtn(), this.elements.loadBtn(), 
         this.elements.saveBtntd(), this.elements.loadBtntd()].forEach(btn => {
            if (btn) btn.style.display = isConnected ? 'inline-block' : 'none';
        });
    },

    // 토큰 관리
    saveTokens(accessToken, refreshToken = null, codeVerifier = null) {
        const tokenData = { accessToken, refreshToken, codeVerifier, timestamp: Date.now() };
        localStorage.setItem('dropbox_tokens', JSON.stringify(tokenData));
    },

    loadTokens() {
        try {
            const saved = localStorage.getItem('dropbox_tokens');
            if (!saved) return null;
            
            const tokenData = JSON.parse(saved);
            if (Date.now() - tokenData.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('dropbox_tokens');
                return null;
            }
            return tokenData;
        } catch (e) {
            console.error('토큰 로드 실패:', e);
            return null;
        }
    },

    clearTokens() {
        localStorage.removeItem('dropbox_tokens');
    },

    // 인증 처리
    async initialize() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            
            if (code) {
                await this.handleAuthCode(code);
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }
            
            const tokens = this.loadTokens();
            if (tokens?.accessToken) {
                this.dbx = new Dropbox.Dropbox({ accessToken: tokens.accessToken });
                try {
                    await this.dbx.usersGetCurrentAccount();
                    this.updateAuthStatus('success', 'Dropbox 연결됨');
                    return;
                } catch (e) {
                    console.log('토큰 무효:', e);
                    this.clearTokens();
                }
            }
            
            this.updateAuthStatus('error', 'Dropbox 연결 필요');
            this.bindEvents();
            
        } catch (e) {
            console.error('초기화 실패:', e);
            this.updateAuthStatus('error', 'Dropbox 연결 실패: ' + e.message);
        }
    },

    async handleAuthCode(code) {
        try {
            this.updateAuthStatus('pending', '인증 처리 중...');
            
            const tokens = this.loadTokens();
            const codeVerifier = tokens?.codeVerifier;
            
            if (!codeVerifier) {
                throw new Error('PKCE code_verifier를 찾을 수 없습니다.');
            }
            
            const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    client_id: this.APP_KEY,
                    redirect_uri: this.REDIRECT_URI,
                    code_verifier: codeVerifier
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const tokenData = await response.json();
            
            if (tokenData.access_token) {
                this.saveTokens(tokenData.access_token, tokenData.refresh_token);
                this.dbx = new Dropbox.Dropbox({ accessToken: tokenData.access_token });
                await this.dbx.usersGetCurrentAccount();
                this.updateAuthStatus('success', 'Dropbox 연결 성공!');
            } else {
                throw new Error('액세스 토큰을 받지 못했습니다');
            }
            
        } catch (e) {
            console.error('인증 실패:', e);
            this.updateAuthStatus('error', '인증 실패: ' + e.message);
            this.clearTokens();
        }
    },

    async connect() {
        try {
            const { codeVerifier, codeChallenge } = await this.generatePKCEPair();
            this.saveTokens(null, null, codeVerifier);
            
            const authUrl = `https://www.dropbox.com/oauth2/authorize?` + new URLSearchParams({
                client_id: this.APP_KEY,
                response_type: 'code',
                redirect_uri: this.REDIRECT_URI,
                code_challenge: codeChallenge,
                code_challenge_method: 'S256',
                token_access_type: 'offline'
            });
            
            window.location.href = authUrl;
        } catch (e) {
            console.error('인증 URL 생성 실패:', e);
            this.updateAuthStatus('error', '인증 시작 실패: ' + e.message);
        }
    },

    disconnect() {
        this.clearTokens();
        this.dbx = null;
        this.updateAuthStatus('error', 'Dropbox 연결 해제됨');
        this.bindEvents();
    },

    bindEvents() {
        this.elements.connectBtn().addEventListener('click', () => this.connect());
        this.elements.disconnectBtn().addEventListener('click', () => this.disconnect());
        
        // 파일 업로드/다운로드 이벤트
        this.elements.saveBtn().addEventListener('click', () => FileManager.uploadReport());
        this.elements.loadBtn().addEventListener('click', () => FileManager.loadReport());
        this.elements.saveBtntd().addEventListener('click', () => FileManager.uploadTodo());
        this.elements.loadBtntd().addEventListener('click', () => FileManager.loadTodo());
    }
};