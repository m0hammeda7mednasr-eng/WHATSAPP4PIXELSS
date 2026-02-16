import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { MessageCircle, ArrowLeft } from 'lucide-react'

export default function Signup({ onBackToLogin }) {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validation
    if (!username || !password) {
      setError('اسم المستخدم وكلمة المرور مطلوبة')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة')
      setLoading(false)
      return
    }

    try {
      // Check if username exists
      const { data: existingUsers } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)

      if (existingUsers && existingUsers.length > 0) {
        setError('اسم المستخدم موجود بالفعل')
        setLoading(false)
        return
      }

      // Insert new user
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            username: username,
            password: password, // Note: In production, hash the password!
            email: email || null,
            full_name: fullName || null
          }
        ])
        .select()

      if (insertError) {
        setError('حدث خطأ: ' + insertError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onBackToLogin()
      }, 2000)

    } catch (err) {
      setError('حدث خطأ غير متوقع: ' + err.message)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
          <div className="mb-4">
            <div className="inline-block p-4 bg-green-100 rounded-full">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">تم إنشاء الحساب بنجاح!</h2>
          <p className="text-gray-600">جاري التحويل لصفحة تسجيل الدخول...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>رجوع لتسجيل الدخول</span>
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-green-500 rounded-full mb-4">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">إنشاء حساب جديد</h1>
          <p className="text-gray-500 text-sm">املأ البيانات للتسجيل</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المستخدم <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="اختر اسم مستخدم"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الكامل
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="اسمك الكامل (اختياري)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="email@example.com (اختياري)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تأكيد كلمة المرور <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>
      </div>
    </div>
  )
}
