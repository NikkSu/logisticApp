import axios from "axios";
import { API_BASE, getTokenHeader } from "./config";

export const checkout = (lat, lng) =>
    axios.post(
        `${API_BASE}/orders/checkout`,
        { lat, lng },
        { headers: getTokenHeader() }
    ).then(r => r.data);
