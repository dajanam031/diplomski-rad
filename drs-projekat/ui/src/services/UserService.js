import axios from "axios";
import apiClient from "../utils/ApiClient";

export const RegisterUser = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/signup`, userData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    }
  };

  export const LoginUser = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/login`, userData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.message;
      throw new Error(errorMessage);
    }
  };

  export const SignInWithGoogle = async (token) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/users/google/auth`, token);
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
      throw new Error(error.response.data);
    }
  };