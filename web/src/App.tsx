import React, { useState, useEffect } from 'react';
import { MdiShell } from './components/MdiShell';
import { LoginScreen } from './components/LoginScreen';
import { PosBillingScreen } from './components/PosBillingScreen';
import { SettingsModal, AppSettings } from './components/SettingsModal';
import {
  CategoryMasterScreen,
  ProductMasterScreen,
  CustomerMasterScreen,
  DenominationScreen,
  DayEndReportScreen,
  GenericMasterUtilityScreen
} from './components/MasterScreens';
import {
  SalesReturnScreen,
  PurchaseInvoiceScreen,
  ReceiptPaymentScreen,
  StockUtilityScreen,
  ReportsScreen
} from './components/TransactionScreens';
import './styles/classicTheme.css';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'tamil',
  scaleEnabled: false,
  comPort: 'COM1',
  baudRate: '9600 (8-N-1)',
  scaleModel: 'Essae DS-852 / Standard Continuous ASCII',
  cardTerminal: 'Paytm / Pine Labs EDC (Manual Card Tender)'
};

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(() => {
    try {
      const saved = localStorage.getItem('barakah_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeModule, setActiveModule] = useState<string>('sales_billing');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [childMinimized, setChildMinimized] = useState<boolean>(false);
  const [childMaximized, setChildMaximized] = useState<boolean>(true);

  const isEnglish = appSettings.language === 'english';

  // Global Ctrl+I shortcut to open Sales Information (as shown in Transactions menu)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setActiveModule('sales_billing');
        setChildMinimized(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
  };

  const handleToggleLanguage = (isEng: boolean) => {
    setAppSettings(prev => ({
      ...prev,
      language: isEng ? 'english' : 'tamil'
    }));
  };

  const handleSelectModule = (moduleName: string) => {
    setActiveModule(moduleName);
    setChildMinimized(false);
  };

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'none':
        return null;

      case 'sales_billing':
        return (
          <PosBillingScreen
            onOpenSettings={() => setIsSettingsOpen(true)}
            isEnglishMode={isEnglish}
            onToggleLanguage={handleToggleLanguage}
            onMinimize={() => setChildMinimized(true)}
            isMaximized={childMaximized}
            onToggleMaximize={() => setChildMaximized(prev => !prev)}
            onCloseWindow={() => setActiveModule('none')}
          />
        );

      case 'category_master':
        return <CategoryMasterScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} />;

      case 'product_master':
        return <ProductMasterScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} />;

      case 'customer_master':
        return <CustomerMasterScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} />;

      case 'denomination':
        return <DenominationScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} />;

      case 'day_end_report':
        return <DayEndReportScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} />;

      case 'sales_return':
        return <SalesReturnScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} />;

      case 'purchase_invoice':
        return <PurchaseInvoiceScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} />;

      case 'purchase_return':
        return <PurchaseInvoiceScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} isReturn />;

      case 'receipt_entry':
        return <ReceiptPaymentScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} mode="receipt" />;

      case 'payment_entry':
        return <ReceiptPaymentScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} mode="payment" />;

      case 'stock_conversion':
        return <StockUtilityScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} mode="conversion" />;

      case 'stock_update':
        return <StockUtilityScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} mode="update" />;

      case 'sales_reports':
      case 'stock_reports':
      case 'customer_reports':
      case 'supplier_reports':
      case 'profit_reports':
        return <ReportsScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} reportType={activeModule} />;

      case 'user_master':
      case 'config':
      case 'paid_in_out':
      case 'supplier_master':
      case 'tax_master':
      case 'barcode_gen':
        return <GenericMasterUtilityScreen onClose={() => setActiveModule('sales_billing')} isEnglish={isEnglish} moduleId={activeModule} />;

      default:
        return (
          <PosBillingScreen
            onOpenSettings={() => setIsSettingsOpen(true)}
            isEnglishMode={isEnglish}
            onToggleLanguage={handleToggleLanguage}
            onMinimize={() => setChildMinimized(true)}
            isMaximized={childMaximized}
            onToggleMaximize={() => setChildMaximized(prev => !prev)}
            onCloseWindow={() => setActiveModule('none')}
          />
        );
    }
  };

  const handleLogOff = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('barakah_user');
    } catch {}
    setActiveModule('sales_billing');
  };

  // If not logged in, show exact Slide 4 / image4.jpeg Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={(user) => {
          setCurrentUser(user);
          try {
            localStorage.setItem('barakah_user', JSON.stringify(user));
          } catch {}
          setActiveModule('sales_billing');
          setChildMinimized(false);
        }}
        isEnglish={isEnglish}
        onToggleLanguage={handleToggleLanguage}
      />
    );
  }

  return (
    <MdiShell
      activeModule={activeModule}
      onSelectModule={handleSelectModule}
      onOpenSettings={() => setIsSettingsOpen(true)}
      isChildMinimized={childMinimized}
      onRestoreChild={() => setChildMinimized(false)}
      onCloseChild={() => { setChildMinimized(false); setActiveModule('none'); }}
      isEnglish={isEnglish}
      currentUser={currentUser}
      onLogOff={handleLogOff}
    >
      {renderModuleContent()}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={appSettings}
        onSaveSettings={handleSaveSettings}
      />
    </MdiShell>
  );
};
export default App;
