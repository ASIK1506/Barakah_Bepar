import React, { useState, useEffect } from 'react';
import { BarakahBridgeDiagnostic } from '../types';
import { APP_VERSION_TAG } from '../lib/version';
import '../styles/classicTheme.css';

export interface AppSettings {
  language: 'tamil' | 'english';
  scaleEnabled: boolean;
  comPort: string;
  baudRate: string;
  scaleModel: string;
  cardTerminal: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const [language, setLanguage] = useState<'tamil' | 'english'>(settings.language);
  const [scaleEnabled, setScaleEnabled] = useState(settings.scaleEnabled);
  const [comPort, setComPort] = useState(settings.comPort);
  const [baudRate, setBaudRate] = useState(settings.baudRate);
  const [scaleModel, setScaleModel] = useState(settings.scaleModel);
  const [cardTerminal, setCardTerminal] = useState(settings.cardTerminal);
  const [diag, setDiag] = useState<BarakahBridgeDiagnostic | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLanguage(settings.language);
      setScaleEnabled(settings.scaleEnabled);
      setComPort(settings.comPort);
      setBaudRate(settings.baudRate);
      setScaleModel(settings.scaleModel);
      setCardTerminal(settings.cardTerminal);
      if (window.barakahFs) {
        window.barakahFs.getDiagnostic().then(setDiag).catch(() => {});
      }
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      language,
      scaleEnabled,
      comPort,
      baudRate,
      scaleModel,
      cardTerminal
    });
    onClose();
  };

  const isEng = language === 'english';

  return (
    <div className="win-modal-overlay">
      <div className="win-modal-window" style={{ width: 510 }}>
        <div className="win-modal-titlebar">
          <span>{isEng ? '⚙ Settings & System Configuration' : '⚙ அமைப்புகள் & கணினி கட்டமைப்பு'}</span>
          <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 12 }}>
          {/* LANGUAGE SELECTION GROUPBOX */}
          <fieldset style={{ border: '1px solid #808080', padding: 10, marginBottom: 12 }}>
            <legend style={{ color: '#800000', fontWeight: 'bold', fontSize: 12 }}>
              {isEng ? '🌐 Display Language' : '🌐 மொழி தேர்வு'}
            </legend>

            <div style={{ fontSize: 12, marginBottom: 8, color: '#333' }}>
              {isEng
                ? 'Select the primary display language for all buttons, labels, menus, and prompts:'
                : 'அனைத்து பொத்தான்கள், தலைப்புகள் மற்றும் மெனுக்களுக்கான மொழியைத் தேர்ந்தெடுக்கவும்:'}
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, padding: '6px 12px', border: language === 'tamil' ? '2px solid #000080' : '2px solid transparent', background: language === 'tamil' ? '#E0E8FF' : '#FFF', borderRadius: 2 }}>
                <input
                  type="radio"
                  name="language"
                  value="tamil"
                  checked={language === 'tamil'}
                  onChange={() => setLanguage('tamil')}
                />
                <span style={{ fontFamily: "'Noto Sans Tamil', sans-serif", fontWeight: 'bold', color: '#800000' }}>தமிழ்</span>
                <span style={{ fontSize: 11, color: '#666' }}>(Tamil)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, padding: '6px 12px', border: language === 'english' ? '2px solid #000080' : '2px solid transparent', background: language === 'english' ? '#E0E8FF' : '#FFF', borderRadius: 2 }}>
                <input
                  type="radio"
                  name="language"
                  value="english"
                  checked={language === 'english'}
                  onChange={() => setLanguage('english')}
                />
                <span style={{ fontWeight: 'bold' }}>English</span>
              </label>
            </div>

            <div style={{ fontSize: 10.5, color: '#555', marginTop: 6 }}>
              {isEng
                ? '* English mode shows all buttons, field labels, tabs, menus, and prompts strictly in English.'
                : '* தமிழ் நிலையில் அனைத்து பொத்தான்கள், தலைப்புகள், மெனுக்கள் அனைத்தும் தமிழில் மட்டுமே காண்பிக்கப்படும்.'}
            </div>
          </fieldset>

          {/* WEIGHING SCALE GROUPBOX */}
          <fieldset style={{ border: '1px solid #808080', padding: 10, marginBottom: 12 }}>
            <legend style={{ color: '#800000', fontWeight: 'bold', fontSize: 12 }}>
              {isEng ? '⚖ Electronic Weighing Scale (Bayes / Essae / Phoenix)' : '⚖ எலக்ட்ரானிக் எடை இயந்திரம்'}
            </legend>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
              <input
                type="checkbox"
                id="enableScale"
                checked={scaleEnabled}
                onChange={(e) => setScaleEnabled(e.target.checked)}
              />
              <label htmlFor="enableScale" style={{ fontWeight: 600, fontSize: 12 }}>
                {isEng ? 'Enable Automatic Serial Weighing Scale Integration' : 'தானியங்கி எடை இயந்திர இணைப்பை இயக்கு'}
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6, fontSize: 12, alignItems: 'center' }}>
              <div>{isEng ? 'Scale Model:' : 'மாதிரி:'}</div>
              <select className="win-input-classic" value={scaleModel} onChange={(e) => setScaleModel(e.target.value)} style={{ height: 22 }}>
                <option>Essae DS-852 / Standard Continuous ASCII</option>
                <option>Bayes / Phoenix Supermarket Scale</option>
                <option>Sartorius / Citizen Precision Scale</option>
                <option>Virtual / Mock Emulated Scale</option>
              </select>

              <div>{isEng ? 'Serial Port:' : 'சீரியல் போர்ட்:'}</div>
              <select className="win-input-classic" value={comPort} onChange={(e) => setComPort(e.target.value)} style={{ height: 22 }}>
                <option>COM1</option>
                <option>COM2</option>
                <option>COM3</option>
                <option>USB-Serial (Auto-Detect)</option>
              </select>

              <div>{isEng ? 'Baud Rate:' : 'வேகம் (Baud):'}</div>
              <select className="win-input-classic" value={baudRate} onChange={(e) => setBaudRate(e.target.value)} style={{ height: 22 }}>
                <option>9600 (8-N-1)</option>
                <option>4800 (8-N-1)</option>
                <option>2400 (8-N-1)</option>
                <option>19200 (8-N-1)</option>
              </select>

              <div>{isEng ? 'Status:' : 'நிலை:'}</div>
              <div style={{ color: scaleEnabled ? '#008000' : '#808080', fontWeight: 'bold' }}>
                {scaleEnabled
                  ? (isEng ? '● Scale Port Open & Listening' : '● எடை இயந்திரம் இணைக்கப்பட்டது')
                  : (isEng ? '○ Disabled (Manual Entry)' : '○ முடக்கப்பட்டது (கைமுறை உள்ளீடு)')}
              </div>
            </div>
          </fieldset>

          {/* CARD PAYMENT TERMINAL GROUPBOX */}
          <fieldset style={{ border: '1px solid #808080', padding: 10, marginBottom: 12 }}>
            <legend style={{ color: '#800000', fontWeight: 'bold', fontSize: 12 }}>
              {isEng ? '💳 Card Machine / EDC Integration' : '💳 கார்டு இயந்திர இணைப்பு'}
            </legend>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 6, fontSize: 12, alignItems: 'center' }}>
              <div>{isEng ? 'Provider:' : 'வழங்குநர்:'}</div>
              <select className="win-input-classic" value={cardTerminal} onChange={(e) => setCardTerminal(e.target.value)} style={{ height: 22 }}>
                <option>Paytm / Pine Labs EDC (Manual Card Tender)</option>
                <option>Innoviti / Bank POS Terminal</option>
                <option>UPI Dynamic / Soundbox QR</option>
              </select>

              <div>{isEng ? 'Mode:' : 'முறை:'}</div>
              <div style={{ fontSize: 11, color: '#333' }}>
                {isEng
                  ? 'Amount entered/confirmed on screen; approval reference recorded in sales ledger.'
                  : 'தொகை திரையில் உறுதிசெய்யப்பட்டு விற்பனை கணக்கில் பதிவு செய்யப்படும்.'}
              </div>
            </div>
          </fieldset>

          {/* DESKTOP SHELL & LOCAL BRIDGE DIAGNOSTICS (WEIGHSoft Architecture) */}
          <fieldset style={{ border: '1px solid #808080', padding: 8, marginBottom: 12, background: '#F8FAFC' }}>
            <legend style={{ color: '#000080', fontWeight: 'bold', fontSize: 11.5 }}>
              {isEng ? `🖥 Desktop Runtime & Local Bridge (${APP_VERSION_TAG})` : `🖥 டெஸ்க்டாப் செயலி & உள்ளூர் சேமிப்பகம் (${APP_VERSION_TAG})`}
            </legend>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 4, fontSize: 11, alignItems: 'center' }}>
              <div>{isEng ? 'Environment:' : 'சூழல்:'}</div>
              <div style={{ fontWeight: 'bold', color: window.isElectron ? '#15803D' : '#1D4ED8' }}>
                {window.isElectron
                  ? (isEng ? `● Electron Desktop Shell (${APP_VERSION_TAG})` : `● டெஸ்க்டாப் செயலி (${APP_VERSION_TAG})`)
                  : (isEng ? `● Web Browser (${APP_VERSION_TAG})` : `● இணைய உலாவி (${APP_VERSION_TAG})`)}
              </div>
              {diag && (
                <>
                  <div>{isEng ? 'HTTP Bridge:' : 'HTTP இணைப்பு:'}</div>
                  <div style={{ fontFamily: 'monospace' }}>
                    {diag.bridgePort ? `http://127.0.0.1:${diag.bridgePort}` : (isEng ? 'Initializing...' : 'தொடங்குகிறது...')}
                  </div>
                  <div>{isEng ? 'Local Data Dir:' : 'தரவு கோப்புறை:'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 10.5 }}>{diag.dataDir}</span>
                    <button
                      type="button"
                      className="win-btn-classic"
                      style={{ fontSize: 10, height: 20 }}
                      onClick={() => window.barakahFs?.openDataFolder()}
                    >
                      {isEng ? 'Open Folder' : 'கோப்புறை திற'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </fieldset>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              className="win-btn-classic"
              style={{ minWidth: 100, height: 24, fontWeight: 'bold' }}
              onClick={handleSave}
            >
              {isEng ? 'Save & Close' : 'சேமி & மூடு'}
            </button>
            <button
              className="win-btn-classic"
              style={{ minWidth: 70, height: 24 }}
              onClick={onClose}
            >
              {isEng ? 'Cancel' : 'ரத்து'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
