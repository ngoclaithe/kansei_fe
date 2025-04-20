import React, { useState } from 'react';
import { loginUser, getUserInfo } from '../services/apiAuth';
import Layout from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordForm, setForgotPasswordForm] = useState({ email: '' });
  const [error, setError] = useState('');
  const email = sessionStorage.getItem('email');

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPasswordForm({ email: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await loginUser(loginForm.username, loginForm.password);
      const { access_token } = response;
      
      sessionStorage.setItem('token', access_token);
      
      const userInfo = await getUserInfo(access_token);
      console.log("Giá trị của userinfo là:", userInfo);
      
      sessionStorage.setItem('role', userInfo.role);
      sessionStorage.setItem('user_id', userInfo.user_id);
      sessionStorage.setItem('full_name', userInfo.full_name);
      sessionStorage.setItem('email', userInfo.email);
      sessionStorage.setItem('isLoggedIn', 'true');
      
      if (userInfo.role === 'admin' || userInfo.role === 'manager') {
        navigate('/manager/construction');
      } else if (userInfo.role === 'guest') {
        navigate('/guest/booking');
      } else {
        navigate('/');
      }
      
    } catch (error) {
      setError(error.response?.data?.message || 'ログインに失敗しました。');
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotPasswordForm.email) {
      setError('メールアドレスを入力してください。');
      return;
    }
    
    try {
      const response = await fetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forgotPasswordForm)
      });
      
      if (response.ok) {
        alert('パスワードリセット情報がメールで送信されました。');
        setShowForgotPasswordModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'パスワードのリセットに失敗しました。');
      }
    } catch (error) {
      setError('ネットワークエラーが発生しました。');
    }
  };

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-auto">
          <h2 className="text-center text-3xl font-bold mb-6">ログイン</h2>
          
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <p className="text-center text-gray-600 mb-4">ユーザー名とパスワードを入力してください</p>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div>
              <label className="block text-gray-700 mb-1">ユーザー名</label>
              <input 
                type="text" 
                name="username"
                value={loginForm.username}
                onChange={handleLoginChange}
                className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">パスワード</label>
              <input 
                type="password" 
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-blue-500 text-white rounded py-3 font-medium hover:bg-blue-600 transition duration-200"
            >
              ログイン
            </button>
            
            <div className="flex flex-col items-center space-y-3 mt-4">
              <button 
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-blue-500 hover:underline"
              >
                パスワードをお忘れですか？
              </button>
              
              <div className="text-center">
                <span>アカウント </span>
                <a 
                  href="/register"
                  className="text-blue-500 hover:underline"
                >
                  登録されてない？
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>

      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">パスワードをお忘れの方</h2>
              <button 
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleForgotPasswordSubmit}>
              <p className="mb-4 text-gray-600">
                登録したメールアドレスを入力してください。パスワードをメールでお送りします。
              </p>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-1">メールアドレス</label>
                <input 
                  type="email" 
                  value={forgotPasswordForm.email}
                  onChange={handleForgotPasswordChange}
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-blue-500 text-white rounded py-2 hover:bg-blue-600"
              >
                送信
              </button>
              
              <div className="mt-4 text-center">
                <button 
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="text-blue-500 hover:underline"
                >
                  ログインに戻る
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default LoginPage;