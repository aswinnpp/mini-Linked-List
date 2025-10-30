import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_BASE = 'http://localhost:5000';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [info, setInfo] = useState('');
  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (submitting) return;
      setSubmitting(true);
      const { data } = await axios.post(`${API_BASE}/auth/register`, {
        fullName: name,
        email,
        password,
        role: 'candidate'
      });

      console.log(data);
      
      setInfo(data.message || 'Signup successful. Please verify your email.');
      setRegisteredEmail(email);
      setOtpStage(true);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Signup failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function onVerifyOtp(e) {
    e.preventDefault();
    setError('');
    setVerifying(true);
    try {
      const { data } = await axios.post(`${API_BASE}/auth/verify-otp`, {
        email: registeredEmail || email,
        otp
      });
      setInfo('Email verified! Redirecting to login...');
      setOtp('');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'OTP verification failed';
      setError(msg);
    } finally {
      setVerifying(false);
    }
  }

  async function onResendOtp() {
    setError('');
    try {
      const { data } = await axios.post(`${API_BASE}/auth/resend-otp`, {
        email: registeredEmail || email
      });
      setInfo(data.message || 'OTP resent. Please check your email.');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Resend OTP failed';
      setError(msg);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    transition: 'all 0.2s',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#4a5568'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',  padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', width: '100%', maxWidth: 420, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#1a202c' }}>
            {otpStage ? 'Verify Email' : 'Create Account'}
          </h2>
          <p style={{ marginTop: 8, color: '#718096', fontSize: 14 }}>
            {otpStage ? 'Enter the OTP sent to your email' : 'Sign up to get started'}
          </p>
        </div>

        {!otpStage && (
          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {error && (
              <div style={{ background: '#fed7d7', color: '#c53030', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
                {error}
              </div>
            )}
            {info && (
              <div style={{ background: '#c6f6d5', color: '#22543d', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '14px',
                background: submitting ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
              onMouseOver={(e) => !submitting && (e.target.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        )}

        {otpStage && (
          <form onSubmit={onVerifyOtp}>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required
                maxLength={4}
                placeholder="0000"
                style={{
                  ...inputStyle,
                  textAlign: 'center',
                  fontSize: 24,
                  letterSpacing: 8,
                  fontWeight: 600
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {error && (
              <div style={{ background: '#fed7d7', color: '#c53030', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
                {error}
              </div>
            )}
            {info && (
              <div style={{ background: '#c6f6d5', color: '#22543d', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
                {info}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button
                type="submit"
                disabled={verifying || otp.length !== 4}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: (verifying || otp.length !== 4) ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: (verifying || otp.length !== 4) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
                onMouseOver={(e) => !verifying && otp.length === 4 && (e.target.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                {verifying ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={onResendOtp}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#fff',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.target.style.background = '#f7fafc'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseOut={(e) => { e.target.style.background = '#fff'; e.target.style.transform = 'translateY(0)'; }}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, color: '#718096', fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
