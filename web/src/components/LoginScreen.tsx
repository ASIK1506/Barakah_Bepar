import React, { useState, useRef } from 'react';
import { APP_VERSION_TAG } from '../lib/version';
import { findStoredUser } from '../lib/userStore';
import barakahIcon from '../assets/barakah-icon.png';
import barakahLogo from '../assets/barakah-logo.jpg';
import '../styles/classicTheme.css';

interface LoginScreenProps {
  onLogin: (user: { username: string; role: string }) => void;
  isEnglish: boolean;
  onToggleLanguage: (isEnglish: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  isEnglish,
  onToggleLanguage
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [errorMsg, setErrorMsg] = useState('');

  const passwordRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser) {
      setErrorMsg(isEnglish ? 'Please enter User Name.' : 'பயனர் பெயரை உள்ளிடவும்.');
      usernameRef.current?.focus();
      return;
    }

    if (!trimmedPass) {
      setErrorMsg(isEnglish ? 'Please enter Password.' : 'கடவுச்சொல்லை உள்ளிடவும்.');
      passwordRef.current?.focus();
      return;
    }

    // Check saved User Information accounts (userStore.ts)
    const storedUser = findStoredUser(trimmedUser);
    if (storedUser && storedUser.password === trimmedPass) {
      onLogin({ username: storedUser.username, role: storedUser.level });
      return;
    }

    setErrorMsg(isEnglish
      ? 'Invalid User Name or Password! (Default: admin / admin)'
      : 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்! (இயல்புநிலை: admin / admin)');
    passwordRef.current?.select();
  };

  const handleClear = () => {
    setUsername('');
    setPassword('');
    setErrorMsg('');
    usernameRef.current?.focus();
  };

  const handleCloseApp = () => {
    if (window.confirm(isEnglish ? 'Are you sure you want to exit Barakah Bepaar?' : 'மென்பொருளிலிருந்து வெளியேற வேண்டுமா?')) {
      if (window.electronAPI) {
        window.electronAPI.closeWindow();
      } else {
        window.close();
      }
    }
  };

  /* Disabled menu style — greyed out, no pointer events, no alert */
  const disabledMenuStyle: React.CSSProperties = {
    color: '#999',
    pointerEvents: 'none',
    cursor: 'default'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: '#FFFFFF',
      fontFamily: 'Tahoma, Arial, sans-serif'
    }}>
      {/* 1. Classic Windows Top Titlebar */}
      <div className="win-parent-titlebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src={barakahIcon} alt="Barakah Bepaar" style={{ width: 14, height: 14, objectFit: 'contain', background: '#FFF', borderRadius: 2 }} />
          <span style={{ fontSize: 11 }}>Barakah Bepaar - Retail Management Software [GST Version] {APP_VERSION_TAG}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button className="win-control-btn" title="Minimize Window" onClick={() => window.electronAPI?.minimizeWindow?.()}>_</button>
          <button className="win-control-btn" title="Maximize Window" onClick={() => window.electronAPI?.toggleMaximizeWindow?.()}>□</button>
          <button className="win-control-btn" style={{ color: '#B91C1C' }} title="Close Application" onClick={handleCloseApp}>✕</button>
        </div>
      </div>

      {/* 2. Menu Bar — ALL items disabled/greyed except Exit */}
      <div className="win-menubar">
        <div className="win-menubar-item" style={disabledMenuStyle}>
          {isEnglish ? 'File' : 'கோப்பு'}
        </div>

        <div className="win-menubar-item" style={disabledMenuStyle}>
          {isEnglish ? 'Masters' : 'முதன்மை'}
        </div>

        <div className="win-menubar-item" style={disabledMenuStyle}>
          {isEnglish ? 'Transactions' : 'பரிவர்த்தனைகள்'}
        </div>

        <div className="win-menubar-item" style={disabledMenuStyle}>
          {isEnglish ? 'Reports' : 'அறிக்கைகள்'}
        </div>

        <div className="win-menubar-item" style={disabledMenuStyle}>
          {isEnglish ? 'Settings' : 'அமைப்புகள்'}
        </div>

        <div className="win-menubar-item" onClick={handleCloseApp} title={isEnglish ? 'Exit Application' : 'வெளியேறு'}>
          {isEnglish ? <><u>E</u>xit</> : 'வெளியேறு'}
        </div>
      </div>

      {/* 3. Main Workspace — Centered Barakah Bepaar logo + bottom-right login box */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#FFFFFF',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        padding: 20
      }}>
        {/* Centered Logo Area (matches MdiShell home screen) */}
        <div style={{ textAlign: 'center', marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={barakahLogo}
            alt="Barakah Bepaar - Retail Management Software"
            style={{
              width: 'min(480px, 78vw)',
              height: 'auto',
              objectFit: 'contain',
              mixBlendMode: 'multiply',
              marginBottom: 4
            }}
          />
          <div style={{
            fontSize: 13,
            fontWeight: 'bold',
            color: '#374151',
            letterSpacing: 0.6,
            marginTop: -12
          }}>
            Barakah Bepaar — GST Billing &amp; Inventory Suite <span style={{ color: '#00A884' }}>{APP_VERSION_TAG}</span>
          </div>
        </div>

        {/* Bottom-Right: Login Form Box (positioned absolutely) */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          right: 28,
          border: '1px solid #000000',
          background: '#FFFFFF',
          padding: '16px 20px',
          width: 'min(340px, 90vw)',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
          zIndex: 10
        }}>
          <form onSubmit={handleSubmit}>
            {/* Row 1: User Name */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <label style={{
                width: 90,
                fontSize: 12,
                fontWeight: 'bold',
                color: '#000000',
                fontFamily: 'Arial, sans-serif'
              }}>
                {isEnglish ? 'User Name' : 'பயனர் பெயர்'}
              </label>
              <input
                ref={usernameRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    passwordRef.current?.focus();
                    passwordRef.current?.select();
                  }
                }}
                style={{
                  flex: 1,
                  height: 22,
                  border: '1px solid #7F9DB9',
                  padding: '2px 6px',
                  fontSize: 12,
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  background: '#FFFFFF',
                  outline: 'none'
                }}
                placeholder="admin"
                autoFocus
              />
            </div>

            {/* Row 2: Password */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <label style={{
                width: 90,
                fontSize: 12,
                fontWeight: 'bold',
                color: '#000000',
                fontFamily: 'Arial, sans-serif'
              }}>
                {isEnglish ? 'Password' : 'கடவுச்சொல்'}
              </label>
              <input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                style={{
                  flex: 1,
                  height: 22,
                  border: '1px solid #7F9DB9',
                  padding: '2px 6px',
                  fontSize: 12,
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  background: '#FFFFFF',
                  outline: 'none'
                }}
                placeholder="•••••"
              />
            </div>

            {/* Error Notice */}
            {errorMsg && (
              <div style={{
                fontSize: 11,
                color: '#B91C1C',
                fontWeight: 'bold',
                marginBottom: 8,
                textAlign: 'center'
              }}>
                {errorMsg}
              </div>
            )}

            {/* Action Buttons Row */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
              <button
                type="submit"
                className="win-btn-classic"
                style={{
                  padding: '3px 14px',
                  fontWeight: 'bold',
                  fontSize: 11.5,
                  cursor: 'pointer'
                }}
              >
                {isEnglish ? 'Login' : 'உள்நுழை'}
              </button>
              <button
                type="button"
                className="win-btn-classic"
                onClick={handleClear}
                style={{
                  padding: '3px 10px',
                  fontSize: 11.5,
                  cursor: 'pointer'
                }}
              >
                {isEnglish ? 'Clear' : 'அழி'}
              </button>
              <button
                type="button"
                className="win-btn-classic"
                onClick={() => onToggleLanguage(!isEnglish)}
                style={{
                  padding: '3px 8px',
                  fontSize: 10,
                  cursor: 'pointer'
                }}
                title="Switch Language / மொழி மாற்றம்"
              >
                {isEnglish ? 'தமிழ்' : 'English'}
              </button>
            </div>

            <div style={{ marginTop: 8, fontSize: 10, color: '#666', textAlign: 'center' }}>
              {isEnglish ? 'Default: admin / admin' : 'இயல்புநிலை: admin / admin'}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
