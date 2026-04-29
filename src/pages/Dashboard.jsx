import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserCircle, LogOut, HelpCircle, ChevronRight, Key } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import MasterDashboard from '../pages/dashboard/MasterDashboard';

const BOTTOM_TABS = [
  { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'profile', label: 'Profile', icon: <UserCircle size={20} /> },
];

export default function Dashboard() {
  const { auth, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('overview');

  const doLogout = async () => {
    const result = await Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c84b2f',
      cancelButtonColor: '#5a5248',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      background: '#faf7f2',
      color: '#1a1612',
    });
    if (result.isConfirmed) { logout(); nav('/login'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)', paddingBottom: 64 }}>

      {/* Top header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'var(--ink)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: 'var(--bg)', letterSpacing: -0.5 }}>
          Attend<span style={{ color: 'var(--accent)' }}>X</span>
        </div>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: 'Master Dashboard', icon: <LayoutDashboard size={14} /> },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '7px 12px', borderRadius: 3, border: 'none', background: tab === t.id ? 'var(--accent)' : 'transparent', color: tab === t.id ? '#fff' : '#888', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}>
              {t.icon}<span>{t.label}</span>
            </button>
          ))}
        </div>

        <button onClick={doLogout}
          style={{ padding: '6px 10px', border: '1px solid #444', borderRadius: 3, background: 'transparent', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#888'; }}>
          <LogOut size={14} /><span className="desktop-only">Sign Out</span>
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '20px 16px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {tab === 'overview' && <MasterDashboard />}
        {tab === 'profile'  && <ProfilePanel onNavigate={setTab} onLogout={doLogout} auth={auth} />}
      </div>

      {/* Mobile bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--ink)', borderTop: '1px solid #2a2520', display: 'flex', zIndex: 200, paddingBottom: 'env(safe-area-inset-bottom)' }} className="mobile-nav">
        {BOTTOM_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: '10px 4px 8px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: tab === t.id ? 'var(--accent)' : '#555', transition: 'color 0.15s' }}>
            <div>{t.icon}</div>
            <span style={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfilePanel({ onNavigate, onLogout, auth }) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const changePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      return Swal.fire('Error', 'Please fill all fields', 'error');
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return Swal.fire('Error', 'New passwords do not match', 'error');
    }
    if (passwordForm.newPassword.length < 6) {
      return Swal.fire('Error', 'Password must be at least 6 characters', 'error');
    }

    setLoading(true);
    try {
      await api.patch('/masteradmin/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      Swal.fire('Success', 'Password changed successfully!', 'success');
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* User card */}
      <div style={{ background: 'var(--ink)', borderRadius: 4, padding: '24px 20px', marginBottom: 20, boxShadow: '4px 4px 0 var(--accent)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#fff', flexShrink: 0 }}>
          {auth?.user?.name?.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: 'var(--bg)' }}>{auth?.user?.name}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{auth?.user?.email}</div>
          <div style={{ marginTop: 6 }}>
            <span style={{ background: 'var(--accent)', color: '#fff', padding: '2px 10px', borderRadius: 2, fontSize: 10, fontFamily: 'DM Mono, monospace', fontWeight: 700, textTransform: 'uppercase' }}>
              Master Admin
            </span>
          </div>
        </div>
      </div>

      {/* Help & Contact */}
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'default', opacity: 0.7 }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 4, background: 'var(--surface2)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink2)', flexShrink: 0 }}>
            <HelpCircle size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Help & Contact</div>
            <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 2 }}>You are the Master Admin - Top level access</div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
        <div onClick={() => setShowChangePassword(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ width: 38, height: 38, borderRadius: 4, background: 'var(--surface2)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink2)', flexShrink: 0 }}>
            <Key size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Change Password</div>
            <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 2 }}>Update your account password</div>
          </div>
          <ChevronRight size={16} color="var(--ink2)" />
        </div>
      </div>

      {/* Logout */}
      <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
        <div onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#fdeee8'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ width: 38, height: 38, borderRadius: 4, background: '#fdeee8', border: '1.5px solid #f0c0b0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LogOut size={18} color="var(--danger)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--danger)' }}>Sign Out</div>
            <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 2 }}>Logout from your account</div>
          </div>
          <ChevronRight size={16} color="var(--ink2)" />
        </div>
      </div>
      
      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="modal-overlay active" onClick={e => e.target === e.currentTarget && setShowChangePassword(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-title">
              Change Password
              <button className="modal-close" onClick={() => setShowChangePassword(false)}>✕</button>
            </div>
            
            <div className="form-group">
              <label>Current Password</label>
              <input 
                className="form-inp" 
                type="password" 
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>New Password</label>
              <input 
                className="form-inp" 
                type="password" 
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="Enter new password (min 6 characters)"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                className="form-inp" 
                type="password" 
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button 
                className="btn" 
                onClick={() => setShowChangePassword(false)}
                disabled={loading}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={changePassword}
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}