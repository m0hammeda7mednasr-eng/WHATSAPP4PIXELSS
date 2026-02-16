import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { MessageCircle } from 'lucide-react'
import Signup from './Signup'

export default function Login() {
  const [showSignup, setShowSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  if (showSignup) {
    return <Signup onBackToLogin={() => setShowSignup(false)} />
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Simple validation
    if (!username || !password) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور')
      setLoading(false)
      return
    }

    try {
      // Check user in database
      const { data: users, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)

      if (dbError) {
        console.error('DB Error:', dbError);
        setError('حدث خطأ في الاتصال بقاعدة البيانات')
        setLoading(false)
        return
      }

      if (!users || users.length === 0) {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة')
        setLoading(false)
        return
      }

      const user = users[0];

      // Store session in localStorage
      const session = {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name
        },
        access_token: 'local_token_' + Date.now()
      }
      
      localStorage.setItem('session', JSON.stringify(session))
      
      // Trigger page reload to update App state
      window.location.reload()
      
    } catch (err) {
      setError('حدث خطأ: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-green-500 rounded-full mb-4">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">WhatsApp CRM</h1>
          <p className="text-gray-500 text-sm">أدخل اسم المستخدم وكلمة المرور</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
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
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ليس لديك حساب؟{' '}
            <button
              onClick={() => setShowSignup(true)}
              className="text-green-600 hover:text-green-700 font-semibold hover:underline"
            >
              إنشاء حساب جديد
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
