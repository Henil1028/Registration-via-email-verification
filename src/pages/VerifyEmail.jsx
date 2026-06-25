import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MailCheck, ArrowLeft, RefreshCw, AlertCircle, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''
  
  const { resendVerification, verifyOtp } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', ''])
  
  // 5 minutes timer (300 seconds)
  const [timer, setTimer] = useState(300)

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ]

  // Focus the first input on load
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus()
    }
  }, [])

  // Timer countdown hook
  useEffect(() => {
    if (timer <= 0) return

    const interval = setInterval(() => {
      setTimer(prev => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timer])

  // Handle timer expiry
  useEffect(() => {
    if (timer === 0) {
      setErrorMsg('Your verification code has expired. Please click "Resend Code" below.')
      toast.error('Verification code expired.')
    }
  }, [timer])

  // Auto-verify when all 8 digits are filled
  useEffect(() => {
    const code = otp.join('')
    if (code.length === 8 && !isVerifying && timer > 0) {
      handleVerify(code)
    }
  }, [otp])

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  async function handleVerify(codeString) {
    const code = codeString || otp.join('')
    if (code.length !== 8) {
      setErrorMsg('Please enter all 8 digits.')
      return
    }

    if (timer <= 0) {
      setErrorMsg('This code has expired. Please request a new one.')
      return
    }

    setIsVerifying(true)
    setErrorMsg('')

    try {
      const { error } = await verifyOtp(email, code, 'signup')
      if (error) {
        let msg = error.message
        if (msg === '{}' || !msg) {
          msg = 'Verification failed. The code might be incorrect or expired.'
        }
        setErrorMsg(msg)
        toast.error(msg)
      } else {
        toast.success('Account verified successfully!')
        navigate('/dashboard')
      }
    } catch (err) {
      setErrorMsg('Verification failed. Please try again.')
      toast.error('Verification failed.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleChange = (index, value) => {
    if (timer <= 0) return // block typing if expired
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setErrorMsg('')

    // Auto-focus next input
    if (value && index < 7) {
      inputRefs[index + 1].current.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (timer <= 0) return
    
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
        inputRefs[index - 1].current.focus()
      } else {
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
      setErrorMsg('')
    }
  }

  const handlePaste = (e) => {
    if (timer <= 0) return
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    
    if (/^\d{8}$/.test(pastedData)) {
      const digits = pastedData.split('')
      setOtp(digits)
      setErrorMsg('')
      inputRefs[7].current.focus()
    }
  }

  async function handleResend() {
    if (cooldown > 0 || !email) return

    setIsResending(true)
    try {
      const { error } = await resendVerification(email)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Verification code resent!')
        setCooldown(60)
        setTimer(300) // Reset OTP timer to 5 minutes
        setOtp(['', '', '', '', '', '', '', '']) // Clear old slots
        setErrorMsg('')
        
        // Focus first slot again
        setTimeout(() => {
          if (inputRefs[0].current) {
            inputRefs[0].current.focus()
          }
        }, 100)

        // Resend cooldown timer
        const interval = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch {
      toast.error('Failed to resend. Try again later.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="glass-card auth-card success-card">
        <div className="success-icon-wrap">
          <MailCheck size={36} />
        </div>

        <h2>Confirm Verification</h2>
        <p>
          We sent an 8-digit confirmation code to
          <br />
          <span className="email-highlight">{email || 'your email'}</span>
        </p>

        {/* Beautiful Countdown Timer */}
        <div style={{ margin: '20px 0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <Clock size={12} />
            Code Expires In
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            background: timer > 60 ? 'var(--gradient-accent)' : 'linear-gradient(135deg, #ef4444, #f43f5e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '1px',
            fontFamily: 'monospace'
          }}>
            {formatTime(timer)}
          </div>
        </div>

        {errorMsg && (
          <div className="alert-message error" style={{ margin: '16px 0', textAlign: 'left' }}>
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
          <div className="otp-container">
            <div className="otp-inputs">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={`otp-input ${digit ? 'filled' : ''} ${errorMsg ? 'error' : ''}`}
                  disabled={isVerifying || timer === 0}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                />
              ))}
            </div>
            <p className="otp-hint">Enter the 8-digit security code from your email.</p>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isVerifying || timer === 0 || otp.join('').length !== 8}
            style={{ width: '100%', marginTop: 8 }}
          >
            {isVerifying ? (
              <>
                <div className="spinner" />
                Verifying...
              </>
            ) : (
              'Verify Account'
            )}
          </button>
        </form>

        <div className="resend-section">
          <p>{timer === 0 ? 'Your code has expired. Request a new one:' : 'Didn\'t receive the code?'}</p>
          <button
            className={`btn ${timer === 0 ? 'btn-primary' : 'btn-ghost'}`}
            onClick={handleResend}
            disabled={isResending || cooldown > 0 || !email}
            style={{ width: '100%' }}
          >
            {isResending ? (
              <>
                <div className="spinner" style={{ borderTopColor: 'var(--text-secondary)' }} />
                Sending...
              </>
            ) : cooldown > 0 ? (
              `Resend code in ${cooldown}s`
            ) : (
              <>
                <RefreshCw size={16} />
                Resend Code
              </>
            )}
          </button>
        </div>

        <div className="auth-footer" style={{ marginTop: 20 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
