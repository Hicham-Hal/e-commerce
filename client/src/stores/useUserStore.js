import { create } from "zustand";
import axios from '../lib/axios'
import {toast} from "react-hot-toast";


export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    checkingAuth: true,
    
    signup: async({ name, email, password, confirmPassword }) => {
        set({ loading: true })


        if(password !== confirmPassword){
            set({ loading: false })
            return toast.error("password do not match")
        }

        try{
            const res = await axios.post('/user/signup', { name, email, password })
            set({ user: res.data.user, loading: false })
            toast.success(`Welcome ${res?.data?.user?.name}`)
        }catch(err){
            set({ loading: false })
            console.log(err)
            toast.error(err?.response?.data?.msg || "An error occurred")
        }
    },
    signin: async( email, password ) => {
        set({ loading: true })

        try{
            const res = await axios.post('/user/signin', {email, password})
            set({ user: res.data.user, loading: false })
            console.log(res)
            toast.success(`Welcome back ${res?.data?.user?.name}`)
        }catch(err){
            set({ loading: false })
            console.log(err)
            toast.error(err?.response?.data?.msg || "An error occured")
        }
    },
    
    logout: async() => {
        try{
            const res = await axios.post('/user/logout')
            set({ user: null })
            toast.success(res.data?.msg || 'successfully Logout')
        }catch(err){
            toast.error(err.response?.data?.message || "An error occurred during logout")
        }
    },

    checkAuth: async() => {
        set({ checkingAuth: true })
        try{
            const res = await axios.get('/user/profile')
            set({ checkingAuth: false , user: res.data})
        }catch(err){
            set({ checkingAuth: false, user: null })
        }
    },

    refreshToken: async() => {
        //prevent multiple simultaneous refresh attempts
        if(get().checkingAuth) return

        set({ checkingAuth: true })

        try{
            const res = await axios.get('/user/refresh-token')
            set({ checkingAuth: false })
            return res.data
        }catch(err){
            set({ user: null, checkingAuth: false })
            throw err
        }
    }
}))
//implement the axios interceptors for refreshing access tokens

let refreshPromise = null;

axios.interceptors.response.use(
    (response) => {
        console.log(response)
        return response
    },
    async(error) => {
        const originalRequest = error.config;
        console.log(originalRequest)
        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;

            try{
                //If a refresh is already in progress, wait for it to complete
                if(refreshPromise){
                    await refreshPromise;
                    return axios(originalRequest)
                }

                //Start a new refresh process
                refreshPromise = useUserStore.getState().refreshToken();
                await refreshPromise;
                refreshPromise = null;

                return axios(originalRequest)
            }catch(err){
                refreshPromise = null //reset it
                //If refresh fails, redirect to login or handle as needed
                useUserStore.getState().logout();
                return Promise.reject(err)
            }
        }
        return Promise.reject(error)
    }
)