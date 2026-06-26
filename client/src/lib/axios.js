import axios from "axios";

const axiosInstance = axios.create({
    baseURL: 'http://localhost:1010/api',
    withCredentials: true, // send cookies to the server
})

export default axiosInstance;