import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Shield,
  Store,
  User,
  Lock,
  Eye,
  EyeOff,
  Pause,
  Play,
  AlertCircle,
  Info,
  Globe,
  Power
} from 'lucide-react';
import { APP_VERSION_TAG } from '../lib/version';
import { findStoredUser } from '../lib/userStore';
import barakahIcon from '../assets/barakah-icon.png';
import slide1Img from '../assets/login/slide_1.jpg';
import slide2Img from '../assets/login/slide_2.jpg';
import slide3Img from '../assets/login/slide_3.jpg';
import './LoginScreen.css';

interface LoginScreenProps {
  onLogin: (user: { username: string; role: string }) => void;
  isEnglish: boolean;
  onToggleLanguage: (isEnglish: boolean) => void;
}

const SLIDES = [
  {
    img: slide1Img,
    title: 'Built for Speed',
    subtitle: 'Seamless GST billing & live inventory for modern supermarkets.'
  },
  {
    img: slide2Img,
    title: 'Bulk to Retail',
    subtitle: 'Manage wholesale bags, carton boxes, and flexible weight packs effortlessly.'
  },
  {
    img: slide3Img,
    title: 'One HQ, Five Shops',
    subtitle: 'Unified analytics, Udhaar ledgers, and stock allocation across branches.'
  }
];

const REMEMBERED_ADMIN_KEY = 'barakah_remembered_admin_v1';

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  isEnglish,
  onToggleLanguage
}) => {
  const [loginMode, setLoginMode] = useState<'admin' | 'shop'>('admin');
  const [username, setUsername] = useState<string>(() => {
    try {
      return localStorage.getItem(REMEMBERED_ADMIN_KEY) || 'admin';
    } catch {
      return 'admin';
    }
  });
  const [password, setPassword] = useState('admin');
  const [obscurePassword, setObscurePassword] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoNotice, setInfoNotice] = useState('');

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Skywalk-style rate limiter (5 attempts per 2-min window -> 60s lockout)
  const [failedAttempts, setFailedAttempts] = useState<number[]>([]);
  const [lockoutUntil, setLockoutUntil] = useState<number>(0);

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const switchMode = (mode: 'admin' | 'shop') => {
    setLoginMode(mode);
    setErrorMsg('');
    setInfoNotice('');
    if (mode === 'admin') {
      try {
        setUsername(localStorage.getItem(REMEMBERED_ADMIN_KEY) || 'admin');
      } catch {
        setUsername('admin');
      }
      setPassword('admin');
    } else {
      setUsername('SHOP1');
      setPassword('shop1');
    }
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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setInfoNotice('');

    const now = Date.now();
    if (lockoutUntil > now) {
      const secs = Math.ceil((lockoutUntil - now) / 1000);
      setErrorMsg(`Too many failed attempts. Please wait ${secs}s before trying again.`);
      return;
    }

    let trimmedUser = username.trim();
    const trimmedPass = password.trim();

    // Allow email alias for admin demo convenience
    if (trimmedUser.toLowerCase() === 'admin@barakahbepaar.in') {
      trimmedUser = 'ADMIN';
    }

    if (!trimmedUser) {
      setErrorMsg(isEnglish ? 'Please enter your username.' : 'பயனர் பெயரை உள்ளிடவும்.');
      usernameRef.current?.focus();
      return;
    }

    if (!trimmedPass) {
      setErrorMsg(isEnglish ? 'Please enter your password.' : 'கடவுச்சொல்லை உள்ளிடவும்.');
      passwordRef.current?.focus();
      return;
    }

    const storedUser = findStoredUser(trimmedUser);
    if (storedUser && storedUser.password === trimmedPass) {
      // Enforce clear role guidance between Admin HQ and Shop Counter tabs
      if (loginMode === 'admin' && storedUser.level !== 'Administrator') {
        setErrorMsg('This is a Shop/Staff account. Please use the "Shop / Staff" tab to open POS.');
        return;
      }
      if (loginMode === 'shop' && storedUser.level === 'Administrator') {
        setErrorMsg('This is an Admin account. Please use the "Admin" tab to access HQ Dashboard.');
        return;
      }

      if (loginMode === 'admin') {
        try {
          if (rememberMe) {
            localStorage.setItem(REMEMBERED_ADMIN_KEY, username.trim());
          } else {
            localStorage.removeItem(REMEMBERED_ADMIN_KEY);
          }
        } catch {}
      }

      setFailedAttempts([]);
      onLogin({ username: storedUser.username, role: storedUser.level });
      return;
    }

    // Track failed attempt for RateLimiter
    const recent = [...failedAttempts.filter(ts => now - ts < 120000), now];
    setFailedAttempts(recent);
    if (recent.length >= 5) {
      setLockoutUntil(now + 60000);
      setErrorMsg('5 failed attempts detected. Login locked for 60 seconds.');
    } else {
      setErrorMsg(
        loginMode === 'admin'
          ? 'Invalid Admin credentials! (Demo: admin / admin)'
          : 'Invalid Shop credentials! (Demo: SHOP1 / shop1)'
      );
    }
    passwordRef.current?.select();
  };

  const activeSlide = SLIDES[currentSlide];

  return (
    <div className="bb-login-shell">
      {/* ====================================================================
          LEFT PANEL — BRANDED SUPERMARKET SLIDESHOW HERO
          ==================================================================== */}
      <div className="bb-login-left">
        {SLIDES.map((s, idx) => (
          <img
            key={idx}
            src={s.img}
            alt={s.title}
            className="bb-login-slide-img"
            style={{
              opacity: currentSlide === idx ? 1 : 0,
              transform: currentSlide === idx ? 'scale(1.03)' : 'scale(1)'
            }}
          />
        ))}
        <div className="bb-login-scrim" />

        <div className="bb-login-left-content">
          {/* Top-Left Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="bb-login-brand-badge">
              <img
                src={barakahIcon}
                alt="Barakah Bepaar"
                style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: 3.5, lineHeight: 1.1 }}>
                BARAKAH BEPAAR
              </div>
              <div style={{ fontSize: 9.5, letterSpacing: 2.8, opacity: 0.88, marginTop: 3 }}>
                ~ SMART RETAIL &amp; WHOLESALE ~
              </div>
            </div>
          </div>

          {/* Bottom Taglines + Controls */}
          <div>
            <div style={{ marginBottom: 22, maxWidth: 460 }}>
              <div style={{ fontSize: 30, fontStyle: 'italic', fontWeight: 700, lineHeight: 1.2 }}>
                {activeSlide.title}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.86)', marginTop: 6, lineHeight: 1.45 }}>
                {activeSlide.subtitle}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {SLIDES.map((_, idx) => (
                  <div
                    key={idx}
                    className="bb-login-dot"
                    onClick={() => setCurrentSlide(idx)}
                    style={{
                      width: currentSlide === idx ? 32 : 10,
                      background: currentSlide === idx ? '#38BDF8' : 'rgba(255, 255, 255, 0.35)'
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                className="bb-login-pause-btn"
                onClick={() => setIsPaused(p => !p)}
                title={isPaused ? 'Resume Slideshow' : 'Pause Slideshow'}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          RIGHT PANEL — LIGHT SAAS AUTH FORM (ADMIN / SHOP ROLE ROUTING)
          ==================================================================== */}
      <div className="bb-login-right">
        {/* Top Utility Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {window.isElectron && (
              <button
                type="button"
                onClick={handleCloseApp}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 999,
                  padding: '5px 11px',
                  fontSize: 12,
                  color: '#B91C1C',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Power size={13} /> Exit
              </button>
            )}
            <button
              type="button"
              onClick={() => onToggleLanguage(!isEnglish)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 999,
                padding: '5px 11px',
                fontSize: 12,
                color: '#475569',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Switch POS Language / மொழி மாற்றம்"
            >
              <Globe size={13} /> {isEnglish ? 'தமிழ்' : 'English'}
            </button>
          </div>

          <div className="bb-secure-pill">
            <ShieldCheck size={14} color="#0EA5E9" />
            <span>Secure Access</span>
          </div>
        </div>

        {/* Centered Auth Card */}
        <div className="bb-login-card-inner">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: -0.4 }}>
              Welcome Back!
            </h1>
            <p style={{ margin: '6px 0 0 0', fontSize: 13.5, color: '#64748B' }}>
              {loginMode === 'admin'
                ? 'Sign in to Barakah Bepaar HQ Admin Dashboard'
                : 'Sign in with shop counter credentials (Classic POS)'}
            </p>
          </div>

          {/* Segmented Mode Toggle: Admin vs Shop / Staff */}
          <div className="bb-mode-toggle" style={{ marginBottom: 22 }}>
            <button
              type="button"
              className={`bb-mode-tab ${loginMode === 'admin' ? 'active' : ''}`}
              onClick={() => switchMode('admin')}
            >
              <Shield size={15} color={loginMode === 'admin' ? '#0EA5E9' : '#64748B'} />
              <span>Admin</span>
            </button>
            <button
              type="button"
              className={`bb-mode-tab ${loginMode === 'shop' ? 'active' : ''}`}
              onClick={() => switchMode('shop')}
            >
              <Store size={15} color={loginMode === 'shop' ? '#0EA5E9' : '#64748B'} />
              <span>Shop / Staff</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Username / Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                {loginMode === 'admin' ? 'Admin Username / Email' : 'Shop Counter ID'}
              </label>
              <div className="bb-auth-input-wrap">
                <User size={16} color="#94A3B8" />
                <input
                  ref={usernameRef}
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={loginMode === 'admin' ? 'admin' : 'SHOP1'}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Password
              </label>
              <div className="bb-auth-input-wrap">
                <Lock size={16} color="#94A3B8" />
                <input
                  ref={passwordRef}
                  type={obscurePassword ? 'password' : 'text'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setObscurePassword(v => !v)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', padding: 2 }}
                  tabIndex={-1}
                >
                  {obscurePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password Row (Admin Mode) */}
            {loginMode === 'admin' ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#475569', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#1F4E63', width: 15, height: 15 }}
                  />
                  Remember Me
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setInfoNotice('Demo credentials: Admin = admin / admin · Shop Counter = SHOP1 / shop1')
                  }
                  style={{ border: 'none', background: 'transparent', color: '#0284C7', fontWeight: 600, cursor: 'pointer', fontSize: 12.5 }}
                >
                  Forgot Password?
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                <span>Opens Classic Vanigam POS UI</span>
                <span style={{ fontWeight: 600, color: '#1F4E63' }}>Demo: SHOP1 / shop1</span>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  borderRadius: 10,
                  padding: '9px 12px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Helpful Info Banner */}
            {infoNotice && (
              <div
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1E40AF',
                  borderRadius: 10,
                  padding: '9px 12px',
                  fontSize: 12.5,
                  fontWeight: 500
                }}
              >
                {infoNotice}
              </div>
            )}

            {/* Primary CTA Button */}
            <button type="submit" className="bb-login-cta">
              {loginMode === 'admin' ? 'Login to HQ Dashboard' : 'Start Shop Counter'}
            </button>
          </form>

          {/* Developed By Barakah Tech Credit */}
          <div
            style={{
              marginTop: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              fontSize: 11.5,
              color: '#64748B',
              opacity: 0.85
            }}
          >
            <span>Developed by</span>
            <img src={barakahIcon} alt="Barakah Tech" style={{ width: 16, height: 16, objectFit: 'contain' }} />
            <strong style={{ color: '#0F172A', letterSpacing: 0.5 }}>BARAKAH TECH</strong>
            <span>· {APP_VERSION_TAG}</span>
          </div>

          {/* Restricted Access Notice Box */}
          <div
            style={{
              marginTop: 16,
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 11.5,
              color: '#64748B',
              lineHeight: 1.4
            }}
          >
            <Info size={16} color="#64748B" style={{ flexShrink: 0 }} />
            <span>
              {loginMode === 'admin'
                ? 'This portal is restricted to authorized Barakah Bepaar HQ administrators only.'
                : 'Shop login opens the fast keyboard-driven counter POS. Contact HQ Admin for PIN resets.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
