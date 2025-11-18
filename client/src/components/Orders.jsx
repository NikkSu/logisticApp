import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/orders.css";
import { useNavigate } from "react-router-dom";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [company, setCompany] = useState(null);
    const [selected, setSelected] = useState(null);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        async function loadData() {
            try {
                const orderRes = await axios.get("http://localhost:8080/api/orders", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setOrders(orderRes.data);

                const companyRes = await axios.get("http://localhost:8080/api/companies/my", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setCompany(companyRes.data);

            } catch (e) {
                console.error("Ошибка загрузки", e);

                if (e.response?.status === 400 || e.response?.status === 404) {
                    setErrorMsg("Вы не состоите в компании.");
                } else {
                    setErrorMsg("Не удалось загрузить данные.");
                }
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);


    return (
        <div className="orders-container">

            <div className="orders-header">
                <h2>
                    Заказы{" "}
                    {company && (
                        <span
                            className="company-link"
                            onClick={() => navigate("/", {state: {tab: "profile"}})}
                        >
            {company.name}
        </span>
                    )}
                </h2>

                {company && (
                    <button className="new-order-btn">
                        + Новый заказ
                    </button>
                )}
            </div>



            {orders.length === 0 && (
                <div className="empty-block">
                    <p>Здесь пока пусто</p>

                    {company && (
                        <button className="new-order-btn large-btn">
                            Создать заказ
                        </button>
                    )}
                </div>
            )}


            {/* ---------- СПИСОК ЗАКАЗОВ ---------- */}
            <div className="orders-grid">
                {orders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-id">Заказ №{order.id}</div>

                        <div className="order-info">
                            <p>{order.date}</p>
                            <p>{order.supplierName}</p>
                            <p>{order.totalSum.toLocaleString()} ₽</p>
                        </div>

                        <span className={`status ${order.status.toLowerCase()}`}>
                            {order.status}
                        </span>

                        <button
                            className="details-btn"
                            onClick={() => setSelected(order)}
                        >
                            Подробнее
                        </button>
                    </div>
                ))}
            </div>


            {/* ---------- МОДАЛКА ---------- */}
            {selected && (
                <div className="order-modal">
                    <div className="modal-content">
                        <h3>Заказ №{selected.id}</h3>
                        <p>Поставщик: {selected.supplierName}</p>
                        <p>Дата: {selected.date}</p>
                        <p>Сумма: {selected.totalSum} ₽</p>

                        <button className="close-btn"
                                onClick={() => setSelected(null)}>
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
