import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const { signIn } = useAuth()
  const navigate = useNavigate()

  function validate() {
    const newErrors = {}
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        let msg = error.message;
        if (msg === '{}' || !msg) {
          msg = 'Unable to sign in. Please verify your internet connection or credentials.';
        }
        
        if (msg.includes('Email not confirmed')) {
          setFormError('Please verify your email before signing in.')
          toast.error('Email not verified yet.')
        } else {
          setFormError(msg)
          toast.error(msg)
        }
        return
      }

      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="glass-card auth-card">
        <div className="brand">
          <div className="brand-icon">
            <Zap size={28} />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your CloudAtlas account</p>
        </div>

        {formError && (
          <div className="alert-message error" style={{ marginBottom: 16 }}>
            <AlertCircle size={16} />
            {formError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="loginEmail">Email Address</label>
            <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
              <span className="input-icon"><Mail size={18} /></span>
              <input
                id="loginEmail"
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

          <div className="input-group">
            <label htmlFor="loginPassword">Password</label>
            <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
              <span className="input-icon"><Lock size={18} /></span>
              <input
                id="loginPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                autoComplete="current-password"
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
          </div>

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="spinner" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  )
}
