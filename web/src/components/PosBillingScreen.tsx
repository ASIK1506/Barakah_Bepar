import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, Customer, PaymentDetails, Invoice, Estimation } from '../types';
import { SEED_PRODUCTS, SEED_CUSTOMERS } from '../data/seedData';
import { PaymentModal } from './PaymentModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { recordPosInvoiceToAdminStore } from '../lib/shopStore';
import { CustomerSearchModal } from './CustomerSearchModal';
import '../styles/classicTheme.css';

interface PosBillingScreenProps {
  onOpenSettings: () => void;
  isEnglishMode: boolean;
  onToggleLanguage?: (isEnglish: boolean) => void;
  onMinimize?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onCloseWindow?: () => void;
}

export const PosBillingScreen: React.FC<PosBillingScreenProps> = ({
  onOpenSettings,
  isEnglishMode,
  onToggleLanguage,
  onMinimize,
  isMaximized = true,
  onToggleMaximize,
  onCloseWindow
}) => {
  // Data
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(SEED_CUSTOMERS);
  const [activeCustomer, setActiveCustomer] = useState<Customer>(SEED_CUSTOMERS[0]); // Default F1 Cash

  // Checkboxes matching reference (Slide 30 / 1000x1000.webp)
  const [isGstEnabled, setIsGstEnabled] = useState(true);
  const [disableWeighingMachine, setDisableWeighingMachine] = useState(false);
  const [isEstimateMode, setIsEstimateMode] = useState(false);
  const [showBarcodeCol, setShowBarcodeCol] = useState(true);
  const isEnglishOnly = isEnglishMode;
  const [showName, setShowName] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'info' | 'list'>('info');

  // Invoice & Customer Fields
  const [invoiceNo, setInvoiceNo] = useState('SI18');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toLocaleDateString('en-GB'));
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [rateType, setRateType] = useState('1 RRate');
  const [customerCodeInput, setCustomerCodeInput] = useState('F1');
  const [customerNameInput, setCustomerNameInput] = useState('Cash');
  const [infoNote, setInfoNote] = useState('');

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);

  // Product Entry Form state
  const [entryBarcode, setEntryBarcode] = useState('');
  const [entryCode, setEntryCode] = useState('');
  const [entryName, setEntryName] = useState('');
  const [entryMrp, setEntryMrp] = useState('0.00');
  const [entryRate, setEntryRate] = useState('0.00');
  const [entryQty, setEntryQty] = useState('1');
  const [entryValue, setEntryValue] = useState('0.00');
  const [entryGst, setEntryGst] = useState('0');
  const [entryCess, setEntryCess] = useState('0');
  const [entryAcess, setEntryAcess] = useState('0.00');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Autocomplete
  const [isAutoCompleteOpen, setIsAutoCompleteOpen] = useState(false);
  const [autoCompleteIndex, setAutoCompleteIndex] = useState(0);

  // Modals & Popups (Matching Slide 33, 34, 35, 36, 41)
  const [isPrintConfirmOpen, setIsPrintConfirmOpen] = useState(false);
  const [isHoldConfirmOpen, setIsHoldConfirmOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);

  // Parked Bills Queue (Slide 35 F12 banner) & Sales List History (Slide 39)
  const [heldBills, setHeldBills] = useState<{ id: string; ticket: string; customer: string; count: number; total: number; items: CartItem[] }[]>([]);
  const [savedEstimates, setSavedEstimates] = useState<Estimation[]>([]);
  const [invoicesHistory, setInvoicesHistory] = useState<Invoice[]>([
    {
      id: 'inv-seed-17',
      invoiceNo: 'SI17',
      date: '14/08/2018',
      time: '10:30:00 AM',
      customer: SEED_CUSTOMERS[0],
      rateType: '1 RRate',
      items: [
        {
          serialNo: 1,
          product: SEED_PRODUCTS[0],
          quantity: 1,
          rate: SEED_PRODUCTS[0].rate,
          lineValue: SEED_PRODUCTS[0].rate,
          mrp: SEED_PRODUCTS[0].mrp,
          taxPercent: 5,
          taxAmount: 8.57,
          cessAmount: 0,
          additionalCess: 0
        },
        {
          serialNo: 2,
          product: SEED_PRODUCTS[5],
          quantity: 1,
          rate: SEED_PRODUCTS[5].rate,
          lineValue: SEED_PRODUCTS[5].rate,
          mrp: SEED_PRODUCTS[5].mrp,
          taxPercent: 5,
          taxAmount: 4.29,
          cessAmount: 0,
          additionalCess: 0
        }
      ],
      itemsCount: 2,
      grossAmount: 270.00,
      pointsRedeemed: 0,
      taxAmount: 12.86,
      cessAmount: 0,
      additionalCess: 0,
      discountAmount: 0,
      deliveryCharge: 0,
      roundOff: 0,
      netAmount: 270.00,
      payment: { mode: 'CARD', amount: 270.00, paidAmount: 270.00, changeAmount: 0 },
      isEstimate: false,
      createdAt: '2018-08-14T10:30:00Z'
    },
    {
      id: 'inv-seed-16',
      invoiceNo: 'SI16',
      date: '14/08/2018',
      time: '09:15:00 AM',
      customer: SEED_CUSTOMERS[1],
      rateType: '1 RRate',
      items: [
        {
          serialNo: 1,
          product: SEED_PRODUCTS[1],
          quantity: 2,
          rate: SEED_PRODUCTS[1].rate,
          lineValue: SEED_PRODUCTS[1].rate * 2,
          mrp: SEED_PRODUCTS[1].mrp,
          taxPercent: 5,
          taxAmount: 26.67,
          cessAmount: 0,
          additionalCess: 0
        }
      ],
      itemsCount: 1,
      grossAmount: 560.00,
      pointsRedeemed: 0,
      taxAmount: 26.67,
      cessAmount: 0,
      additionalCess: 0,
      discountAmount: 0,
      deliveryCharge: 0,
      roundOff: 0,
      netAmount: 560.00,
      payment: { mode: 'CASH', amount: 560.00, paidAmount: 600.00, changeAmount: 40.00 },
      isEstimate: false,
      createdAt: '2018-08-14T09:15:00Z'
    }
  ]);
  const [historyIdx, setHistoryIdx] = useState<number | null>(null);
  const [nextInvoiceSeq, setNextInvoiceSeq] = useState<number>(18);
  const [listFilterInv, setListFilterInv] = useState('');
  const [listFilterAmt, setListFilterAmt] = useState('');
  const [listFilterCust, setListFilterCust] = useState('');
  const [latestInvoice, setLatestInvoice] = useState<Invoice | null>(null);
  const [changeReturnedAmt, setChangeReturnedAmt] = useState('0.00');

  // Input refs
  const barcodeRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial focus on yellow barcode box
  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  // Calculate Rate based on selected product and rate type
  const getProductRate = (prod: Product): number => {
    if (rateType.includes('3') && prod.wholesaleRate) return prod.wholesaleRate;
    if (rateType.includes('2') && prod.branchRate) return prod.branchRate;
    return prod.rate;
  };

  // Filtered products for autocomplete popup
  const filteredProducts = products.filter(p => {
    const query = (entryName || entryBarcode).trim().toLowerCase();
    if (!query) return false;
    return (
      p.code.toLowerCase().includes(query) ||
      p.barcode.includes(query) ||
      p.name.toLowerCase().includes(query) ||
      p.tamilName.includes(query)
    );
  });

  // Select a product from autocomplete
  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setEntryCode(prod.code);
    setEntryBarcode(prod.barcode);
    setEntryName(prod.name);
    setEntryMrp(prod.mrp.toFixed(2));
    const r = getProductRate(prod);
    setEntryRate(r.toFixed(2));
    const q = prod.isDecimal ? '1.000' : '1';
    setEntryQty(q);
    setEntryValue((parseFloat(q) * r).toFixed(2));
    setEntryGst(prod.taxSlabId === 'T1' ? '5' : '0');
    setIsAutoCompleteOpen(false);
    qtyRef.current?.focus();
  };

  // When Qty or Rate changes, update Value
  const handleQtyChange = (val: string) => {
    setEntryQty(val);
    const q = parseFloat(val) || 0;
    const r = parseFloat(entryRate) || 0;
    setEntryValue((q * r).toFixed(2));
  };

  const handleRateChange = (val: string) => {
    setEntryRate(val);
    const q = parseFloat(entryQty) || 0;
    const r = parseFloat(val) || 0;
    setEntryValue((q * r).toFixed(2));
  };

  // Add Item to Table
  const handleAddItem = () => {
    if (!selectedProduct) {
      const found = products.find(p => p.code === entryBarcode || p.barcode === entryBarcode || p.name.toLowerCase() === entryName.toLowerCase());
      if (found) {
        handleSelectProduct(found);
        return;
      }
      alert(isEnglishOnly ? 'Product not found! Scan barcode or select item from popup.' : 'பொருள் காணப்படவில்லை! பார்கோடு ஸ்கேன் செய்யவும்.');
      return;
    }

    const q = parseFloat(entryQty) || 1;
    const r = parseFloat(entryRate) || selectedProduct.rate;
    const lineVal = q * r;
    const taxP = selectedProduct.taxSlabId === 'T1' ? 5 : 0;
    const taxAmt = taxP > 0 ? (lineVal - (lineVal / (1 + (taxP / 100)))) : 0;

    const newItem: CartItem = {
      serialNo: cartItems.length + 1,
      product: selectedProduct,
      quantity: q,
      rate: r,
      lineValue: lineVal,
      mrp: selectedProduct.mrp,
      taxPercent: taxP,
      taxAmount: taxAmt,
      cessAmount: 0,
      additionalCess: 0
    };

    setCartItems(prev => [...prev, newItem]);
    setSelectedRowIndex(cartItems.length);

    // Reset entry fields
    setSelectedProduct(null);
    setEntryBarcode('');
    setEntryCode('');
    setEntryName('');
    setEntryMrp('0.00');
    setEntryRate('0.00');
    setEntryQty('1');
    setEntryValue('0.00');
    setEntryGst('0');
    setEntryCess('0');
    setEntryAcess('0.00');
    setIsAutoCompleteOpen(false);
    barcodeRef.current?.focus();
  };

  // Delete line item (CTRL+X or F7)
  const handleDeleteRow = (idx?: number) => {
    const target = idx !== undefined ? idx : selectedRowIndex;
    if (target >= 0 && target < cartItems.length) {
      setCartItems(prev => {
        const next = prev.filter((_, i) => i !== target);
        return next.map((item, i) => ({ ...item, serialNo: i + 1 }));
      });
      setSelectedRowIndex(prev => Math.min(prev, cartItems.length - 2));
    }
  };

  // Close POS child window cleanly
  const handleClosePos = () => {
    if (cartItems.length > 0 && historyIdx === null) {
      const ok = window.confirm(
        isEnglishOnly
          ? 'Current bill has unsaved items. Close Sales Info window?'
          : 'பில் சேமிக்கப்படவில்லை. விற்பனைத் திரையை மூட வேண்டுமா?'
      );
      if (!ok) return;
    }
    onCloseWindow?.();
  };

  // Load a saved invoice from history into the POS view
  const loadHistoryInvoice = (idx: number) => {
    const inv = invoicesHistory[idx];
    if (!inv) return;
    setHistoryIdx(idx);
    setInvoiceNo(inv.invoiceNo);
    setInvoiceDate(inv.date);
    setActiveCustomer(inv.customer);
    setCustomerCodeInput(inv.customer.code);
    setCustomerNameInput(inv.customer.name);
    setCartItems(inv.items);
    setChangeReturnedAmt(inv.payment.changeAmount.toFixed(2));
    setLatestInvoice(inv);
    setSelectedRowIndex(inv.items.length > 0 ? 0 : -1);
  };

  // Record Navigation Controls (|<, << F8, >> F7, >|)
  const handleFirstBill = () => {
    if (invoicesHistory.length === 0) return;
    loadHistoryInvoice(invoicesHistory.length - 1); // Oldest
  };

  const handlePrevBill = () => {
    if (invoicesHistory.length === 0) return;
    if (historyIdx === null) {
      loadHistoryInvoice(0); // Step back from new bill to most recent saved
    } else if (historyIdx < invoicesHistory.length - 1) {
      loadHistoryInvoice(historyIdx + 1);
    }
  };

  const handleNextBill = () => {
    if (historyIdx === null) return;
    if (historyIdx > 0) {
      loadHistoryInvoice(historyIdx - 1);
    } else {
      // Back to fresh new invoice
      setHistoryIdx(null);
      setInvoiceNo(`SI${nextInvoiceSeq}`);
      setInvoiceDate(new Date().toLocaleDateString('en-GB'));
      setActiveCustomer(SEED_CUSTOMERS[0]);
      setCustomerCodeInput(SEED_CUSTOMERS[0].code);
      setCustomerNameInput(SEED_CUSTOMERS[0].name);
      setCartItems([]);
      setSelectedRowIndex(-1);
      setChangeReturnedAmt('0.00');
      barcodeRef.current?.focus();
    }
  };

  const handleLatestBill = () => {
    if (invoicesHistory.length === 0) return;
    loadHistoryInvoice(0); // Newest saved
  };

  // Print handler (Print button / ALT+P)
  const handlePrintClick = () => {
    if (cartItems.length > 0) {
      setIsPrintConfirmOpen(true);
    } else if (latestInvoice) {
      setIsReceiptModalOpen(true);
    } else {
      alert(isEnglishOnly ? 'No items or invoice to print.' : 'அச்சிட பொருட்கள் இல்லை.');
    }
  };

  // New Record (CTRL+N)
  const handleNewRecord = () => {
    const confirmMsg = isEnglishOnly ? 'Start new invoice? Any unsaved items will be cleared.' : 'புதிய பில் தொடங்கவா? சேமிக்காதவை அழியும்.';
    if (cartItems.length > 0 && historyIdx === null && !window.confirm(confirmMsg)) {
      return;
    }
    setHistoryIdx(null);
    setInvoiceNo(`SI${nextInvoiceSeq}`);
    setInvoiceDate(new Date().toLocaleDateString('en-GB'));
    setActiveCustomer(SEED_CUSTOMERS[0]);
    setCustomerCodeInput(SEED_CUSTOMERS[0].code);
    setCustomerNameInput(SEED_CUSTOMERS[0].name);
    setCartItems([]);
    setSelectedRowIndex(-1);
    setSelectedProduct(null);
    setEntryBarcode('');
    setEntryName('');
    setEntryQty('1');
    setChangeReturnedAmt('0.00');
    barcodeRef.current?.focus();
  };

  // Save Bill (CTRL+S) -> triggers Confirm Print modal matching Slide 33
  const handleSaveBill = () => {
    if (cartItems.length === 0) {
      alert(isEnglishOnly ? 'Cart is empty. Please scan items to bill.' : 'பொருட்கள் எதுவும் சேர்க்கப்படவில்லை.');
      return;
    }

    if (isEstimateMode) {
      // Estimate Mode: Save quotation with ZERO stock deduction
      const newEst: Estimation = {
        estimateCode: `EST-${Date.now().toString().slice(-4)}`,
        date: invoiceDate,
        time: currentTime,
        customer: activeCustomer,
        items: cartItems,
        grossAmount: totalNetAmt,
        taxAmount: totalTaxAmt,
        netAmount: Math.round(totalNetAmt),
        status: 'ACTIVE'
      };
      setSavedEstimates(prev => [newEst, ...prev]);
      window.barakahFs?.appendTransaction({ type: 'ESTIMATE', ...newEst }).catch(() => {});
      alert(isEnglishOnly
        ? `Estimate ${newEst.estimateCode} saved!\nZero stock deducted from inventory.`
        : `மதிப்பீடு ${newEst.estimateCode} சேமிக்கப்பட்டது!\nசரக்கு இருப்பு குறையாது.`);
      handleNewRecord();
      return;
    }

    // Open Slide 33 Confirm Print Dialog
    setIsPrintConfirmOpen(true);
  };

  // Confirm Print Action (Slide 33: "Do you want to print? Yes / No")
  const handleConfirmPrintAction = (shouldPrint: boolean) => {
    setIsPrintConfirmOpen(false);

    // Build invoice record
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: invoiceNo,
      date: invoiceDate,
      time: currentTime,
      customer: activeCustomer,
      rateType,
      items: cartItems,
      itemsCount: cartItems.length,
      grossAmount: totalNetAmt,
      pointsRedeemed: 0,
      taxAmount: totalTaxAmt,
      cessAmount: 0,
      additionalCess: 0,
      discountAmount: 0,
      deliveryCharge: 0,
      roundOff: 0,
      netAmount: Math.round(totalNetAmt),
      payment: {
        mode: 'CASH',
        amount: Math.round(totalNetAmt),
        paidAmount: Math.round(totalNetAmt),
        changeAmount: 0
      },
      isEstimate: false,
      createdAt: new Date().toISOString()
    };

    // Deduct stock for official invoice
    setProducts(prev => {
      const copy = [...prev];
      cartItems.forEach(item => {
        const p = copy.find(x => x.id === item.product.id);
        if (p) {
          p.currentStock = Math.max(0, p.currentStock - item.quantity);
        }
      });
      return copy;
    });

    setLatestInvoice(newInv);
    setInvoicesHistory(prev => [newInv, ...prev]);
    recordPosInvoiceToAdminStore(newInv);
    window.barakahFs?.appendTransaction({ type: 'INVOICE', ...newInv }).catch(() => {});
    window.barakahFs?.saveSnapshot(`invoice_${newInv.invoiceNo}`, newInv).catch(() => {});

    if (shouldPrint) {
      setIsReceiptModalOpen(true);
    } else {
      alert(isEnglishOnly ? `Invoice ${invoiceNo} saved successfully!` : `பில் ${invoiceNo} வெற்றிகரமாக சேமிக்கப்பட்டது!`);
    }

    // Increment bill no
    const nextSeq = nextInvoiceSeq + 1;
    setNextInvoiceSeq(nextSeq);
    setHistoryIdx(null);
    setInvoiceNo(`SI${nextSeq}`);
    setCartItems([]);
    setSelectedRowIndex(-1);
    barcodeRef.current?.focus();
  };

  // Hold Bill (F11 - Slide 34)
  const handleHoldBill = () => {
    if (cartItems.length === 0) {
      alert(isEnglishOnly ? 'Cart is empty. Nothing to put on hold.' : 'நிறுத்தி வைக்க பொருட்கள் இல்லை.');
      return;
    }
    setIsHoldConfirmOpen(true);
  };

  const confirmHoldData = () => {
    setIsHoldConfirmOpen(false);
    const ticket = `${invoiceDate.slice(0, 5)} ${activeCustomer.name} | ${cartItems.length} | ₹ ${totalNetAmt.toFixed(2)}`;
    setHeldBills(prev => [
      ...prev,
      {
        id: `hold-${Date.now()}`,
        ticket,
        customer: activeCustomer.name,
        count: cartItems.length,
        total: totalNetAmt,
        items: cartItems
      }
    ]);
    setCartItems([]);
    setSelectedRowIndex(-1);
    alert(isEnglishOnly
      ? 'Bill put on hold! Banner displayed across top bar for F12 Recall.'
      : 'பில் நிறுத்தி வைக்கப்பட்டது! F12 அழுத்தி மீண்டும் எடுக்கலாம்.');
  };

  // Retrieve Held Bill (F12 - Slide 35)
  const handleRetrieveHeldBill = (bill: typeof heldBills[0]) => {
    setCartItems(bill.items);
    setHeldBills(prev => prev.filter(b => b.id !== bill.id));
    barcodeRef.current?.focus();
  };

  // Calculate totals
  const totalItemsCount = cartItems.length;
  const totalQtySum = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalNetAmt = cartItems.reduce((sum, item) => sum + item.lineValue, 0);
  const totalTaxAmt = cartItems.reduce((sum, item) => sum + item.taxAmount, 0);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        barcodeRef.current?.focus();
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (cartItems.length > 0) setIsPaymentModalOpen(true);
      } else if (e.key === 'F5') {
        e.preventDefault();
        // Toggle Rate Type
        setRateType(prev => (prev === '1 RRate' ? '3 WRate' : '1 RRate'));
      } else if (e.key === 'F6') {
        e.preventDefault();
        setIsCustomerSearchOpen(true);
      } else if (e.key === 'F7') {
        e.preventDefault();
        handleNextBill();
      } else if (e.key === 'F8') {
        e.preventDefault();
        handlePrevBill();
      } else if (e.key === 'Escape') {
        if (!isPrintConfirmOpen && !isHoldConfirmOpen && !isPaymentModalOpen && !isReceiptModalOpen && !isCustomerSearchOpen) {
          e.preventDefault();
          handleClosePos();
        }
      } else if (e.key === 'F11') {
        e.preventDefault();
        handleHoldBill();
      } else if (e.key === 'F12') {
        e.preventDefault();
        if (heldBills.length > 0) {
          handleRetrieveHeldBill(heldBills[0]);
        } else {
          alert('No bills currently on hold.');
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewRecord();
      } else if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveBill();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleDeleteRow();
      } else if (e.key === 'ArrowDown' && isAutoCompleteOpen) {
        e.preventDefault();
        setAutoCompleteIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
      } else if (e.key === 'ArrowUp' && isAutoCompleteOpen) {
        e.preventDefault();
        setAutoCompleteIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && isAutoCompleteOpen && filteredProducts[autoCompleteIndex]) {
        e.preventDefault();
        handleSelectProduct(filteredProducts[autoCompleteIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems, isAutoCompleteOpen, filteredProducts, autoCompleteIndex, heldBills, rateType, activeCustomer, invoiceDate, currentTime]);

  return (
    <div className={`win-child-window ${isMaximized ? 'maximized' : 'restored'}`}>
      {/* Child Window Title Bar */}
      <div className="win-child-titlebar">
        <span>{isEnglishOnly ? 'Sales Info' : 'விற்பனை விபரம்'}{historyIdx !== null ? ` [${invoiceNo}]` : ''}</span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button className="win-control-btn" title="Minimize Sales Info" onClick={onMinimize}>_</button>
          <button className="win-control-btn" title={isMaximized ? 'Restore Down' : 'Maximize'} onClick={onToggleMaximize}>□</button>
          <button className="win-control-btn" style={{ color: '#B91C1C' }} title="Close Sales Info (ESC)" onClick={handleClosePos}>✕</button>
        </div>
      </div>

      {/* Slide 35 F12 Held Bills Blue Top Banner (When active) */}
      {heldBills.length > 0 && (
        <div style={{
          background: '#000080',
          color: '#FFFFFF',
          padding: '3px 8px',
          fontSize: 11.5,
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #FFF'
        }}>
          <span>📥 {isEnglishOnly ? 'HELD BILL:' : 'நிறுத்திய பில்:'} {heldBills[0].ticket}</span>
          <button
            className="win-btn-classic"
            style={{ fontSize: 10, height: 18, padding: '0 8px', background: '#FFF' }}
            onClick={() => handleRetrieveHeldBill(heldBills[0])}
          >
            {isEnglishOnly ? 'F12 - Retrive Holded Bill' : 'F12 - நிறுத்திய பில் எடு'}
          </button>
        </div>
      )}

      {/* MAIN POS TOP HEADER (Matching 1000x1000.webp & Screenshot 2026-11-24 121834.png) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#ECE9D8', borderBottom: '1px solid #808080' }}>
        {/* Left: Huge Amount and Qty/Nos */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 28, fontWeight: 'bold', fontFamily: 'Arial, Helvetica, sans-serif', color: '#000000', letterSpacing: -0.5 }}>
            {totalNetAmt.toFixed(2)}
          </span>
          <span style={{ fontSize: 20, fontWeight: 'bold', color: '#000080' }}>
            {isEnglishOnly
              ? `${totalQtySum % 1 === 0 ? totalQtySum : totalQtySum.toFixed(2)} Nos`
              : `${totalQtySum % 1 === 0 ? totalQtySum : totalQtySum.toFixed(2)} எண்`}
          </span>
        </div>

        {/* Center: Red Stock Balance & Admin/Time */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 'bold', color: '#CC0000' }}>
            {isEnglishOnly ? 'Stock - 0.0' : 'இருப்பு : -74'}
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 10.5, color: '#000080', fontWeight: 'bold' }}>
            <span>{currentTime}</span>
            <span>ADMIN</span>
          </div>
        </div>

        {/* Right: The 5 Iconic Buttons + Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          {/* 5 Iconic Toolbar Buttons (New, Save, Delete, Print, Close) */}
          <div className="action-buttons-box">
            {/* 1. New */}
            <div className="action-btn" title="New Bill (CTRL+N)" onClick={handleNewRecord}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              {isEnglishOnly ? (
                <span className="action-btn-label-en">New</span>
              ) : (
                <span className="action-btn-label-ta">சேர்ப்பு</span>
              )}
            </div>

            {/* 2. Save */}
            <div className="action-btn" title="Save Bill (CTRL+S)" onClick={handleSaveBill}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1D4ED8" stroke="#1D4ED8" strokeWidth="1">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21" fill="#FFF"></polyline>
                <rect x="7" y="3" width="9" height="5" fill="#FFF"></rect>
              </svg>
              {isEnglishOnly ? (
                <span className="action-btn-label-en">Save</span>
              ) : (
                <span className="action-btn-label-ta">பதிவு</span>
              )}
            </div>

            {/* 3. Delete */}
            <div className="action-btn" title="Delete Row (CTRL+X)" onClick={() => handleDeleteRow()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#DC2626" stroke="#DC2626" strokeWidth="1">
                <polygon points="12 2 22 20 2 20"></polygon>
                <line x1="12" y1="9" x2="12" y2="13" stroke="#FFF" strokeWidth="2"></line>
                <circle cx="12" cy="17" r="1" fill="#FFF"></circle>
              </svg>
              {isEnglishOnly ? (
                <span className="action-btn-label-en">Delete</span>
              ) : (
                <span className="action-btn-label-ta">ரத்து</span>
              )}
            </div>

            {/* 4. Print */}
            <div className="action-btn" title="Print Slip (ALT+P)" onClick={handlePrintClick}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              {isEnglishOnly ? (
                <span className="action-btn-label-en">Print</span>
              ) : (
                <span className="action-btn-label-ta">அச்சிடு</span>
              )}
            </div>

            {/* 5. Close */}
            <div className="action-btn" title="Exit / Close (ESC)" onClick={handleClosePos}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#B91C1C" stroke="#B91C1C" strokeWidth="1">
                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                <line x1="12" y1="8" x2="12" y2="12" stroke="#FFF" strokeWidth="2"></line>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="#FFF" strokeWidth="2"></line>
              </svg>
              {isEnglishOnly ? (
                <span className="action-btn-label-en">Close</span>
              ) : (
                <span className="action-btn-label-ta">முற்றும்</span>
              )}
            </div>
          </div>

          {/* Checkboxes Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', color: '#800000', fontWeight: 'bold' }}>
              <input type="checkbox" checked={isGstEnabled} onChange={e => setIsGstEnabled(e.target.checked)} />
              GST
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
              <input type="checkbox" checked={disableWeighingMachine} onChange={e => setDisableWeighingMachine(e.target.checked)} />
              DISABLE W/M
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', color: isEstimateMode ? '#B45309' : '#000', fontWeight: isEstimateMode ? 'bold' : 'normal' }}>
              <input type="checkbox" checked={isEstimateMode} onChange={e => setIsEstimateMode(e.target.checked)} />
              EST
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
              <input type="checkbox" checked={showBarcodeCol} onChange={e => setShowBarcodeCol(e.target.checked)} />
              BCODE
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isEnglishOnly}
                onChange={e => onToggleLanguage?.(e.target.checked)}
                title="Toggle English / Tamil"
              />
              ENG
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
              <input type="checkbox" checked={showName} onChange={e => setShowName(e.target.checked)} />
              NAME
            </label>
          </div>
        </div>
      </div>

      {/* TAB HEADER STRIP (Sales Info | Sales List) */}
      <div className="win-tabs-container">
        <div
          className={`win-tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          {isEnglishOnly ? 'Sales Info' : 'விபரங்கள்'}
        </div>
        <div
          className={`win-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          {isEnglishOnly ? 'Sales List' : 'பட்டியல்'}
        </div>
      </div>

      {/* TAB CONTENT AREA */}
      {activeTab === 'list' ? (
        /* SLIDE 39: SALES LIST TAB */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ECE9D8', padding: '4px 6px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 11 }}>
            <label style={{ color: '#000080', fontWeight: 'bold' }}>{isEnglishOnly ? 'Invoice No' : 'பில் எண்'}</label>
            <input
              type="text"
              className="win-input-classic"
              style={{ width: 90 }}
              value={listFilterInv}
              onChange={e => setListFilterInv(e.target.value)}
            />
            <span style={{ color: '#CC0000', fontWeight: 'bold' }}>
              {isEnglishOnly ? 'Press F4 for Date Selection' : 'தேதி தேர்வுக்கு F4 அழுத்தவும்'}
            </span>
            <label style={{ color: '#000080', fontWeight: 'bold' }}>{isEnglishOnly ? 'Amount' : 'தொகை'}</label>
            <input
              type="text"
              className="win-input-classic"
              style={{ width: 90 }}
              value={listFilterAmt}
              onChange={e => setListFilterAmt(e.target.value)}
            />
            <label style={{ color: '#000080', fontWeight: 'bold' }}>{isEnglishOnly ? 'Customer Name :' : 'வாடிக்கையாளர் :'}</label>
            <input
              type="text"
              className="win-input-classic"
              style={{ flex: 1 }}
              value={listFilterCust}
              onChange={e => setListFilterCust(e.target.value)}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', background: '#808080', border: '1px inset #808080' }}>
            <table className="vanigam-grid">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>{isEnglishOnly ? 'Inv No' : 'பில் எண்'}</th>
                  <th style={{ width: 90 }}>{isEnglishOnly ? 'Inv Date' : 'தேதி'}</th>
                  <th style={{ width: 180 }}>{isEnglishOnly ? 'Customer Name' : 'வாடிக்கையாளர்'}</th>
                  <th style={{ width: 55, textAlign: 'right' }}>{isEnglishOnly ? 'Items' : 'எண்'}</th>
                  <th style={{ width: 85, textAlign: 'right' }}>{isEnglishOnly ? 'Nett Amt' : 'மொத்தம்'}</th>
                  <th style={{ width: 80, textAlign: 'right' }}>{isEnglishOnly ? 'Cash Amt' : 'ரொக்கம்'}</th>
                  <th style={{ width: 80, textAlign: 'right' }}>{isEnglishOnly ? 'Card Amt' : 'கார்டு'}</th>
                  <th style={{ width: 75, textAlign: 'right' }}>{isEnglishOnly ? 'Sodexho' : 'சோடெக்சோ'}</th>
                  <th style={{ width: 75, textAlign: 'right' }}>{isEnglishOnly ? 'Cheque' : 'காசோலை'}</th>
                  <th style={{ width: 75, textAlign: 'right' }}>{isEnglishOnly ? 'Others' : 'மற்றவை'}</th>
                </tr>
              </thead>
              <tbody>
                {invoicesHistory
                  .filter(inv =>
                    (!listFilterInv || inv.invoiceNo.toLowerCase().includes(listFilterInv.toLowerCase())) &&
                    (!listFilterAmt || inv.netAmount.toString().includes(listFilterAmt)) &&
                    (!listFilterCust || inv.customer.name.toLowerCase().includes(listFilterCust.toLowerCase()))
                  )
                  .map(inv => (
                    <tr key={inv.id} onDoubleClick={() => { setLatestInvoice(inv); setIsReceiptModalOpen(true); }} style={{ cursor: 'pointer' }}>
                      <td style={{ fontWeight: 'bold' }}>{inv.invoiceNo}</td>
                      <td>{inv.date}</td>
                      <td>{inv.customer.name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{inv.itemsCount}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{inv.netAmount.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>{inv.payment.mode === 'CASH' ? inv.netAmount.toFixed(2) : '0.00'}</td>
                      <td style={{ textAlign: 'right' }}>{inv.payment.mode === 'CARD' ? inv.netAmount.toFixed(2) : '0.00'}</td>
                      <td style={{ textAlign: 'right' }}>{inv.payment.mode === 'SODEXHO' ? inv.netAmount.toFixed(2) : ''}</td>
                      <td style={{ textAlign: 'right' }}>{inv.payment.mode === 'CHQ/DD' ? inv.netAmount.toFixed(2) : ''}</td>
                      <td style={{ textAlign: 'right' }}></td>
                    </tr>
                  ))}
                <tr style={{ fontWeight: 'bold', background: '#ECE9D8' }}>
                  <td></td>
                  <td>{isEnglishOnly ? 'Total' : 'மொத்தம்'}</td>
                  <td></td>
                  <td></td>
                  <td style={{ textAlign: 'right' }}>
                    {invoicesHistory.reduce((s, i) => s + i.netAmount, 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {invoicesHistory.filter(i => i.payment.mode === 'CASH').reduce((s, i) => s + i.netAmount, 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {invoicesHistory.filter(i => i.payment.mode === 'CARD').reduce((s, i) => s + i.netAmount, 0).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>0.00</td>
                  <td style={{ textAlign: 'right' }}>0.00</td>
                  <td style={{ textAlign: 'right' }}>0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
      <>
      {/* TOP INVOICE & CUSTOMER SECTION */}
      <div style={{
        display: 'flex',
        padding: '3px 6px',
        background: '#ECE9D8',
        borderBottom: '1px solid #808080',
        gap: 8,
        alignItems: 'flex-start'
      }}>
        {/* Left: Invoice Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: 230 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: '#666' }}>0</span>
            <label style={{ width: 80, fontSize: 11, textAlign: 'right' }}>
              {isEnglishOnly ? 'Invoice No' : 'பில் எண்:'}
            </label>
            <input
              type="text"
              className="win-input-classic"
              style={{ width: 120, fontWeight: 'bold' }}
              value={invoiceNo}
              onChange={e => setInvoiceNo(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'transparent' }}>0</span>
            <label style={{ width: 80, fontSize: 11, textAlign: 'right' }}>
              {isEnglishOnly ? 'Invoice Date' : 'பில் தேதி:'}
            </label>
            <input
              type="text"
              className="win-input-classic"
              style={{ width: 120 }}
              value={invoiceDate}
              onChange={e => setInvoiceDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'transparent' }}>0</span>
            <label style={{ width: 80, fontSize: 11, textAlign: 'right', color: '#800000', fontWeight: 'bold' }}>
              {isEnglishOnly ? 'RATE TYPE:' : 'விலை வகை:'}
            </label>
            <select
              className="win-input-classic"
              style={{ width: 120, fontSize: 11 }}
              value={rateType}
              onChange={e => setRateType(e.target.value)}
            >
              <option value="1 RRate">1 RRate</option>
              <option value="2 SRate">2 SRate</option>
              <option value="3 WRate">3 மொ.விலை</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: 'transparent' }}>0</span>
            <label style={{ width: 80, fontSize: 11, textAlign: 'right' }}>
              {isEnglishOnly ? 'Customer Code' : 'எண் :'}
            </label>
            <input
              type="text"
              className="win-input-classic"
              style={{ width: 120 }}
              value={customerCodeInput}
              onChange={e => setCustomerCodeInput(e.target.value)}
            />
          </div>
        </div>

        {/* Middle Navigation Red Pill Buttons (F8 & F7 neatly below << and >>) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2 }}>
          <div className="nav-btn-group">
            <div className="nav-btn-col">
              <button className="nav-btn" title={isEnglishOnly ? 'First Saved Bill (Oldest)' : 'முதல் பில்'} onClick={handleFirstBill}>|&lt;</button>
            </div>
            <div className="nav-btn-col">
              <button className="nav-btn" title={isEnglishOnly ? 'Previous / Last Bill (F8)' : 'முந்தைய பில் (F8)'} onClick={handlePrevBill}>&lt;&lt;</button>
              <span className="nav-btn-subtext">F8</span>
            </div>
            <div className="nav-btn-col">
              <button className="nav-btn" title={isEnglishOnly ? 'Next Bill / New Bill (F7)' : 'அடுத்த பில் (F7)'} onClick={handleNextBill}>&gt;&gt;</button>
              <span className="nav-btn-subtext">F7</span>
            </div>
            <div className="nav-btn-col">
              <button className="nav-btn" title={isEnglishOnly ? 'Latest Saved Bill' : 'கடைசி பில்'} onClick={handleLatestBill}>&gt;|</button>
            </div>
          </div>
        </div>

        {/* Right: Bordered Customer Box */}
        <fieldset style={{
          flex: 1,
          border: '1px solid #7F9DB9',
          padding: '2px 6px',
          background: '#F0F8FF', // Soft light cyan/blue
          margin: 0
        }}>
          <legend style={{ fontSize: 10.5, color: '#B45309', fontWeight: 'bold' }}>
            {isEnglishOnly ? 'Customer Name' : 'வாடிக்கையாளர்'}
          </legend>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input
                type="text"
                className="win-input-classic"
                style={{ flex: 1, background: '#FFF' }}
                value={customerNameInput}
                onChange={e => setCustomerNameInput(e.target.value)}
              />
              <button
                className="win-btn-classic"
                style={{ fontSize: 10, height: 20 }}
                onClick={() => setIsCustomerSearchOpen(true)}
              >
                {isEnglishOnly ? 'F6 Search' : 'F6 தேடு'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, alignItems: 'center', fontSize: 10.5 }}>
              <div>
                <label style={{ display: 'block', color: '#666' }}>{isEnglishOnly ? 'T.POINTS' : 'பாயிண்ட்'}</label>
                <input type="text" className="win-input-classic" style={{ width: '100%' }} value="0.00" readOnly />
              </div>
              <div>
                <label style={{ display: 'block', color: '#666' }}>{isEnglishOnly ? 'Prev Purchase' : 'முன் பாக்கி'}</label>
                <input type="text" className="win-input-classic" style={{ width: '100%' }} value={activeCustomer.previousPurchase || '04/01/23'} readOnly />
              </div>
              <div>
                <label style={{ display: 'block', color: '#666' }}>{isEnglishOnly ? 'Balance' : 'மு.கொள்முதல்'}</label>
                <input
                  type="text"
                  className="win-input-classic"
                  style={{ width: '100%', color: activeCustomer.balance > 0 ? '#B22222' : '#000', fontWeight: 'bold' }}
                  value={activeCustomer.balance.toFixed(2)}
                  readOnly
                />
              </div>
            </div>
          </div>
        </fieldset>

        {/* Far Right Vertical S A L E Ribbon */}
        <div className="sale-vertical-ribbon">
          <span>S</span>
          <span>A</span>
          <span>L</span>
          <span>E</span>
        </div>
      </div>

      {/* PRODUCT ENTRY BOX (Bordered 'Product' Groupbox) */}
      <fieldset style={{
        margin: '2px 6px',
        padding: '2px 6px',
        border: '1px solid #808080',
        background: '#ECE9D8',
        position: 'relative'
      }}>
        <legend style={{ color: '#800000', fontWeight: 'bold', fontSize: 11 }}>
          {isEnglishOnly ? 'Product' : 'பொருள்'}
        </legend>

        <span style={{ position: 'absolute', top: -8, left: 70, fontSize: 10, color: '#666' }}>0</span>

        {/* Top line: Barcode + Yellow Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 10, color: '#666' }}>0</span>
          <label style={{ fontSize: 11, fontWeight: 'bold', color: '#800000' }}>
            {isEnglishOnly ? 'Barcode :' : 'பார்கோடு :'}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              ref={barcodeRef}
              type="text"
              className="win-input-barcode-yellow"
              style={{ width: 170 }}
              placeholder={isEnglishOnly ? 'Scan Barcode / Code...' : 'பார்கோடு / குறியீடு...'}
              value={entryBarcode}
              onChange={e => {
                setEntryBarcode(e.target.value);
                setIsAutoCompleteOpen(true);
                setAutoCompleteIndex(0);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (isAutoCompleteOpen && filteredProducts[autoCompleteIndex]) {
                    handleSelectProduct(filteredProducts[autoCompleteIndex]);
                  } else {
                    handleAddItem();
                  }
                }
              }}
            />

            {/* Slide 31 Autocomplete Overlay */}
            {isAutoCompleteOpen && filteredProducts.length > 0 && (
              <div className="autocomplete-overlay" style={{ width: 560 }}>
                <table className="autocomplete-table">
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>Code</th>
                      <th style={{ width: 160 }}>Name</th>
                      <th style={{ width: 60, textAlign: 'right' }}>Mrp</th>
                      <th style={{ width: 60, textAlign: 'right' }}>Rate</th>
                      <th style={{ width: 50, textAlign: 'right' }}>Stock</th>
                      <th style={{ width: 160 }}>TamilName</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p, idx) => (
                      <tr
                        key={p.id}
                        className={idx === autoCompleteIndex ? 'selected' : ''}
                        onMouseDown={() => handleSelectProduct(p)}
                      >
                        <td><b>{p.code}</b></td>
                        <td>{p.name}</td>
                        <td style={{ textAlign: 'right' }}>{p.mrp.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{p.rate.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>{p.currentStock.toFixed(p.isDecimal ? 2 : 0)}</td>
                        <td style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}>{p.tamilName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <span style={{ fontSize: 10, color: '#666' }}>0</span>
        </div>

        {/* Bottom line: Inputs aligned with labels */}
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 65px 70px 50px 80px 45px 45px 55px auto', gap: 4, alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: 9.5, color: '#000080', fontWeight: 'bold' }}>
              {isEnglishOnly ? 'Code' : 'எண்:'}
            </label>
            <input
              type="text"
              className="win-input-classic"
              style={{ width: '100%' }}
              value={entryCode}
              onChange={e => setEntryCode(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 9.5, color: '#000080', fontWeight: 'bold' }}>
              {isEnglishOnly ? 'Name' : 'பொருட்பெயர்'}
            </label>
            <input
              ref={nameRef}
              type="text"
              className="win-input-classic"
              style={{ width: '100%', fontWeight: 'bold' }}
              value={entryName}
              onChange={e => {
                setEntryName(e.target.value);
                setIsAutoCompleteOpen(true);
                setAutoCompleteIndex(0);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddItem();
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 9.5, color: '#800000', fontWeight: 'bold', textAlign: 'right' }}>
              MRP
            </label>
            <input
              type="text"
              className="win-input-classic"
              style={{ width: '100%', textAlign: 'right' }}
              value={entryMrp}
              onChange={e => setEntryMrp(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 9.5, color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
              {isEnglishOnly ? 'Rate' : 'விலை'}
            </label>
            <input
              type="text"
              className="win-input-classic"
              style={{ width: '100%', textAlign: 'right', fontWeight: 'bold' }}
              value={entryRate}
              onChange={e => handleRateChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddItem();
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 9.5, color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
              {isEnglishOnly ? 'Qty' : 'அளவு'}
            </label>
            <input
              ref={qtyRef}
              type="text"
              className="win-input-classic"
              style={{ width: '100%', textAlign: 'right', fontWeight: 'bold' }}
              value={entryQty}
              onChange={e => handleQtyChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddItem();
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 9.5, color: '#000080', fontWeight: 'bold', textAlign: 'right' }}>
              {isEnglishOnly ? 'Value' : 'தொகை'}
            </label>
            <input
              type="text"
              className="win-input-classic"
              style={{ width: '100%', textAlign: 'right', fontWeight: 'bold', color: '#B22222' }}
              value={entryValue}
              readOnly
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 9.5, textAlign: 'center' }}>GST%</label>
            <input type="text" className="win-input-classic" style={{ width: '100%', textAlign: 'center' }} value={entryGst} readOnly />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 9.5, textAlign: 'center' }}>CESS%</label>
            <input type="text" className="win-input-classic" style={{ width: '100%', textAlign: 'center' }} value={entryCess} readOnly />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 9.5, textAlign: 'center' }}>ACESS</label>
            <input type="text" className="win-input-classic" style={{ width: '100%', textAlign: 'center' }} value={entryAcess} readOnly />
          </div>

          <div>
            <button
              className="win-btn-classic"
              style={{ height: 21, marginTop: 12, padding: '0 8px', fontWeight: 'bold' }}
              onClick={handleAddItem}
            >
              {isEnglishOnly ? '↵ Enter' : '↵ சேர்'}
            </button>
          </div>
        </div>
      </fieldset>

      {/* MAIN DATAGRID (22px Rows, Alternating Pink/White Grid) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: '#808080', // Classic container border background
        margin: '2px 6px',
        border: '1px inset #808080'
      }}>
        <table className="vanigam-grid">
            <thead>
              <tr>
                <th style={{ width: 35, textAlign: 'center' }}>{isEnglishOnly ? 'SNo' : 'வ.எ'}</th>
                <th style={{ width: 55, textAlign: 'center' }}>{isEnglishOnly ? 'Code' : 'எண்'}</th>
                <th style={{ width: 180 }}>{isEnglishOnly ? 'Tamil Name' : 'பொருட்பெயர்'}</th>
                <th style={{ width: 75, textAlign: 'right' }}>{isEnglishOnly ? 'Rate' : 'விலை'}</th>
                <th style={{ width: 50, textAlign: 'right' }}>{isEnglishOnly ? 'Qty' : 'அளவு'}</th>
                <th style={{ width: 65, textAlign: 'right' }}>{isEnglishOnly ? 'Mrp' : 'MRP'}</th>
                <th style={{ width: 200 }}>{isEnglishOnly ? 'Product Name' : 'பொருள் பெயர்'}</th>
                <th style={{ width: 85, textAlign: 'right' }}>{isEnglishOnly ? 'Value' : 'தொகை'}</th>
                <th style={{ width: 50, textAlign: 'right' }}>CESS</th>
                <th style={{ width: 50, textAlign: 'right' }}>A.CESS</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length === 0 ? (
                <tr>
                  <td style={{ textAlign: 'center' }}>&nbsp;</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
            ) : (
              cartItems.map((item, idx) => {
                const isSelected = idx === selectedRowIndex;
                return (
                  <tr
                    key={idx}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => setSelectedRowIndex(idx)}
                  >
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.serialNo}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.product.code}</td>
                    <td style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}>{item.product.tamilName}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{item.rate.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(3).replace(/^0+/, '')}
                    </td>
                    <td style={{ textAlign: 'right' }}>{item.product.mrp.toFixed(2)}</td>
                    <td>{item.product.name}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: isSelected ? '#FFF' : '#B22222' }}>
                      {item.lineValue.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                    <td style={{ textAlign: 'right' }}>0.00</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* DENSE SUMMARY FOOTER (Exact 13-cell Vanigam Layout - Label above, Sunken Box below) */}
      <div style={{
        background: '#ECE9D8',
        borderTop: '1px solid #808080',
        padding: '2px 6px',
        fontSize: 10.5
      }}>
        {/* Row 1: The 13 Inline Metrics Cells */}
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
          <div className="pos-summary-cell" style={{ width: 42 }}>
            <span className="pos-summary-label">{isEnglishOnly ? 'Items' : 'எண்'}</span>
            <div className="pos-summary-value">{totalItemsCount}</div>
          </div>

          <div className="pos-summary-cell" style={{ width: 72 }}>
            <span className="pos-summary-label">{isEnglishOnly ? 'Gross Amt' : 'நி.தொகை'}</span>
            <div className="pos-summary-value">{totalNetAmt.toFixed(2)}</div>
          </div>

          <div className="pos-summary-cell" style={{ width: 48 }}>
            <span className="pos-summary-label">{isEnglishOnly ? 'POINTS' : 'புள்ளி'}</span>
            <div className="pos-summary-value">0.00</div>
          </div>

          <div className="pos-summary-cell" style={{ width: 60 }}>
            <span className="pos-summary-label" style={{ color: '#CC0000' }}>{isEnglishOnly ? 'Tax Amt' : 'வரி'}</span>
            <div className="pos-summary-value">{totalTaxAmt.toFixed(2)}</div>
          </div>

          <div className="pos-summary-cell" style={{ width: 52 }}>
            <span className="pos-summary-label" style={{ color: '#CC0000' }}>CESS</span>
            <div className="pos-summary-value">0.00</div>
          </div>

          <div className="pos-summary-cell" style={{ width: 52 }}>
            <span className="pos-summary-label" style={{ color: '#CC0000' }}>A.CESS</span>
            <div className="pos-summary-value">0.00</div>
          </div>

          <div className="pos-summary-cell" style={{ width: 78 }}>
            <span className="pos-summary-label">{isEnglishOnly ? 'Discount Info' : 'தள்ளுபடி'}</span>
            <div className="pos-summary-value">0.00 &nbsp; 0.00</div>
          </div>

          <div className="pos-summary-cell" style={{ width: 54 }}>
            <span className="pos-summary-label">{isEnglishOnly ? 'Delivery' : 'டெலிவரி'}</span>
            <div className="pos-summary-value">0.00</div>
          </div>

          <div className="pos-summary-cell" style={{ width: 48 }}>
            <span className="pos-summary-label">{isEnglishOnly ? 'ROff' : 'ரவுண்ட்'}</span>
            <div className="pos-summary-value">0.00</div>
          </div>

          <div className="pos-summary-cell" style={{ width: 74 }}>
            <span className="pos-summary-label">{isEnglishOnly ? 'Nett Amt' : 'மொத்தம்'}</span>
            <div className="pos-summary-value">{totalNetAmt.toFixed(2)}</div>
          </div>

          <div className="pos-summary-cell" style={{ width: 48 }}>
            <span className="pos-summary-label">{isEnglishOnly ? 'MISC' : 'மற்றவை'}</span>
            <div className="pos-summary-value">0.00</div>
          </div>

          <div className="pos-summary-cell" style={{ width: 58 }}>
            <span className="pos-summary-label">{isEnglishOnly ? 'Other Amt' : 'இ.தொகை'}</span>
            <div className="pos-summary-value">0.00</div>
          </div>

          <div className="pos-summary-cell" style={{ width: 65 }}>
            <span className="pos-summary-label">{isEnglishOnly ? 'Paid Amt' : 'செலுத்தியது'}</span>
            <div className="pos-summary-value">0.00</div>
          </div>

          {/* FAR RIGHT MASSIVE BOLD RED CHANGE / RETURNED AMOUNT */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 6
          }}>
            <span style={{
              fontSize: 22,
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif',
              color: '#CC0000'
            }}>
              {changeReturnedAmt}
            </span>
          </div>
        </div>

        {/* Row 2: Information Note Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <label style={{ fontSize: 10.5, color: '#000080', fontWeight: 'bold' }}>
            {isEnglishOnly ? 'Information :' : 'குறிப்பு :'}
          </label>
          <input
            type="text"
            className="win-input-classic"
            style={{ flex: 1, height: 18 }}
            placeholder={isEnglishOnly ? 'Scan barcode or press F1 / type product name above...' : 'மேலே உள்ள மஞ்சள் பெட்டியில் பார்கோடு ஸ்கேன் செய்யவும்...'}
            value={infoNote}
            onChange={e => setInfoNote(e.target.value)}
          />
        </div>
      </div>
      </>
      )}

      {/* BOTTOM SHORTCUT STATUS BAR (2 Lines matching reference) */}
      <div style={{
        background: '#ECE9D8',
        borderTop: '1px solid #808080',
        padding: '2px 6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        userSelect: 'none'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {/* Line 1: Red text */}
          <div style={{ color: '#CC0000', fontWeight: 'bold', fontSize: 10.5 }}>
            {isEnglishOnly
              ? 'CTRL+N - New ; CTRL+S - Save ; CTRL+X - Delete ; ESC - Exit  ALT+P - New Product ; F5-Rate Type'
              : 'CTRL+N - சேர்ப்பு ; CTRL+S - பதிவு ; CTRL+X - ரத்து ; ESC - முற்றும்  ALT+P - அச்சிடு ; F5-விலை வகை'}
          </div>
          {/* Line 2: Black text */}
          <div style={{ color: '#000000', fontSize: 10.5 }}>
            {isEnglishOnly
              ? 'F1 - Product; F7-Next Bill ; F8-Last Bill ; F11-Hold Bill ; F12-Retrive Holded Bill; F6-Customer Search'
              : 'F1 - பொருள் ; F7-அடுத்த பில் ; F8-முந்தைய பில் ; F11-நிறுத்தி வை ; F12-நிறுத்திய பில் எடு ; F6-வாடிக்கையாளர் தேடல்'}
          </div>
        </div>

        {/* Navigation arrow buttons on bottom right */}
        <div className="nav-btn-group">
          <button className="nav-btn" title={isEnglishOnly ? 'First Saved Bill (Oldest)' : 'முதல் பில்'} onClick={handleFirstBill}>|&lt;</button>
          <button className="nav-btn" title={isEnglishOnly ? 'Previous / Last Bill (F8)' : 'முந்தைய பில் (F8)'} onClick={handlePrevBill}>&lt;&lt;</button>
          <button className="nav-btn" title={isEnglishOnly ? 'Next Bill / New Bill (F7)' : 'அடுத்த பில் (F7)'} onClick={handleNextBill}>&gt;&gt;</button>
          <button className="nav-btn" title={isEnglishOnly ? 'Latest Saved Bill' : 'கடைசி பில்'} onClick={handleLatestBill}>&gt;|</button>
        </div>
      </div>

      {/* POPUP MODALS */}

      {/* Slide 33: Confirm Print Modal */}
      {isPrintConfirmOpen && (
        <div className="win-modal-overlay">
          <div className="win-modal-window" style={{ width: 300 }}>
            <div className="win-modal-titlebar">
              <span>{isEnglishOnly ? 'Confirm Print' : 'உறுதி செய்'}</span>
              <button className="win-control-btn" onClick={() => setIsPrintConfirmOpen(false)}>✕</button>
            </div>
            <div style={{ padding: 16, textAlign: 'center', fontSize: 12 }}>
              <p style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>
                {isEnglishOnly ? 'Do you want to print?' : 'பில் அச்சிட வேண்டுமா?'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  className="win-btn-classic"
                  style={{ width: 70, fontWeight: 'bold' }}
                  onClick={() => handleConfirmPrintAction(true)}
                  autoFocus
                >
                  {isEnglishOnly ? 'Yes' : 'சரி'}
                </button>
                <button
                  className="win-btn-classic"
                  style={{ width: 70 }}
                  onClick={() => handleConfirmPrintAction(false)}
                >
                  {isEnglishOnly ? 'No' : 'வேண்டாம்'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide 34: Hold Data Modal */}
      {isHoldConfirmOpen && (
        <div className="win-modal-overlay">
          <div className="win-modal-window" style={{ width: 320 }}>
            <div className="win-modal-titlebar">
              <span>{isEnglishOnly ? `Hold Data - ${cartItems.length}` : `நிறுத்தி வை - ${cartItems.length}`}</span>
              <button className="win-control-btn" onClick={() => setIsHoldConfirmOpen(false)}>✕</button>
            </div>
            <div style={{ padding: 16, textAlign: 'center', fontSize: 12 }}>
              <p style={{ margin: '0 0 16px 0', fontWeight: 'bold' }}>
                {isEnglishOnly ? 'Do you want Hold this Information?' : 'இந்த தகவலை நிறுத்தி வைக்க வேண்டுமா?'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  className="win-btn-classic"
                  style={{ width: 70, fontWeight: 'bold' }}
                  onClick={confirmHoldData}
                  autoFocus
                >
                  {isEnglishOnly ? 'Yes' : 'சரி'}
                </button>
                <button
                  className="win-btn-classic"
                  style={{ width: 70 }}
                  onClick={() => setIsHoldConfirmOpen(false)}
                >
                  {isEnglishOnly ? 'No' : 'வேண்டாம்'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide 36: Split Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        netAmount={Math.round(totalNetAmt)}
        isEnglish={isEnglishOnly}
        onConfirmPayment={p => {
          setIsPaymentModalOpen(false);
          setChangeReturnedAmt(p.changeAmount.toFixed(2));
          handleConfirmPrintAction(true);
        }}
      />

      {/* Slide 41: Thermal Receipt Slip */}
      <ThermalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        invoice={latestInvoice}
        isEnglish={isEnglishOnly}
      />

      {/* Slide 38: Customer Search Modal */}
      <CustomerSearchModal
        isOpen={isCustomerSearchOpen}
        onClose={() => setIsCustomerSearchOpen(false)}
        customers={customers}
        isEnglish={isEnglishOnly}
        onSelectCustomer={c => {
          setActiveCustomer(c);
          setCustomerCodeInput(c.code);
          setCustomerNameInput(c.name);
        }}
      />
    </div>
  );
};
