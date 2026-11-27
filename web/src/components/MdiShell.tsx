import React, { useState } from 'react';
import { APP_VERSION_TAG } from '../lib/version';
import barakahLogo from '../assets/barakah-logo.jpg';
import barakahIcon from '../assets/barakah-icon.png';
import '../styles/classicTheme.css';

interface MdiShellProps {
  children: React.ReactNode;
  activeModule: string;
  onSelectModule: (module: string) => void;
  onOpenSettings: () => void;
  isChildMinimized?: boolean;
  onRestoreChild?: () => void;
  onCloseChild?: () => void;
  isEnglish?: boolean;
  currentUser?: { username: string; role: string } | null;
  onLogOff?: () => void;
}

export const MdiShell: React.FC<MdiShellProps> = ({
  children,
  activeModule,
  onSelectModule,
  onOpenSettings,
  isChildMinimized,
  onRestoreChild,
  onCloseChild,
  isEnglish = true,
  currentUser,
  onLogOff
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [appExited, setAppExited] = useState(false);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleSelect = (moduleName: string) => {
    setOpenMenu(null);
    onSelectModule(moduleName);
  };

  const handleMinimizeApp = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    } else {
      alert('Window minimized (in Desktop Electron app this minimizes to Windows taskbar).');
    }
  };

  const handleToggleMaximizeApp = () => {
    if (window.electronAPI) {
      window.electronAPI.toggleMaximizeWindow();
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  };

  const handleCloseApp = () => {
    const msg = isEnglish
      ? 'Are you sure you want to exit Barakah Bepaar Retail Software?'
      : 'மென்பொருளிலிருந்து வெளியேற வேண்டுமா?';
    if (!window.confirm(msg)) return;

    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    } else {
      window.close();
      setAppExited(true);
    }
  };

  if (appExited) {
    return (
      <div style={{
        height: '100vh', width: '100vw', background: '#3A6EA5', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontFamily: 'Tahoma, sans-serif'
      }}>
        <div className="win-modal-window" style={{ width: 340, padding: 16, textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 10 }}>
            Barakah Bepaar Session Closed
          </div>
          <div style={{ fontSize: 11.5, marginBottom: 14, color: '#333' }}>
            Browser tabs block scripts from closing tabs directly. Click below to start a new session.
          </div>
          <button className="win-btn-classic" style={{ padding: '4px 16px', fontWeight: 'bold' }} onClick={() => setAppExited(false)}>
            Reopen Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Outer Windows Parent Title Bar */}
      <div className="win-parent-titlebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src={barakahIcon} alt="Barakah Bepaar" style={{ width: 14, height: 14, objectFit: 'contain', background: '#FFF', borderRadius: 2 }} />
          <span style={{ fontSize: 11 }}>
            Barakah Bepaar - Retail Management Software [GST Version] {APP_VERSION_TAG}
            {currentUser && (
              <span style={{ marginLeft: 8, padding: '1px 6px', background: 'rgba(255,255,255,0.2)', borderRadius: 2, fontSize: 10 }}>
                {isEnglish ? `User: ${currentUser.username} (${currentUser.role})` : `பயனர்: ${currentUser.username}`}
              </span>
            )}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button className="win-control-btn" title="Minimize Window" onClick={handleMinimizeApp}>_</button>
          <button className="win-control-btn" title="Maximize / Restore Window" onClick={handleToggleMaximizeApp}>□</button>
          <button className="win-control-btn" style={{ color: '#B91C1C' }} title="Close Application" onClick={handleCloseApp}>✕</button>
        </div>
      </div>

      {/* Classic Menu Bar (File, Masters, Transactions, Reports, Settings, Exit) */}
      <div className="win-menubar" onMouseLeave={() => setOpenMenu(null)}>
        {/* FILE MENU */}
        <div className={`win-menubar-item ${openMenu === 'file' ? 'open' : ''}`} onClick={() => toggleMenu('file')}>
          {isEnglish ? <><u>F</u>ile</> : 'கோப்பு'}
          {openMenu === 'file' && (
            <div className="win-dropdown-menu">
              <div className="win-dropdown-item" style={{ color: '#888' }}>{isEnglish ? 'Company Information' : 'நிறுவன விவரம்'}</div>
              <div className="win-dropdown-item" style={{ color: '#888' }}>{isEnglish ? 'Calculator' : 'கணிப்பான்'}</div>
              <div className="win-dropdown-item" style={{ color: '#888' }}>{isEnglish ? 'Calendar' : 'நாட்காட்டி'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('user_master')}>{isEnglish ? 'User Information' : 'பயனர் விவரம்'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('config')}>{isEnglish ? 'Configuration' : 'பயனர் அமைப்பு'}</div>
              <div className="win-dropdown-item" style={{ color: '#888' }}>{isEnglish ? 'Repair Database' : 'தரவுத்தளம் சரிசெய்'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('product_master')}>{isEnglish ? 'Edit Product' : 'பொருள் திருத்து'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('denomination')}>{isEnglish ? 'Denomination' : 'பண மதிப்பு'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('barcode_gen')}>{isEnglish ? 'Edit Barcode' : 'பார்கோடு திருத்து'}</div>
              <div className="win-dropdown-item" onClick={() => { setOpenMenu(null); onLogOff?.(); }}>
                {isEnglish ? 'Log Off' : 'பயனர் வெளியேறு (Log Off)'}
              </div>
            </div>
          )}
        </div>

        {/* MASTERS MENU */}
        <div className={`win-menubar-item ${openMenu === 'masters' ? 'open' : ''}`} onClick={() => toggleMenu('masters')}>
          {isEnglish ? <><u>M</u>asters</> : 'முதன்மை'}
          {openMenu === 'masters' && (
            <div className="win-dropdown-menu">
              <div className="win-dropdown-item" onClick={() => handleSelect('category_master')}>{isEnglish ? 'Product Category' : 'பொருள் பிரிவு'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('product_master')}>{isEnglish ? 'Product Details' : 'பொருள் விவரம்'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('customer_master')}>{isEnglish ? 'Customer Information' : 'வாடிக்கையாளர் தகவல்'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('supplier_master')}>{isEnglish ? 'Supplier Information' : 'விநியோகஸ்தர் தகவல்'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('tax_master')}>{isEnglish ? 'Tax Information' : 'வரி விவரம்'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('barcode_gen')}>{isEnglish ? 'Barcode Generator' : 'பார்கோடு உருவாக்கி'}</div>
            </div>
          )}
        </div>

        {/* TRANSACTIONS MENU */}
        <div className={`win-menubar-item ${openMenu === 'transactions' ? 'open' : ''}`} onClick={() => toggleMenu('transactions')}>
          {isEnglish ? <><u>T</u>ransactions</> : 'பரிவர்த்தனைகள்'}
          {openMenu === 'transactions' && (
            <div className="win-dropdown-menu">
              <div className="win-dropdown-item" onClick={() => handleSelect('sales_billing')}>
                <b>{isEnglish ? 'Sales Information (Ctrl+I)' : 'விற்பனை தகவல் (Ctrl+I)'}</b>
              </div>
              <div className="win-dropdown-item" onClick={() => handleSelect('sales_return')}>{isEnglish ? 'Sales Return' : 'விற்பனை திரும்பல்'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('purchase_invoice')}>{isEnglish ? 'Purchase Invoice' : 'கொள்முதல் பில்'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('purchase_return')}>{isEnglish ? 'Purchase Return' : 'கொள்முதல் திரும்பல்'}</div>
              <div style={{ height: 1, background: '#A0A0A0', margin: '2px 0' }} />
              <div className="win-dropdown-item" onClick={() => handleSelect('receipt_entry')}>{isEnglish ? 'Receipt Details' : 'ரசீது விவரம்'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('payment_entry')}>{isEnglish ? 'Payment Details' : 'பணம் செலுத்தல்'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('stock_conversion')}>{isEnglish ? 'Stock Convertion' : 'சரக்கு மாற்றம்'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('stock_update')}>{isEnglish ? 'Stock Update' : 'சரக்கு புதுப்பிப்பு'}</div>
            </div>
          )}
        </div>

        {/* REPORTS MENU */}
        <div className={`win-menubar-item ${openMenu === 'reports' ? 'open' : ''}`} onClick={() => toggleMenu('reports')}>
          {isEnglish ? <><u>R</u>eports</> : 'அறிக்கைகள்'}
          {openMenu === 'reports' && (
            <div className="win-dropdown-menu">
              <div className="win-dropdown-item" onClick={() => handleSelect('sales_reports')}>{isEnglish ? 'Sales Reports' : 'விற்பனை அறிக்கை'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('stock_reports')}>{isEnglish ? 'Stock Reports' : 'சரக்கு அறிக்கை'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('customer_reports')}>{isEnglish ? 'Customer Reports' : 'வாடிக்கையாளர் அறிக்கை'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('supplier_reports')}>{isEnglish ? 'Supplier Reports' : 'விநியோகஸ்தர் அறிக்கை'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('profit_reports')}>{isEnglish ? 'Profit Reports' : 'லாப அறிக்கை'}</div>
              <div className="win-dropdown-item" onClick={() => handleSelect('day_end_report')}>{isEnglish ? 'Day End Report' : 'நாள் இறுதி அறிக்கை'}</div>
            </div>
          )}
        </div>

        {/* SETTINGS MENU (Before Exit in navbar) */}
        <div className="win-menubar-item" onClick={() => { setOpenMenu(null); onOpenSettings(); }} title={isEnglish ? 'Settings & Hardware Configuration' : 'அமைப்புகள்'}>
          {isEnglish ? <><u>S</u>ettings</> : 'அமைப்புகள்'}
        </div>

        {/* EXIT */}
        <div className="win-menubar-item" onClick={handleCloseApp} title={isEnglish ? 'Exit Application' : 'வெளியேறு'}>
          {isEnglish ? <><u>E</u>xit</> : 'வெளியேறு'}
        </div>
      </div>

      {/* MDI Client Workspace Area */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Barakah Bepaar Official Branded MDI Home Screen (Visible when child window is closed or minimized) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, #FFFFFF 0%, #F4F6F6 65%, #E6ECEE 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          padding: 20
        }}>
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

          {activeModule === 'none' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="win-btn-classic"
                style={{ height: 32, padding: '0 16px', fontWeight: 'bold', fontSize: 12 }}
                onClick={() => onSelectModule('sales_billing')}
              >
                {isEnglish ? 'Open Sales Info (Ctrl+I)' : 'விற்பனை திரையைத் திற (Ctrl+I)'}
              </button>
              <button
                className="win-btn-classic"
                style={{ height: 32, padding: '0 14px', fontSize: 12 }}
                onClick={() => onSelectModule('product_master')}
              >
                {isEnglish ? 'Product Master' : 'பொருள் விவரம்'}
              </button>
              <button
                className="win-btn-classic"
                style={{ height: 32, padding: '0 14px', fontSize: 12 }}
                onClick={onOpenSettings}
              >
                {isEnglish ? 'Settings' : 'அமைப்புகள்'}
              </button>
            </div>
          )}
        </div>

        {/* Active Child Window Container */}
        {!isChildMinimized && children}

        {/* Minimized MDI Child Window Taskbar Tile (Bottom-left like Windows MDI) */}
        {isChildMinimized && activeModule !== 'none' && (
          <div style={{
            position: 'absolute',
            bottom: 4,
            left: 4,
            width: 190,
            height: 24,
            background: 'linear-gradient(90deg, #1084D0 0%, #B5D2EE 100%)',
            border: '2px outset #FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 4px',
            color: '#FFF',
            fontWeight: 'bold',
            fontSize: 11,
            zIndex: 500
          }}>
            <span style={{ cursor: 'pointer', flex: 1 }} onClick={onRestoreChild}>
              {activeModule === 'sales_billing' ? (isEnglish ? 'Sales Info' : 'விற்பனை விபரம்') : activeModule}
            </span>
            <div style={{ display: 'flex', gap: 2 }}>
              <button className="win-control-btn" title="Restore" onClick={onRestoreChild}>□</button>
              <button className="win-control-btn" style={{ color: '#B91C1C' }} title="Close" onClick={onCloseChild}>✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
