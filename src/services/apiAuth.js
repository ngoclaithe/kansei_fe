import apiClient from './apiClient';


export const registerUser = async (registerData) => {
    try {
        const response = await apiClient.post("/auth/register", {
            username: registerData.username,
            full_name: registerData.full_name,
            email: registerData.email,
            phone: registerData.phone,
            password: registerData.password,
            role: 'guest',
            company_code: registerData.company_code,
            company_name: registerData.company_name,
            director_name: registerData.director_name,
            address: registerData.address
        });
        console.log("Register Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Register Error:", error.response?.data || error.message);
        throw error;
    }
};

export const loginUser = async (username, password) => {
    try {
        const response = await apiClient.post("/auth/login", {
            username,
            password
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log("Login Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Login Error:", error.response?.data || error.message);
        throw error;
    }
};
export const getUserInfo = async (accessToken) => {
    try {
        const response = await apiClient.get("/auth/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log("User Info Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Get User Info Error:", error.response?.data || error.message);
        throw error;
    }
};

export const getAllUsers = async (accessToken) => {
    try {
        const response = await apiClient.get("/auth/users", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        console.log("All Users Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Get All Users Error:", error.response?.data || error.message);
        throw error;
    }
};
export const updateRoleUser = async (accessToken, user_id, role) => { 
    try {
        const response = await apiClient.put(
            `/users/${user_id}`, 
            { role }, 
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Update Role Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Update Role Error:", error.response?.data || error.message);
        throw error;
    }
};
export const deleteUser = async (accessToken, user_id) => { 
    try {
        const response = await apiClient.delete(
            `/auth/${user_id}`, 
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("Delete User Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Delete User Error:", error.response?.data || error.message);
        throw error;
    }
};