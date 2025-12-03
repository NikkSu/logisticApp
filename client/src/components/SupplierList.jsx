import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/admin.css";

const API = "http://localhost:8080/api";

function authHeaders() {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function SupplierList() {
    const [suppliers, setSuppliers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [products, setProducts] = useState([]);
    const [distance, setDistance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/companies/suppliers", {
                headers: authHeaders()
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Response was not OK:", res.status, text);
                setLoading(false);
                return;
            }

            const data = await res.json();
            console.log("SUPPLIERS RESPONSE:", data);

            if (Array.isArray(data)) {
                setSuppliers(data);
            } else {
                const possibleArray = data.content || data.companies || data.items;
                setSuppliers(Array.isArray(possibleArray) ? possibleArray : []);
            }

        } catch (e) {
            console.error("Suppliers load error:", e);
        } finally {
            setLoading(false);
        }
    };





    async function openSupplier(id) {
        try {
            const headers = { headers: authHeaders() };

            // 1. Загружаем данные компании
            const res = await axios.get(`${API}/companies/${id}`, headers);
            const company = res.data;

            const supplier = {
                id: company.id,
                companyName: company.name,
                inn: company.inn,
                city: company.city || "—",
                address: company.address,
                latitude: company.latitude,
                longitude: company.longitude,
                phone: company.phone,
                website: company.website,
                description: company.description,
                logoPath: company.logoPath
            };

            setSelected(supplier);

            // 2. Попытка загрузить товары по id компании
            let products = [];




                console.warn("products/supplier/{id} failed — trying supplier lookup...");

                // 2.1. Если запрос упал — получаем настоящий supplierId
                const sid = await axios.get(`${API}/supplier/by-company/${id}`, headers);
                const supplierId = sid.data;

                // 2.2. Пробуем снова
                const prod2 = await axios.get(`${API}/products/supplier/${supplierId}`, headers);
                products = Array.isArray(prod2.data) ? prod2.data : [];


            setProducts(products);
        } catch (e) {
            console.error("Supplier load error", e);
        }
    }




    async function addToCart(productId) {
        try {
            await axios.post(`${API}/cart/add/${productId}`, {}, { headers: authHeaders() });
            alert("Товар добавлен в корзину!");
        } catch (e) {
            console.error("Add to cart failed", e);
        }
    }

    return (
        <div className="supplier-products-layout">

            <div className="admin-header">
                <h2 className="admin-title">Поставщики</h2>
                <p className="admin-subtitle">Все компании, размещающие товары</p>
            </div>

            {/* Таблица поставщиков */}
            <div className="admin-scrollable">
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Компания</th>
                            <th>ИНН</th>
                            <th>Адрес</th>
                            <th></th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr><td colSpan={5}>Загрузка...</td></tr>
                        ) : suppliers.length === 0 ? (
                            <tr><td colSpan={5}>Поставщиков нет</td></tr>
                        ) : (
                            suppliers.map(s => (
                                <tr key={s.id}>
                                    <td>{s.id}</td>
                                    <td>{s.name}</td>
                                    <td>{s.inn}</td>
                                    <td>{s.address}</td>
                                    <td>
                                        <button className="admin-btn" onClick={() => openSupplier(s.id)}>
                                            Смотреть
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* МОДАЛКА ПОСТАВЩИКА */}
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelected(null)}>✕</button>

                        <h3>{selected.companyName}</h3>

                        <p><b>ИНН:</b> {selected.inn}</p>
                        <p><b>Адрес:</b> {selected.address}</p>

                        <p><b>Координаты:</b> {selected.latitude}, {selected.longitude}</p>
                        {/*<p>*/}
                        {/*    <strong>Время заказа:</strong>{" "}*/}
                        {/*    {new Date(order.orderTime).toLocaleString("ru-RU", {*/}
                        {/*        day: "2-digit",*/}
                        {/*        month: "2-digit",*/}
                        {/*        year: "numeric",*/}
                        {/*        hour: "2-digit",*/}
                        {/*        minute: "2-digit"*/}
                        {/*    })}*/}
                        {/*</p>*/}

                        {distance && (
                            <p style={{marginTop: 10}}>
                                🚚 <b>Доставка:</b> {distance.km} км / {Math.round(distance.min)} мин
                            </p>
                        )}

                        <h4 className="mt10">Товары поставщика</h4>

                        <div style={{
                            background: "#f4f4f4",
                            padding: "10px",
                            borderRadius: "8px",
                            maxHeight: "150px",
                            overflowY: "auto",
                            color: "#000"   // ← ДОБАВИЛ
                        }}>

                            {products.length === 0 ? (
                                <p>Нет товаров</p>
                            ) : (
                                products.map((p) => (
                                    <div key={p.id} style={{borderBottom: "1px solid #ddd", padding: "5px 0"}}>
                                        <strong>{p.name}</strong> — {p.price} ₽
                                    </div>
                                ))
                            )}
                        </div>


                        <h4 className="mt10">Местоположение</h4>
                        <div style={{width: "100%", height: 250, background: "#ddd", borderRadius: 8}}>
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.longitude - 0.01}%2C${selected.latitude - 0.01}%2C${selected.longitude + 0.01}%2C${selected.latitude + 0.01}&layer=mapnik&marker=${selected.latitude}%2C${selected.longitude}`}
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
