import axios from 'axios';

export const getAuthToken = () => {
    return sessionStorage.getItem('token');
};

export const createAuthConfig = () => {
    const token = getAuthToken();
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    };
};

const apiClient = axios.create({
    // baseURL: "https://6417-42-114-170-43.ngrok-free.app",
    // baseURL: "http://103.82.134.161:8001",
    baseURL: "http://103.82.134.161:8003",
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
    },
});

export default apiClient;