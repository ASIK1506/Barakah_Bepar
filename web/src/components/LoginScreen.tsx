import React, { useState, useRef } from 'react';
import { APP_VERSION_TAG } from '../lib/version';
import barakahIcon from '../assets/barakah-icon.png';
import shoppingCartMouse from '../assets/shopping-cart-mouse.png';
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
  const [openMenu, setOpenMenu] = useState<string | null>(null);

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

    // Default POS credentials check (admin/admin, 1234, cashier, abid, or standard matching credentials)
    const validUsers: Record<string, string[]> = {
      admin: ['admin', '1234', 'admin123', ''],
      cashier: ['cashier', '1234', ''],
      abid: ['abid', '1234', 'admin', ''],
      manager: ['manager', '1234', 'admin']
    };

    const allowedPasswords = validUsers[trimmedUser.toLowerCase()];
    const isValid = (allowedPasswords && allowedPasswords.includes(trimmedPass.toLowerCase())) ||
                    trimmedPass === 'admin' || trimmedPass === '1234';

    if (isValid) {
      const role = trimmedUser.toLowerCase() === 'cashier' ? 'Cashier' : 'Administrator';
      onLogin({ username: trimmedUser.toUpperCase(), role });
    } else {
      setErrorMsg(isEnglish
        ? 'Invalid User Name or Password! (Default: admin / admin)'
        : 'தவறான பயனர் பெயர் அல்லது கடவுச்சொல்! (இயல்புநிலை: admin / admin)');
      passwordRef.current?.select();
    }
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

  const handleMenuClick = (menuName: string) => {
    if (menuName === 'exit') {
      handleCloseApp();
    } else {
      setOpenMenu(openMenu === menuName ? null : menuName);
    }
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

      {/* 2. Menu Bar (File, Masters, Transactions, Reports, Exit) matching Slide 4 */}
      <div className="win-menubar" onMouseLeave={() => setOpenMenu(null)}>
        <div className={`win-menubar-item ${openMenu === 'file' ? 'open' : ''}`} onClick={() => handleMenuClick('file')}>
          {isEnglish ? <><u>F</u>ile</> : 'கோப்பு'}
          {openMenu === 'file' && (
            <div className="win-dropdown-menu">
              <div className="win-dropdown-item" style={{ color: '#888' }}>{isEnglish ? 'Company Information (Locked)' : 'நிறுவன விவரம் (பூட்டப்பட்டது)'}</div>
              <div className="win-dropdown-item" style={{ color: '#888' }}>{isEnglish ? 'User Configuration (Locked)' : 'பயனர் அமைப்பு'}</div>
              <div style={{ height: 1, background: '#A0A0A0', margin: '2px 0' }} />
              <div className="win-dropdown-item" onClick={handleCloseApp}>{isEnglish ? 'Exit Application' : 'வெளியேறு'}</div>
            </div>
          )}
        </div>

        <div className="win-menubar-item" onClick={() => alert(isEnglish ? 'Please enter User Name and Password to log in first.' : 'முதலில் பயனர் பெயர் மற்றும் கடவுச்சொல்லை உள்ளிட்டு உள்நுழையவும்.')}>
          {isEnglish ? <><u>M</u>asters</> : 'முதன்மை'}
        </div>

        <div className="win-menubar-item" onClick={() => alert(isEnglish ? 'Please enter User Name and Password to log in first.' : 'முதலில் பயனர் பெயர் மற்றும் கடவுச்சொல்லை உள்ளிட்டு உள்நுழையவும்.')}>
          {isEnglish ? <><u>T</u>ransactions</> : 'பரிவர்த்தனைகள்'}
        </div>

        <div className="win-menubar-item" onClick={() => alert(isEnglish ? 'Please enter User Name and Password to log in first.' : 'முதலில் பயனர் பெயர் மற்றும் கடவுச்சொல்லை உள்ளிட்டு உள்நுழையவும்.')}>
          {isEnglish ? <><u>R</u>eports</> : 'அறிக்கைகள்'}
        </div>

        <div className="win-menubar-item" onClick={handleCloseApp} title={isEnglish ? 'Exit Application' : 'வெளியேறு'}>
          {isEnglish ? <><u>E</u>xit</> : 'வெளியேறு'}
        </div>
      </div>

      {/* 3. Main Workspace replicating Slide 4 / image4.jpeg */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#FFFFFF',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 28px'
      }}>
        {/* Top Section: Upper-Left Contacts + Upper-Right Shopping Cart Artwork */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Upper Left Branding & Support Contacts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src={barakahIcon}
                alt="Barakah Bepaar"
                style={{ width: 44, height: 44, objectFit: 'contain' }}
              />
              <div>
                <div style={{ fontSize: 16, fontWeight: '900', color: '#1E293B', letterSpacing: 0.8 }}>BARAKAH BEPAAR</div>
                <div style={{ fontSize: 10.5, fontWeight: 'bold', color: '#0AB898', letterSpacing: 1.5 }}>RETAIL SYSTEMS</div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#4A154B', // Deep purple from Slide 4
                fontFamily: 'Arial, sans-serif'
              }}>
                Contact No.s:
              </div>
              <div style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#4A154B',
                fontFamily: 'Arial, sans-serif',
                letterSpacing: 0.5,
                marginTop: 2
              }}>
                98400 48123
              </div>
              <div style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#4A154B',
                fontFamily: 'Arial, sans-serif',
                letterSpacing: 0.5
              }}>
                96002 46616
              </div>
            </div>
          </div>

          {/* Upper Center/Right: 3D Shopping Cart & Mouse Artwork (from image4.jpeg) */}
          <div style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-20%)',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            <img
              src={shoppingCartMouse}
              alt="Shopping Cart & Mouse"
              style={{
                width: 'min(330px, 34vw)',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>

        {/* Center Prominent Headline matching Slide 4 (Dark Navy Blue) */}
        <div style={{
          textAlign: 'center',
          margin: 'auto 0',
          zIndex: 5,
          userSelect: 'none'
        }}>
          <div style={{
            fontSize: 'clamp(28px, 4.4vw, 48px)',
            fontWeight: '900',
            color: '#000080', // Dark Navy matching Slide 4
            letterSpacing: '2.5px',
            fontFamily: 'Arial, sans-serif',
            lineHeight: 1.15
          }}>
            BARAKAH BEPAAR
          </div>
          <div style={{
            fontSize: 'clamp(24px, 3.8vw, 42px)',
            fontWeight: '900',
            color: '#000080',
            letterSpacing: '3px',
            fontFamily: 'Arial, sans-serif',
            marginTop: 4
          }}>
            SUPERMARKET
          </div>
          <div style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: '#0AB898',
            letterSpacing: 1.5,
            marginTop: 6
          }}>
            RETAIL MANAGEMENT SOFTWARE [GST VERSION]
          </div>
        </div>

        {/* Bottom Section: Lower-Left Software Solutions Badge + Lower-Right Login Form Box */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10 }}>
          {/* Lower Left Company / Solutions Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 6 }}>
            <img
              src={barakahIcon}
              alt="Barakah Bepaar Badge"
              style={{ width: 48, height: 48, objectFit: 'contain' }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#1F2937' }}>
                Barakah Bepaar Retail
              </div>
              <div style={{ fontSize: 10.5, color: '#6B7280' }}>
                Enterprise Point of Sale &amp; Billing
              </div>
            </div>
          </div>

          {/* Lower Right: Authentic Boxed Login Form Section (exact match to image4.jpeg) */}
          <div style={{
            border: '1px solid #000000', // Crisp 1px black outline matching Slide 4
            background: '#FFFFFF',
            padding: '16px 20px',
            width: 'min(340px, 90vw)',
            boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
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
    </div>
  );
};
