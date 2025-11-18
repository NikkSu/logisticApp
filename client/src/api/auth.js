const API_URL = "http://localhost:8080/api/auth";

async function handleResponse(response) {
    let data = {};
    try {
        data = await response.json();
    } catch {
        // если тело пустое или не JSON — просто игнорируем
    }

    if (!response.ok) {
        const msg = data.message || "Ошибка при запросе";
        throw new Error(msg);
    }

    return data;
}

export async function loginUser(data) {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    localStorage.setItem("token", result.token.trim().replace(/\s/g, ""));
    return result;
}

export async function registerUser(data) {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    localStorage.setItem("token", result.token.trim().replace(/\s/g, ""));


    return result;
}
