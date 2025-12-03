// src/pages/OrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/orders.css";

const API = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

function authHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function OrdersPage() {
    const [loading, setLoading] = useState(true);

    const [company, setCompany] = useState(null);
    const [products, setProducts] = useState([]); // used for product thumbnails in order details and create modal
    const [orders, setOrders] = useState([]);

    const [cart, setCart] = useState([]); // normalized cart items

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [createModal, setCreateModal] = useState(false);
    const [cartModal, setCartModal] = useState(false);
    const [productModal, setProductModal] = useState(null);
    const [supplierModal, setSupplierModal] = useState(null);
    const [orderModal, setOrderModal] = useState(null);

    const navigate = useNavigate();

    // -------- Load initial data --------
    useEffect(() => {
        (async function init() {
            try {
                setLoading(true);

                // load company (if any) and orders accordingly in parallel
                let cRes = null;
                try {
                    cRes = await axios.get(`${API}/companies/my`, { headers: authHeaders() });
                    setCompany(cRes.data || null);
                } catch (e) {
                    // no company for this user
                    setCompany(null);
                }

                // load products as we use them in modals and thumbnails
                try {
                    const pRes = await axios.get(`${API}/products`, { headers: authHeaders() });
                    setProducts(Array.isArray(pRes.data) ? pRes.data : []);
                } catch (e) {
                    setProducts([]);
                }

                // load orders: supplier sees /orders, customer sees /orders/my
                try {
                    let ordersRes;
                    if (cRes?.data?.id) {
                        ordersRes = await axios.get(`${API}/orders`, { headers: authHeaders() });
                    } else {
                        ordersRes = await axios.get(`${API}/orders/my`, { headers: authHeaders() });
                    }
                    setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
                } catch (e) {
                    setOrders([]);
                }

                // load cart once
                await loadCart();
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // -------- Helpers --------
    function formatMoney(n) {
        if (n == null) return "—";
        try {
            return Number(n).toLocaleString() + " ₽";
        } catch {
            return `${n} ₽`;
        }
    }

    // Normalize cart items returned by different backend DTOs
    async function loadCart() {
        try {
            const res = await axios.get(`${API}/cart`, { headers: authHeaders() });
            const raw = res.data || [];

            const normalized = raw.map((item) => {
                // possible shapes:
                // 1) { product: { id, name, price, imagePath, supplierCompanyName }, quantity }
                // 2) { productId, productName, quantity, price, imagePath, supplierCompanyName }
                if (item.product && item.product.id != null) {
                    return {
                        productId: item.product.id,
                        id: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        imagePath: item.product.imagePath,
                        supplierCompanyName: item.product.supplierCompanyName || item.product.supplier?.user?.company?.name || "",
                        qty: item.quantity,
                    };
                } else {
                    return {
                        productId: item.productId,
                        id: item.productId,
                        name: item.productName,
                        price: item.price,
                        imagePath: item.imagePath,
                        supplierCompanyName: item.supplierCompanyName || "",
                        qty: item.quantity,
                    };
                }
            });

            setCart(normalized);
            return normalized;
        } catch (e) {
            console.error("cart load error", e);
            setCart([]);
            return [];
        }
    }

    // increment/decrement via standard endpoints
    async function addToCart(productId, amount = 1) {
        try {
            // backend has simple add endpoint (increments by 1). For bulk adding we call set endpoint below.
            if (amount === 1) {
                await axios.post(`${API}/cart/add/${productId}`, null, { headers: authHeaders() });
            } else {
                // try set endpoint first (fallback if not available)
                await setCartQuantity(productId, (cart.find((c) => c.productId === productId)?.qty || 0) + amount);
            }
            await loadCart();
        } catch (e) {
            console.error("addToCart error", e);
            await loadCart();
        }
    }

    async function removeOneFromCart(productId) {
        try {
            await axios.delete(`${API}/cart/remove/${productId}`, { headers: authHeaders() });
            await loadCart();
        } catch (e) {
            console.error("removeFromCart error", e);
            await loadCart();
        }
    }

    // set exact quantity (uses the slightly odd backend path: /api/cart/cart/set)
    async function setCartQuantity(productId, quantity) {
        try {
            // prefer the explicit set endpoint (may be /api/cart/cart/set per server code)
            const res = await axios.post(
                `${API}/cart/set`,
                null,
                {
                    params: { productId, quantity },
                    headers: authHeaders(),
                }
            );
            // if server returns cart item, we ignore and reload
            await loadCart();
            return res.data;
        } catch (e) {
            // fallback: try adjusting via repeated add/remove (least ideal)
            console.warn("setCartQuantity failed, falling back to incremental updates", e?.response?.data || e.message);
            const existing = cart.find((c) => c.productId === productId)?.qty || 0;
            const diff = quantity - existing;
            if (diff === 0) return;
            if (diff > 0) {
                // try to add diff times (may be slow)
                for (let i = 0; i < diff; i++) {
                    try {
                        await axios.post(`${API}/cart/add/${productId}`, null, { headers: authHeaders() });
                    } catch {
                        break;
                    }
                }
            } else {
                // remove one by one
                for (let i = 0; i < Math.abs(diff); i++) {
                    try {
                        await axios.delete(`${API}/cart/remove/${productId}`, { headers: authHeaders() });
                    } catch {
                        break;
                    }
                }
            }
            await loadCart();
        }
    }

    async function clearCart() {
        try {
            await axios.delete(`${API}/cart/clear`, { headers: authHeaders() });
            await loadCart();
        } catch (e) {
            console.error(e);
        }
    }

    // checkout — uses cart state to build items
    async function checkout() {
        if (!company?.latitude || !company?.longitude) {
            alert("У вашей компании не указаны координаты!");
            return;
        }
        if (cart.length === 0) {
            alert("Корзина пуста");
            return;
        }
        try {
            const items = cart.map((i) => ({ productId: i.id, quantity: i.qty }));
            await axios.post(`${API}/orders/checkout`, { lat: company.latitude, lng: company.longitude, items }, { headers: authHeaders() });
            alert("Заказ оформлен!");
            await loadCart();
            setCreateModal(false);
            setCartModal(false);
            await reloadOrders();
        } catch (e) {
            console.error("checkout error", e);
            alert(e?.response?.data?.error || "Ошибка оформления заказа");
        }
    }
    // Получение информации о поставщике
    async function openSupplier(supplierId, supplierName) {
        try {
            const res = await axios.get(`${API}/companies/${supplierId}`, { headers: authHeaders() });
            setSupplierModal(res.data);
        } catch (e) {
            setSupplierModal({
                id: supplierId,
                companyName: supplierName || "—"
            });
        }
    }

    // reload orders (respects whether user is supplier or customer)
    async function reloadOrders() {
        try {
            let o;
            if (company?.id) o = await axios.get(`${API}/orders`, { headers: authHeaders() });
            else o = await axios.get(`${API}/orders/my`, { headers: authHeaders() });
            setOrders(Array.isArray(o.data) ? o.data : []);
        } catch (e) {
            console.error("reloadOrders error", e);
        }
    }

    // change order status (supplier endpoint). If backend exposes different endpoint for buyer marking received — change URL here.
    async function changeOrderStatus(id, newStatus) {
        try {
            await axios.patch(`${API}/orders/supplier/orders/${id}/status`, null, {
                params: { status: newStatus },
                headers: authHeaders(),
            });
            await reloadOrders();
            return true;
        } catch (e) {
            console.error("changeOrderStatus error", e?.response?.data || e.message);
            return false;
        }
    }

    // find product by id (from products list) — used to show thumbnails in order modal
    function findProduct(productId) {
        return products.find((p) => Number(p.id) === Number(productId));
    }

    // -------- Derived / filtered orders --------
    const filteredOrders = useMemo(() => {
        const q = search.trim().toLowerCase();
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return orders
            .filter((o) => {
                const isClosed = o.status === "RECEIVED" || o.status === "CANCELLED";
                const date = new Date(o.date);
                if (isClosed && date < monthAgo) return false;
                return true;
            })
            .filter((o) => statusFilter === "ALL" || (o.status || "").toUpperCase() === statusFilter)
            .filter((o) => {
                if (!q) return true;
                // match on order id, supplierName, date or item names
                if (String(o.id).includes(q)) return true;
                if ((o.supplierName || "").toLowerCase().includes(q)) return true;
                if ((o.date || "").toLowerCase().includes(q)) return true;
                if (Array.isArray(o.items)) {
                    return o.items.some((it) => (it.productName || "").toLowerCase().includes(q));
                }
                return false;
            })
            .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first
    }, [orders, search, statusFilter]);

    const totalSum = cart.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0);

    // -------- Render --------
    if (loading) return <div style={{ padding: 40, color: "#ddd" }}>Загрузка...</div>;

    return (
        <div className="orders-container">
            <div className="orders-header">
                <h2>
                    Заказы{" "}
                    {company && (
                        <span className="company-link" onClick={() => navigate("/", { state: { tab: "profile" } })}>
              {company.name}
            </span>
                    )}
                </h2>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <input
                        className="search-input"
                        placeholder="Поиск по заказам или товарам..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="search-input">
                        <option value="ALL">Все статусы</option>
                        <option value="CREATED">CREATED</option>
                        <option value="SENT">SENT</option>
                        <option value="RECEIVED">RECEIVED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>

                    <button className="new-order-btn" onClick={() => setCreateModal(true)}>
                        + Новый заказ
                    </button>

                    <button className="new-order-btn" onClick={() => setCartModal(true)} title="Открыть корзину">
                        Корзина ({cart.length})
                    </button>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="empty-block">
                    <img className="empty-img" src="/mnt/data/793dcab8-85fd-489e-8f46-3bceac0fb9ec.png" alt="empty" />
                    <p>Здесь пока пусто — у вас пока нет заказов</p>
                    {company && (
                        <button className="new-order-btn large-btn" onClick={() => setCreateModal(true)}>
                            Создать заказ
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div style={{ marginTop: 20 }}>
                        <h3 style={{ color: "#fff" }}>История заказов</h3>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                            {filteredOrders.map((o) => (
                                <div
                                    key={o.id}
                                    className="order-card-small"
                                    style={{
                                        background: "#2a2a2a",
                                        padding: 12,
                                        borderRadius: 12,
                                        minWidth: 220,
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setOrderModal(o)}
                                >
                                    <div style={{fontWeight: 700}}>Заказ #{o.id}</div>
                                    <div className="meta-line">
                                        {o.date} • {o.supplierName}
                                    </div>
                                    <div style={{marginTop: 8, fontWeight: 700}}>{formatMoney(o.totalSum)}</div>
                                    <div
                                        className="order-status"
                                        data-status={o.status}
                                        style={{marginTop: 8, fontSize: 13, fontWeight: 700}}
                                    >
                                        {o.status}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ========== CREATE ORDER modal (shows products to add) ========== */}
            {createModal && (
                <div className="modal-backdrop" onClick={() => setCreateModal(false)}>
                    <div className="modal big" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h3 style={{ margin: 0 }}>Создание заказа</h3>
                                <div className="meta-line">{company ? `Вашa компания: ${company.name}` : "У вас нет компании"}</div>
                            </div>
                            <div>
                                <button className="close-btn" onClick={() => setCreateModal(false)}>
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, marginTop: 12 }}>
                            <div>
                                <h4 style={{ marginTop: 0 }}>Товары (добавьте в корзину)</h4>
                                <div className="products-block">
                                    {products.map((p) => (
                                        <div key={p.id} className="product-entry">
                                            <img
                                                className="prod-img"
                                                src={p.imagePath ? `http://localhost:8080${p.imagePath}` : "/uploads/products/default.png"}
                                                alt={p.name}
                                            />
                                            <div style={{ minWidth: 0 }}>
                                                <div className="prod-name">{p.name}</div>
                                                <div className="meta-line">{p.supplierCompanyName || "—"} • {formatMoney(p.price)}</div>
                                            </div>
                                            <div className="prod-actions">
                                                <button className="small-btn" onClick={() => setProductModal(p)}>
                                                    Подробнее
                                                </button>
                                                <button className="add-btn" onClick={() => addToCart(p.id, 1)}>
                                                    + ({cart.find((i) => i.id === p.id)?.qty || 0})
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4>Корзина</h4>
                                <div style={{ maxHeight: 380, overflow: "auto" }}>
                                    {cart.length === 0 ? (
                                        <div className="meta-line">Корзина пуста</div>
                                    ) : (
                                        cart.map((i) => (
                                            <div key={i.id} className="cart-row">
                                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                                    <img
                                                        src={i.imagePath ? `http://localhost:8080${i.imagePath}` : "/uploads/products/default.png"}
                                                        alt={i.name}
                                                        style={{ width: 60, height: 44, objectFit: "cover", borderRadius: 8 }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: 700 }}>{i.name}</div>
                                                        <div className="meta-line">{i.supplierCompanyName}</div>
                                                    </div>
                                                </div>

                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <button className="qty-btn" onClick={() => setCartQuantity(i.productId, Math.max(0, i.qty - 1))}>
                                                        -
                                                    </button>
                                                    <div style={{ minWidth: 28, textAlign: "center" }}>{i.qty}</div>
                                                    <button className="qty-btn" onClick={() => setCartQuantity(i.productId, i.qty + 1)}>
                                                        +
                                                    </button>
                                                    <div style={{ width: 10 }} />
                                                    <div style={{ fontWeight: 700 }}>{formatMoney(i.price * i.qty)}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ fontWeight: 700 }}>Итого: {formatMoney(totalSum)}</div>
                                </div>

                                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                                    <button className="save-btn" onClick={checkout} disabled={cart.length === 0}>
                                        Оформить ({cart.length})
                                    </button>
                                    <button className="cancel-btn" onClick={() => { setCreateModal(false); }}>
                                        Отмена
                                    </button>
                                </div>

                                <div style={{ marginTop: 10 }}>
                                    <button className="small-btn" onClick={() => { setCartModal(true); }}>
                                        Открыть подробную корзину
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== CART modal (separate) ========== */}
            {cartModal && (
                <div className="modal-backdrop" onClick={() => setCartModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>Ваша корзина</h3>
                            <button className="close-btn" onClick={() => setCartModal(false)}>
                                ✕
                            </button>
                        </div>

                        <div style={{ maxHeight: 420, overflow: "auto" }}>
                            {cart.length === 0 ? (
                                <div className="meta-line">Пусто</div>
                            ) : (
                                cart.map((i) => (
                                    <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                            <img src={i.imagePath ? `http://localhost:8080${i.imagePath}` : "/uploads/products/default.png"} alt={i.name} style={{ width: 78, height: 60, objectFit: "cover", borderRadius: 8 }} />
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{i.name}</div>
                                                <div className="meta-line">{i.supplierCompanyName}</div>
                                                <div className="meta-line">{formatMoney(i.price)}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                            <button className="qty-btn" onClick={() => setCartQuantity(i.productId, Math.max(0, i.qty - 1))}>
                                                -
                                            </button>

                                            <div style={{ minWidth: 40 }}>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={i.qty}
                                                    onChange={(e) => {
                                                        const v = Number(e.target.value || 0);
                                                        // optimistic update locally to improve UX
                                                        setCart((cur) => cur.map((c) => (c.productId === i.productId ? { ...c, qty: v } : c)));
                                                    }}
                                                    onBlur={(e) => {
                                                        const v = Number(e.target.value || 0);
                                                        setCartQuantity(i.productId, Math.max(0, v));
                                                    }}
                                                    style={{ width: "100%", padding: "6px", borderRadius: 6 }}
                                                />
                                            </div>

                                            <button className="qty-btn" onClick={() => setCartQuantity(i.productId, i.qty + 1)}>
                                                +
                                            </button>

                                            <button className="cancel-btn" onClick={() => removeOneFromCart(i.productId)}>
                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontWeight: 700 }}>Итого: {formatMoney(totalSum)}</div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button className="save-btn" onClick={checkout} disabled={cart.length === 0}>
                                    Оформить
                                </button>
                                <button className="cancel-btn" onClick={() => setCartModal(false)}>
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== PRODUCT detail modal ========== */}
            {productModal && (
                <div className="modal-backdrop" onClick={() => setProductModal(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 12 }}>
                            <img className="big-img" src={productModal.imagePath ? `http://localhost:8080${productModal.imagePath}` : "/uploads/products/default.png"} alt={productModal.name} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{productModal.name}</h3>
                                        <div className="meta-line">{productModal.category || "—"} • {formatMoney(productModal.price)}</div>
                                        <div style={{ marginTop: 8 }} className="meta-line">
                                            Поставщик:{" "}
                                            <span
                                                className="supplier-link"
                                                onClick={() => {
                                                    setProductModal(null);
                                                    openSupplier(productModal.supplierId, productModal.supplierCompanyName);
                                                }}
                                            >
                        {productModal.supplierCompanyName}
                      </span>
                                        </div>
                                    </div>
                                    <div>
                                        <button className="add-btn" onClick={() => { addToCart(productModal.id, 1); alert("Добавлено в корзину"); }}>
                                            + Добавить
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginTop: 10 }}>
                                    <div style={{ fontWeight: 700 }}>Описание</div>
                                    <div className="meta-line" style={{ whiteSpace: "pre-wrap" }}>{productModal.description || "Нет описания"}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                            <button className="cancel-btn" onClick={() => setProductModal(null)}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== ORDER details modal ========== */}
            {orderModal && (
                <div className="modal-backdrop" onClick={() => setOrderModal(null)}>
                    <div className="modal big" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <h3>Заказ #{orderModal.id}</h3>
                            <button className="close-btn" onClick={() => setOrderModal(null)}>✕</button>
                        </div>

                        <div className="meta-line">Дата: {orderModal.date}</div>
                        <div className="meta-line">Статус: {orderModal.status}</div>

                        {/* Button to mark RECEIVED — only show when status SENT */}
                        {orderModal.status === "SENT" && (
                            <div style={{ marginTop: 8 }}>
                                <button
                                    className="save-btn"
                                    onClick={async () => {
                                        const ok = await changeOrderStatus(orderModal.id, "RECEIVED");
                                        if (ok) {
                                            alert("Заказ отмечен как полученный!");
                                            setOrderModal(null);
                                        } else {
                                            alert("Не удалось изменить статус. Проверьте права или endpoint.");
                                        }
                                    }}
                                >
                                    Получено
                                </button>
                            </div>
                        )}

                        <div className="meta-line">Поставщик: {orderModal.supplierName}</div>

                        <h4 style={{ marginTop: 12 }}>Состав заказа</h4>

                        <div style={{ maxHeight: 300, overflow: "auto" }}>
                            {orderModal.items?.map((i) => {
                                const prod = findProduct(i.productId);
                                return (
                                    <div key={i.productId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                            <img
                                                src={prod?.imagePath ? `http://localhost:8080${prod.imagePath}` : (i.imagePath ? `http://localhost:8080${i.imagePath}` : "/uploads/products/default.png")}
                                                alt={i.productName}
                                                style={{ width: 64, height: 44, objectFit: "cover", borderRadius: 6 }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{i.productName}</div>
                                                <div className="meta-line">Цена: {formatMoney(i.price)}</div>
                                            </div>
                                        </div>
                                        <div>
                                            {i.quantity} × {formatMoney(i.price)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ marginTop: 12, fontWeight: 700, fontSize: 18 }}>Итого: {formatMoney(orderModal.totalSum)}</div>
                    </div>
                </div>
            )}

            {/* ========== SUPPLIER modal ========== */}
            {supplierModal && (
                <div className="modal-backdrop" onClick={() => setSupplierModal(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{supplierModal.companyName || supplierModal.company_name || "Поставщик"}</h3>
                                <div className="meta-line">{supplierModal.address || ""}</div>
                            </div>
                            <div>
                                <button className="close-btn" onClick={() => setSupplierModal(null)}>✕</button>
                            </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <p className="meta-line">ИНН: {supplierModal.inn || "-"}</p>
                            <p className="meta-line">Телефон: {supplierModal.phone || "-"}</p>
                            <p className="meta-line">Email: {supplierModal.contactEmail || "-"}</p>
                            <p className="meta-line">Описание: {supplierModal.description || "-"}</p>

                            {supplierModal.latitude && supplierModal.longitude && (
                                <p className="meta-line">Координаты: {supplierModal.latitude}, {supplierModal.longitude}</p>
                            )}
                        </div>

                        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                            <button className="cancel-btn" onClick={() => setSupplierModal(null)}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // helper to set quantity and avoid repeating logic inline
    async function setCartQuantity(productId, quantity) {
        // local optimistic update
        setCart((cur) => cur.map((c) => (c.productId === productId ? { ...c, qty: quantity } : c)));
        await setCartQuantityBackend(productId, quantity);
    }

    async function setCartQuantityBackend(productId, quantity) {
        // call explicit endpoint to set quantity; fallback to incremental if needed
        await setCartQuantityRequest(productId, quantity);
        await loadCart();
    }

    async function setCartQuantityRequest(productId, quantity) {
        try {
            await axios.post(`${API}/cart/set`, null, {
                params: { productId, quantity },
                headers: authHeaders(),
            });
            return true;
        } catch (e) {
            // fallback: incremental
            const curQty = cart.find((c) => c.productId === productId)?.qty || 0;
            const diff = quantity - curQty;
            if (diff > 0) {
                for (let i = 0; i < diff; i++) {
                    try {
                        await axios.post(`${API}/cart/add/${productId}`, null, { headers: authHeaders() });
                    } catch {
                        break;
                    }
                }
            } else if (diff < 0) {
                for (let i = 0; i < Math.abs(diff); i++) {
                    try {
                        await axios.delete(`${API}/cart/remove/${productId}`, { headers: authHeaders() });
                    } catch {
                        break;
                    }
                }
            }
            return false;
        }
    }
}
