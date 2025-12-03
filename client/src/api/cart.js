import axios from "axios";
import { API_BASE, getTokenHeader } from "./config";

export const getCart = () =>
    axios.get(`${API_BASE}/cart`, { headers: getTokenHeader() })
        .then(r => r.data);

export const addToCart = (productId) =>
    axios.post(`${API_BASE}/cart/add/${productId}`, {}, { headers: getTokenHeader() });

export const removeFromCart = (productId) =>
    axios.delete(`${API_BASE}/cart/remove/${productId}`, { headers: getTokenHeader() });

export const clearCart = () =>
    axios.delete(`${API_BASE}/cart/clear`, { headers: getTokenHeader() });
