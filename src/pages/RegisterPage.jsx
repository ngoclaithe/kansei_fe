import React, { useState } from 'react';
import { registerUser } from '../services/apiAuth';
import Layout from '../components/layout/Layout';

const RegisterPage = () => {
  const [registerForm, setRegisterForm] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'guest',
    company_code: '',
    company_name: '',
    director_name: '',
    address: '',
    agreeToTerms: false
  });

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!registerForm.agreeToTerms) {
      alert('利用規約に同意する必要があります。');
      return;
    }
    
    try {
      const response = await registerUser(registerForm);
      alert('アカウントが正常に作成されました。ログインできます。');
      window.location.href = '/login';
    } catch (error) {
      alert(error.response?.data?.detail || '登録に失敗しました。');
    }
  };

  return (
    <Layout>
      <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full mx-auto">
          <h2 className="text-center text-3xl font-bold mb-6">新規登録</h2>          
          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">ユーザー名*</label>
                <input 
                  type="text" 
                  name="username"
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">氏名</label>
                <input 
                  type="text" 
                  name="full_name"
                  value={registerForm.full_name}
                  onChange={handleRegisterChange}
                  className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">会社コード*</label>
                <input 
                  type="text" 
                  name="company_code"
                  value={registerForm.company_code}
                  onChange={handleRegisterChange}
                  className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">会社名*</label>
                <input 
                  type="text" 
                  name="company_name"
                  value={registerForm.company_name}
                  onChange={handleRegisterChange}
                  className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">電話番号*</label>
                <input 
                  type="text" 
                  name="phone"
                  value={registerForm.phone}
                  onChange={handleRegisterChange}
                  className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">担当者*</label>
                <input 
                  type="text" 
                  name="director_name"
                  value={registerForm.director_name}
                  onChange={handleRegisterChange}
                  className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">住所*</label>
              <input 
                type="text" 
                name="address"
                value={registerForm.address}
                onChange={handleRegisterChange}
                className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">メールアドレス*</label>
              <input 
                type="email" 
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">パスワード*</label>
              <input 
                type="password" 
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            
            <div className="mt-4">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  name="agreeToTerms"
                  checked={registerForm.agreeToTerms}
                  onChange={handleRegisterChange}
                  className="mr-2"
                  required
                />
                <span>条件に同意する</span>
              </label>
            </div>
            
            <button 
              type="submit"
              className="w-full bg-blue-500 text-white rounded py-3 font-medium hover:bg-blue-600 transition duration-200"
            >
              登録
            </button>
            
            <div className="text-center mt-4">
              <p>
                アカウントをお持ちですか？{' '}
                <a 
                  href="/login"
                  className="text-blue-500 hover:underline"
                >
                  ログイン
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;