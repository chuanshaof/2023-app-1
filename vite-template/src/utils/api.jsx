import axios from 'axios';

const BASE_PREFIX = import.meta.env.VITE_BE_URL;


export const client = axios.create({
    baseURL: BASE_PREFIX,
    timeout: 1000 * 30,
    headers: {
        'Content-Type': 'application/json',
    },
    origin: "*",
    withCredentials: false,
});

