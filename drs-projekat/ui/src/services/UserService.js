import axios from "axios";
import apiClient from "../utils/ApiClient";

export const RegisterUser = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/signup`, userData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    }
  };

  export const LoginUser = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, userData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    }
  };

  export const SignInWithGoogle = async (token) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/google`, token);
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    }
  };

  export const SignInWithGithub = async (code) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/github`,
        { code }, 
        {
          headers: {
            'Content-Type': 'application/json', 
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    }
  };

  export const GetUserProfile = async () => {
    try {
      const response = await apiClient.get(`/users/profile`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    }
  };

  export const UpdateUserProfile = async (data) => {
    try {
      const response = await apiClient.put(`/users/edit-profile`, data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    }
  };

  export const ChangePassword = async (data) => {
    try {
      const response = await apiClient.put(`/users/change-password`, data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    }
  };