import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const classes = ['', 'weak', 'fair', 'good', 'strong']
  return { score, label: labels[score] || '', className: classes[score] || '' }
}

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const { signUp } = useAuth()
  const navigate = useNavigate()

  const strength = useMemo(() => getPasswordStrength(password), [password])

  function validate() {
    const newErrors = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'At least 8 characters required'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!agreedTerms) {
      newErrors.terms = 'You must agree to the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const { data, error } = await signUp(email, password, {
        full_name: fullName.trim(),
      })

      if (error) {
        let msg = error.message;
        if (msg === '{}' || !msg) {
          msg = 'Failed to send confirmation email. Please check your SMTP or email configuration in the Supabase Dashboard.';
        }
        setFormError(msg)
        toast.error(msg)
        return
      }

      // Supabase returns user but identity list empty = confirmation required
      if (data?.user && data.user.identities?.length === 0) {
        setFormError('An account with this email already exists.')
        toast.error('An account with this email already exists.')
        return
      }

      toast.success('Verification code sent! Check your inbox.')
      navigate('/verify-email', { state: { email } })
    } catch (err) {
      setFormError('Something went wrong. Please try again.')
      toast.error('Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-layout">
      {/* Animated orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="glass-card auth-card">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <Zap size={28} />
          </div>
          <h1>Create Account</h1>
          <p>Start your journey with CloudAtlas</p>
        </div>

        {/* Form error */}
        {formError && (
          <div className="alert-message error" style={{ marginBottom: 16 }}>
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="input-group">
            <label htmlFor="fullName">Full Name</label>
            <div className={`input-wrapper ${errors.fullName ? 'error' : ''}`}>
              <span className="input-icon"><User size={18} /></span>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: '' })) }}
                autoComplete="name"
              />
            </div>
            {errors.fullName && (
              <span className="input-error"><AlertCircle size={13} />{errors.fullName}</span>
            )}
          </div>

          {/* Email */}
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
              <span className="input-icon"><Mail size={18} /></span>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })) }}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="input-error"><AlertCircle size={13} />{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
              <span className="input-icon"><Lock size={18} /></span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="input-error"><AlertCircle size={13} />{errors.password}</span>
            )}

            {/* Password strength */}
            {password && (
              <div className="password-strength">
                <div className="strength-bars">
                  {[1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className={`strength-bar ${strength.score >= level ? `active ${strength.className}` : ''}`}
                    />
                  ))}
                </div>
                <span className={`strength-label ${strength.className}`}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={`input-wrapper ${errors.confirmPassword ? 'error' : ''}`}>
              <span className="input-icon"><Lock size={18} /></span>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })) }}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm(v => !v)}
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="input-error"><AlertCircle size={13} />{errors.confirmPassword}</span>
            )}
          </div>

          {/* Terms */}
          <div className="input-group">
            <div className="checkbox-group">
              <input
                id="terms"
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => { setAgreedTerms(e.target.checked); setErrors(p => ({ ...p, terms: '' })) }}
              />
              <label htmlFor="terms">
                I agree to the <a href="#terms">Terms of Service</a> and{' '}
                <a href="#privacy">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && (
              <span className="input-error"><AlertCircle size={13} />{errors.terms}</span>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="spinner" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
