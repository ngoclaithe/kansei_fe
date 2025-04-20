import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthStatus = () => {
            const token = sessionStorage.getItem('token');
            const role = sessionStorage.getItem('role');
            const loginStatus = sessionStorage.getItem('isLoggedIn');
            
            if (token && loginStatus === 'true') {
                setIsLoggedIn(true);
                setUserRole(role);
            } else {
                setIsLoggedIn(false);
                setUserRole(null);
            }
        };
        
        checkAuthStatus();
        
        window.addEventListener('storage', checkAuthStatus);
        
        return () => {
            window.removeEventListener('storage', checkAuthStatus);
        };
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        sessionStorage.removeItem('user_id');
        sessionStorage.removeItem('full_name');
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('isLoggedIn');
        
        setIsLoggedIn(false);
        setUserRole(null);
        
        navigate('/');
    };

    return (
        <header className="w-full border-b">
            <div className="container mx-auto flex items-center justify-between px-4 py-5 bg-white">
                <div className="flex items-center">
                    <a 
                        href="https://www.kansei-pipe.co.jp/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center"
                    >
                        <img src="/images/logo.jpg" alt="KANSEI" className="h-14" />
                    </a>
                </div>

                <div className="flex-1 flex justify-center">
                    <nav className="flex items-center space-x-6">
                        <a href="/" className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition">ホーム</a>
                        {/* <a href="/schedule" className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition">予約スケジュール</a> */}
                        
                        {isLoggedIn && (userRole === 'admin' || userRole === 'manager') && (
                            <>
                                <a href="/manager/construction" className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition">建設現場管理</a>
                                <a href="/manager/shift" className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition">シフト管理</a>
                                <a href="/manager/booking" className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition">予約管理</a>
                                <a href="/manager/user" className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition">ユーザー管理</a>
                            </>
                        )}
                        
                        {isLoggedIn && userRole === 'guest' && (
                            <>
                                <a href="/guest/booking" className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition">予約</a>
                                <a href="/guest/historybooking" className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition">予約管理</a>                            
                            </>                        
                        )}
                        
                        {!isLoggedIn ? (
                            <div className="flex items-center space-x-4">
                                <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition">ログイン</a>
                                <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition">登録</a>
                            </div>
                        ) : (
                            <a href="#" onClick={handleLogout} className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition">ログアウト</a>
                        )}
                    </nav>
                </div>

                <div className="flex items-center justify-end">
                    <img src="/images/contact.jpg" alt="排水管トラブル 24時間受付 0120-51-8131" className="h-16" />
                </div>
            </div>
        </header>
    );
};

export default Header;