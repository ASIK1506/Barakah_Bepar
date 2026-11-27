import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UserAccount,
  UserLevel,
  UserPermissions,
  loadUsers,
  saveUsers,
  getPermissionsForUser,
  savePermissionsForUser
} from '../lib/userStore';
import '../styles/classicTheme.css';

interface UserScreenProps {
  onClose: () => void;
  isEnglish: boolean;
}

/* ============================================================================
   1. USER INFORMATION (Slide 5 / image8.jpeg)
   ============================================================================ */
export const UserMasterScreen: React.FC<UserScreenProps> = ({ onClose, isEnglish }) => {
  const [tab, setTab] = useState<'details' | 'list'>('details');
  const [users, setUsers] = useState<UserAccount[]>(() => loadUsers());
  const [selectedUsername, setSelectedUsername] = useState<string | null>(() => {
    const initial = loadUsers();
    return initial[0]?.username || null;
  });
  const [userName, setUserName] = useState<string>(() => loadUsers()[0]?.username || 'ADMIN');
  const [password, setPassword] = useState<string>(() => loadUsers()[0]?.password || 'admin');
  const [userLevel, setUserLevel] = useState<UserLevel>(() => loadUsers()[0]?.level || 'Administrator');

  const userNameInputRef = useRef<HTMLInputElement>(null);

  const handleNew = useCallback(() => {
    setSelectedUsername(null);
    setUserName('');
    setPassword('');
    setUserLevel('User');
    setTab('details');
    setTimeout(() => userNameInputRef.current?.focus(), 0);
  }, []);

  const handleSave = useCallback(() => {
    const cleanName = userName.trim().toUpperCase();
    if (!cleanName) {
      alert(isEnglish ? 'Please enter User Name.' : 'பயனர் பெயரை உள்ளிடவும்.');
      userNameInputRef.current?.focus();
      return;
    }
    if (!password) {
      alert(isEnglish ? 'Please enter Password.' : 'கடவுச்சொல்லை உள்ளிடவும்.');
      return;
    }

    const updatedRecord: UserAccount = {
      username: cleanName,
      password,
      level: userLevel
    };

    setUsers(prev => {
      const targetKey = selectedUsername || cleanName;
      const idx = prev.findIndex(u => u.username.toUpperCase() === targetKey.toUpperCase());
      let next: UserAccount[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = updatedRecord;
      } else {
        next = [...prev, updatedRecord];
      }
      saveUsers(next);
      return next;
    });

    setSelectedUsername(cleanName);
    setUserName(cleanName);
    alert(isEnglish ? 'User saved!' : 'பயனர் சேமிக்கப்பட்டது!');
  }, [userName, password, userLevel, selectedUsername, isEnglish]);

  const canDelete = Boolean(
    selectedUsername &&
    selectedUsername.toUpperCase() !== 'ADMIN' &&
    users.some(u => u.username.toUpperCase() === selectedUsername.toUpperCase())
  );

  const handleDelete = useCallback(() => {
    if (!canDelete || !selectedUsername) return;
    const msg = isEnglish
      ? `Are you sure you want to delete user "${selectedUsername}"?`
      : `"${selectedUsername}" பயனரை நீக்க வேண்டுமா?`;
    if (!window.confirm(msg)) return;

    setUsers(prev => {
      const next = prev.filter(u => u.username.toUpperCase() !== selectedUsername.toUpperCase());
      saveUsers(next);
      return next;
    });
    handleNew();
  }, [canDelete, selectedUsername, isEnglish, handleNew]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNew();
      } else if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNew, handleSave, onClose]);

  const selectUserFromList = (u: UserAccount) => {
    setSelectedUsername(u.username);
    setUserName(u.username);
    setPassword(u.password);
    setUserLevel(u.level);
    setTab('details');
  };

  return (
    <div className="win-child-window" style={{ width: 580, height: 360, margin: 'auto' }}>
      <div className="win-child-titlebar">
        <span>{isEnglish ? 'USER INFORMATION' : 'பயனர் விவரம்'}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 12px', background: '#ECE9D8' }}>
        {/* Header + 4 Toolbar Buttons (New, Save, Delete, Close) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 'bold', color: '#CC0000' }}>
            {isEnglish ? 'USER INFORMATION' : 'பயனர் விவரம்'}
          </span>
          <div className="action-buttons-box">
            <div className="action-btn" title="New Record (CTRL+N)" onClick={handleNew}>
              <span style={{ fontSize: 14 }}>📄</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>
                {isEnglish ? 'New' : 'சேர்ப்பு'}
              </span>
            </div>
            <div className="action-btn" title="Save Record (CTRL+S)" onClick={handleSave}>
              <span style={{ fontSize: 14 }}>💾</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>
                {isEnglish ? 'Save' : 'பதிவு'}
              </span>
            </div>
            <div
              className="action-btn"
              title="Delete Record"
              onClick={handleDelete}
              style={{
                opacity: canDelete ? 1 : 0.55,
                cursor: canDelete ? 'pointer' : 'default'
              }}
            >
              <span style={{ fontSize: 14, color: canDelete ? '#374151' : '#9CA3AF' }}>▲</span>
              <span
                className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}
                style={{ color: canDelete ? undefined : '#808080' }}
              >
                {isEnglish ? 'Delete' : 'நீக்கு'}
              </span>
            </div>
            <div className="action-btn" title="Close (ESC)" onClick={onClose}>
              <span style={{ fontSize: 14, color: '#DC2626' }}>▲</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>
                {isEnglish ? 'Close' : 'முற்றும்'}
              </span>
            </div>
          </div>
        </div>

        {/* Classic Tabs: User Details | User List */}
        <div className="win-tabs-container">
          <div
            className={`win-tab ${tab === 'details' ? 'active' : ''}`}
            style={{ color: tab === 'details' ? '#1E3A8A' : '#000000' }}
            onClick={() => setTab('details')}
          >
            {isEnglish ? 'User Details' : 'பயனர் விவரம்'}
          </div>
          <div
            className={`win-tab ${tab === 'list' ? 'active' : ''}`}
            style={{ color: tab === 'list' ? '#1E3A8A' : '#000000' }}
            onClick={() => setTab('list')}
          >
            {isEnglish ? 'User List' : 'பயனர் பட்டியல்'}
          </div>
        </div>

        {/* Tab Content Panel */}
        <div
          style={{
            flex: 1,
            border: '1px solid #808080',
            borderTop: 'none',
            padding: 16,
            background: '#ECE9D8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {tab === 'details' ? (
            <div
              style={{
                border: '1px solid #A0A0A0',
                padding: '22px 34px',
                background: '#ECE9D8',
                width: 390
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '95px 1fr',
                  gap: 8,
                  alignItems: 'center',
                  fontSize: 12
                }}
              >
                <label style={{ fontWeight: 'bold', color: '#000080', textAlign: 'right' }}>
                  {isEnglish ? 'User Name' : 'பயனர் பெயர்'}
                </label>
                <input
                  ref={userNameInputRef}
                  type="text"
                  className="win-input-classic"
                  style={{ fontWeight: 'bold' }}
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                />

                <label style={{ fontWeight: 'bold', color: '#000080', textAlign: 'right' }}>
                  {isEnglish ? 'Password' : 'கடவுச்சொல்'}
                </label>
                <input
                  type="password"
                  className="win-input-classic"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />

                <label style={{ fontWeight: 'bold', color: '#000080', textAlign: 'right' }}>
                  {isEnglish ? 'User Level' : 'பயனர் நிலை'}
                </label>
                <select
                  className="win-input-classic"
                  style={{ fontWeight: 'bold' }}
                  value={userLevel}
                  onChange={e => setUserLevel(e.target.value as UserLevel)}
                >
                  <option value="User">User</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#FFFFFF',
                border: '1px inset #808080',
                overflowY: 'auto'
              }}
            >
              <table className="vanigam-grid">
                <thead>
                  <tr>
                    <th>{isEnglish ? 'User Name' : 'பயனர் பெயர்'}</th>
                    <th style={{ width: 120 }}>{isEnglish ? 'Password' : 'கடவுச்சொல்'}</th>
                    <th style={{ width: 150 }}>{isEnglish ? 'User Level' : 'பயனர் நிலை'}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr
                      key={u.username}
                      onClick={() => selectUserFromList(u)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><b>{u.username}</b></td>
                      <td>{'*'.repeat(Math.max(4, Math.min(8, u.password.length)))}</td>
                      <td>{u.level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom Shortcut Legend */}
        <div style={{ marginTop: 6, fontSize: 11, fontWeight: 'bold', color: '#000' }}>
          CTRL+N - New Record ; CTRL+S - Save Record ; ESC - Exit
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   2. USER CONFIGURATION / USER LOGIN CONFIGURATION (Slide 6 / image9.jpeg)
   ============================================================================ */
type PermissionItem = {
  key: keyof UserPermissions;
  label: string;
};

const MASTER_DETAILS_ITEMS: PermissionItem[] = [
  { key: 'taxInformation', label: 'Tax Information' },
  { key: 'addProductCategory', label: 'Add Product Category' },
  { key: 'addProduct', label: 'Add Product' },
  { key: 'addCustomer', label: 'Add Customer' },
  { key: 'addSupplier', label: 'Add Supplier' },
  { key: 'addLedger', label: 'Add Ledger' },
  { key: 'barcodeGenerator', label: 'BarCode Generator' },
  { key: 'editProduct', label: 'Edit Product' }
];

const TRANSACTIONS_MAIN_ITEMS: PermissionItem[] = [
  { key: 'salesInformation', label: 'Sales Information' },
  { key: 'salesReturnInformation', label: 'Sales Return Information' },
  { key: 'purchaseInformation', label: 'Purchase Information' },
  { key: 'purchaseReturnInformation', label: 'Purchase Return Information' },
  { key: 'receiptInformation', label: 'Receipt Information' },
  { key: 'paymentInformation', label: 'Payment Information' },
  { key: 'voucherInformation', label: 'Voucher Information' },
  { key: 'stockConvertor', label: 'Stock Convertror' }
];

const TRANSACTIONS_BOTTOM_ITEMS: PermissionItem[] = [
  { key: 'stockUpdate', label: 'Stock Update' },
  { key: 'redemption', label: 'Redemption' }
];

const REPORTS_LEFT_ITEMS: PermissionItem[] = [
  { key: 'supplierReport', label: 'Supplier Report' },
  { key: 'purchaseReport', label: 'Purchase Report' },
  { key: 'purchaseReturnReport', label: 'Purchase Return Report' },
  { key: 'stockDetails', label: 'Stock Details' }
];

const REPORTS_RIGHT_ITEMS: PermissionItem[] = [
  { key: 'customerReport', label: 'Customer Report' },
  { key: 'salesReport', label: 'Sales Report' },
  { key: 'salesReturnReport', label: 'Sales Return Report' },
  { key: 'accountsReports', label: 'Accounts Reports' }
];

export const UserConfigurationScreen: React.FC<UserScreenProps> = ({ onClose, isEnglish }) => {
  const [users] = useState<UserAccount[]>(() => loadUsers());
  const [selectedUser, setSelectedUser] = useState<string>(() => {
    const list = loadUsers();
    const userEntry = list.find(u => u.username.toUpperCase() === 'USER');
    return userEntry ? userEntry.username : (list[0]?.username || 'USER');
  });
  const [permissions, setPermissions] = useState<UserPermissions>(() => {
    const list = loadUsers();
    const userEntry = list.find(u => u.username.toUpperCase() === 'USER') || list[0];
    return getPermissionsForUser(userEntry?.username || 'USER', userEntry?.level);
  });
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const userSelectRef = useRef<HTMLSelectElement>(null);

  const handleUserChange = (nextUser: string) => {
    setSelectedUser(nextUser);
    const matched = users.find(u => u.username.toUpperCase() === nextUser.toUpperCase());
    setPermissions(getPermissionsForUser(nextUser, matched?.level));
  };

  const togglePermission = (key: keyof UserPermissions) => {
    if (!isEditing) return;
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = useCallback(() => {
    savePermissionsForUser(selectedUser, permissions);
    alert(
      isEnglish
        ? `User Login Configuration saved for ${selectedUser}!`
        : `${selectedUser} பயனர் அனுமதி அமைப்பு சேமிக்கப்பட்டது!`
    );
  }, [selectedUser, permissions, isEnglish]);

  const handleEdit = () => {
    setIsEditing(true);
    userSelectRef.current?.focus();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave, onClose]);

  const renderCheckbox = (item: PermissionItem) => (
    <label
      key={item.key}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11.5,
        fontWeight: 'bold',
        color: '#000000',
        cursor: isEditing ? 'pointer' : 'default',
        lineHeight: 1.45,
        userSelect: 'none'
      }}
    >
      <input
        type="checkbox"
        checked={permissions[item.key]}
        disabled={!isEditing}
        onChange={() => togglePermission(item.key)}
        style={{ margin: 0, cursor: isEditing ? 'pointer' : 'default' }}
      />
      <span>{item.label}</span>
    </label>
  );

  return (
    <div className="win-child-window" style={{ width: 680, height: 470, margin: 'auto' }}>
      <div className="win-child-titlebar">
        <span>{isEnglish ? 'USER CONFIGURATION' : 'பயனர் அமைப்பு'}</span>
        <button className="win-control-btn" style={{ color: '#B91C1C' }} onClick={onClose}>✕</button>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '10px 14px',
          background: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        {/* Header: Title + User Selector + Save/Edit/Close Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
            <div>
              <div style={{ fontSize: 19, fontWeight: 'bold', color: '#CC0000', lineHeight: 1.1 }}>
                CONFIGURATION
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 'bold', color: '#A50000', marginTop: 2 }}>
                ( User Login Configuration )
              </div>
            </div>
            <select
              ref={userSelectRef}
              className="win-input-classic"
              style={{
                width: 175,
                height: 22,
                fontWeight: 'bold',
                color: '#A50000',
                fontSize: 11.5
              }}
              value={selectedUser}
              onChange={e => handleUserChange(e.target.value)}
            >
              {users.map(u => (
                <option key={u.username} value={u.username}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          <div className="action-buttons-box">
            <div className="action-btn" title="Save Record (F1)" onClick={handleSave}>
              <span style={{ fontSize: 14 }}>💾</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>
                {isEnglish ? 'Save' : 'பதிவு'}
              </span>
            </div>
            <div className="action-btn" title="Edit Configuration" onClick={handleEdit}>
              <span style={{ fontSize: 14 }}>📝</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>
                {isEnglish ? 'Edit' : 'திருத்து'}
              </span>
            </div>
            <div className="action-btn" title="Close (ESC)" onClick={onClose}>
              <span style={{ fontSize: 14, color: '#DC2626' }}>▲</span>
              <span className={isEnglish ? 'action-btn-label-en' : 'action-btn-label-ta'}>
                {isEnglish ? 'Close' : 'முற்றும்'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Framed Permission Matrix */}
        <div
          style={{
            flex: 1,
            border: '1px solid #808080',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: '#FFFFFF',
            overflow: 'hidden'
          }}
        >
          {/* Top Two Group Boxes: Master Details & Transations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1 }}>
            {/* Master Details */}
            <fieldset
              style={{
                border: '1px solid #C0C0C0',
                padding: '6px 18px 8px 24px',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around'
              }}
            >
              <legend style={{ fontWeight: 'bold', fontSize: 12, color: '#000000', padding: '0 4px' }}>
                Master Details
              </legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {MASTER_DETAILS_ITEMS.map(renderCheckbox)}
              </div>
            </fieldset>

            {/* Transations */}
            <fieldset
              style={{
                border: '1px solid #C0C0C0',
                padding: '6px 14px 8px 22px',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <legend style={{ fontWeight: 'bold', fontSize: 12, color: '#000000', padding: '0 4px' }}>
                Transations
              </legend>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {TRANSACTIONS_MAIN_ITEMS.map(renderCheckbox)}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 4, marginLeft: -10 }}>
                {TRANSACTIONS_BOTTOM_ITEMS.map(renderCheckbox)}
              </div>
            </fieldset>
          </div>

          {/* Bottom Full-Width Group Box: Reports */}
          <fieldset
            style={{
              border: '1px solid #C0C0C0',
              padding: '6px 18px 10px 24px',
              margin: 0
            }}
          >
            <legend style={{ fontWeight: 'bold', fontSize: 12, color: '#000000', padding: '0 4px' }}>
              Reports
            </legend>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1px 1fr',
                gap: '0 24px',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {REPORTS_LEFT_ITEMS.map(renderCheckbox)}
              </div>
              <div style={{ width: 1, height: 74, background: '#808080' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {REPORTS_RIGHT_ITEMS.map(renderCheckbox)}
              </div>
            </div>
          </fieldset>
        </div>

        {/* Bottom Shortcut Legend */}
        <div style={{ marginTop: 6, fontSize: 11.5, fontWeight: 'bold', color: '#000000' }}>
          F1- Save Record
        </div>
      </div>
    </div>
  );
};

