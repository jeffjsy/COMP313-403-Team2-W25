import axios from 'axios';

const api = axios.create({
  baseURL: 'https://budget-planner-backend-8ruc.onrender.com/',
  withCredentials: true,
});

export default api;
