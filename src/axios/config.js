import axios from 'axios';

const ipFetch = axios.create({
    baseURL: "https://ipinfo.io",
    headers: {
        'Content-Type': 'application/json',
    },
});

export default ipFetch;