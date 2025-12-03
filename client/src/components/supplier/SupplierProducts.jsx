import React, { useEffect, useState } from "react";
import "../../styles/supplier.css";
import "../../styles/admin.css";

const API = "http://localhost:8080/api";

function getAuth() {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function SupplierProducts() {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [modal, setModal] = useState(false);
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        category: "",
        price: "",
        description: ""
    });

    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        loadMyProducts();
    }, []);

    useEffect(() => {
        applySearch();
    }, [search, products]);

    async function loadMyProducts() {
        setLoading(true);

        try {
            const res = await fetch(`${API}/supplier/products`, { headers: getAuth() });
            const arr = await res.json();
            setProducts(arr);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    function applySearch() {
        if (!search.trim()) return setFiltered(products);

        const s = search.toLowerCase().trim();

        setFiltered(
            products.filter(p =>
                p.name.toLowerCase().includes(s) ||
                (p.category || "").toLowerCase().includes(s)
            )
        );
    }

    function openCreateModal() {
        setEditId(null);
        setForm({
            name: "",
            category: "",
            price: "",
            description: ""
        });
        setImageFile(null);
        setModal(true);
    }

    function openEditModal(prod) {
        setEditId(prod.id);
        setForm({
            name: prod.name,
            category: prod.category,
            price: prod.price,
            description: prod.description || ""
        });
        setImageFile(null);
        setModal(true);
    }

    async function saveProduct() {
        const body = {
            name: form.name,
            category: form.category,
            price: parseFloat(form.price),
            description: form.description
        };

        let productId = editId;

        // CREATE
        if (!editId) {
            const res = await fetch(`${API}/supplier/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuth()
                },
                body: JSON.stringify(body)
            });

            const created = await res.json();
            productId = created.id;
        }
        // UPDATE
        else {
            await fetch(`${API}/supplier/products/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuth()
                },
                body: JSON.stringify(body)
            });
        }

        // IMAGE UPLOAD
        if (imageFile) {
            const fd = new FormData();
            fd.append("file", imageFile);

            await fetch(`${API}/supplier/products/${productId}/upload-image`, {
                method: "POST",
                headers: getAuth(),
                body: fd
            });
        }

        setModal(false);
        loadMyProducts();
    }

    async function deleteProduct(id) {
        if (!window.confirm("Удалить товар?")) return;

        await fetch(`${API}/supplier/products/${id}`, {
            method: "DELETE",
            headers: getAuth()
        });

        loadMyProducts();
    }

    return (
        <div className="supplier-products-layout">

            <div className="admin-header">
                <h2 className="admin-title">Мои товары</h2>
                <p className="admin-subtitle">Управление ассортиментом поставщика</p>
            </div>

            {/* ВЕРХНЯЯ ПАНЕЛЬ: поиск + кнопка */}
            <div className="supplier-actions-top">
                <input
                    type="text"
                    placeholder="Поиск..."
                    className="supplier-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <button className="admin-btn" onClick={openCreateModal}>
                    + Добавить товар
                </button>
            </div>

            <div className="admin-scrollable">
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Фото</th>
                            <th>Название</th>
                            <th>Категория</th>
                            <th>Цена</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="admin-no-results">
                                    Загрузка...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="admin-no-results">
                                    Нет товаров
                                </td>
                            </tr>
                        ) : (
                            filtered.map(p => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>

                                    <td>
                                        <img
                                            src={p.imagePath ? `http://localhost:8080${p.imagePath}` : "/no-image.png"}
                                            className="prod-img-preview"
                                            alt=""
                                        />
                                    </td>

                                    <td>{p.name}</td>
                                    <td>{p.category}</td>
                                    <td>{p.price} ₽</td>

                                    <td className="admin-actions">
                                        <button className="admin-btn" onClick={() => openEditModal(p)}>
                                            Изменить
                                        </button>
                                        <button className="admin-btn-danger" onClick={() => deleteProduct(p.id)}>
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            {modal && (
                <div className="modal-overlay" onClick={() => setModal(false)}>
                    <div className="modal card" onClick={(e) => e.stopPropagation()}>

                        <button className="modal-close" onClick={() => setModal(false)}>✕</button>

                        <h3>{editId ? "Редактировать товар" : "Добавить товар"}</h3>

                        <div className="form-row">
                            <label>Название</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <label>Категория</label>
                            <input
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <label>Цена</label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <label>Описание</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <label>Фото товара</label>
                            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}/>
                        </div>

                        <div className="modal-actions">
                            <button className="btn primary" onClick={saveProduct}>
                                Сохранить
                            </button>
                            <button className="btn ghost" onClick={() => setModal(false)}>
                                Отмена
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

