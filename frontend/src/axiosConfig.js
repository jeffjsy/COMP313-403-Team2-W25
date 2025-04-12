import axios from 'axios';

const api = axios.create({
  baseURL: 'https://budget-planner-frontend-czda.onrender.com',
  withCredentials: true,
});

export default api;
