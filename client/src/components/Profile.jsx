import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ProfilePage.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

function getTokenHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ProfilePage() {
    const [showNameModal, setShowNameModal] = useState(false);
    const [showDeleteCompanyModal, setShowDeleteCompanyModal] = useState(false);
    const [user, setUser] = useState(null);
    const [editingName, setEditingName] = useState(false);
    const [nameValue, setNameValue] = useState("");
    const [showCompanyModal, setShowCompanyModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
    const [companyForm, setCompanyForm] = useState({ name: "", address: "", description: "" });
    const [joinCompanyName, setJoinCompanyName] = useState("");
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [error, setError] = useState("");
    const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });

    useEffect(() => {
        fetchMe();
    }, []);

    useEffect(() => {
        if (user && user.company && user.company.id && user.company.ownerId === user.id) {
            fetchPendingRequests(user.company.id);
        } else {
            setPendingRequests([]);
        }
    }, [user]);

    async function fetchMe() {
        try {
            const res = await axios.get(`${API_BASE}/users/me`, { headers: getTokenHeader() });
            setUser(res.data);
            setNameValue(res.data.username || "");
        } catch (e) {
            console.error(e);
            setError("Не удалось загрузить профиль");
        }
    }

    async function saveName() {
        try {
            await axios.put(
                `${API_BASE}/users/update`,
                { username: nameValue },
                { headers: getTokenHeader() }
            );
            setEditingName(false);
            fetchMe();
        } catch (e) {
            console.error(e);
            setError("Ошибка при сохранении имени");
        }
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target?.files?.[0];
        if (!file) return;

        const fd = new FormData();
        fd.append("file", file);

        try {
            await axios.post(`${API_BASE}/users/upload-avatar`, fd, {
                headers: {
                    ...getTokenHeader(),
                    "Content-Type": "multipart/form-data",
                },
            });
            fetchMe();
        } catch (e) {
            console.error(e);
            setError("Ошибка при загрузке аватара");
        }
    };

    async function createCompany() {
        try {
            const res = await axios.post(`${API_BASE}/companies/create`, companyForm, {
                headers: {
                    ...getTokenHeader(),
                    "Content-Type": "application/json",
                },
            });
            setShowCompanyModal(false);
            fetchMe();
        } catch (e) {
            console.error(e);
            const msg = e?.response?.data?.message || e?.response?.data?.error;
            if (msg?.includes("существует")) {
                setError("Компания с таким именем уже существует");
            } else {
                setError("Ошибка при создании компании");
            }
        }
    }


    async function updateCompany() {
        try {
            await axios.put(
                `${API_BASE}/companies/${user.company.id}`,
                companyForm,
                { headers: getTokenHeader() }
            );
            setShowEditCompanyModal(false);
            fetchMe();
        } catch (e) {
            console.error(e);
            setError("Ошибка при обновлении компании");
        }
    }

    async function joinCompanyById(companyId) {
        try {
            await axios.post(`${API_BASE}/companies/${companyId}/join`, {}, { headers: getTokenHeader() });
        } catch (e) {
            console.error(e);
            setError("Ошибка при отправке заявки");
        }
    }

    async function findCompanyByNameAndJoin() {
        try {
            const res = await axios.get(`${API_BASE}/companies/`, { headers: getTokenHeader() });
            const found = res.data.find(
                (c) => c.name.toLowerCase() === joinCompanyName.trim().toLowerCase()
            );
            if (!found) {
                setError("Компания не найдена");
                return;
            }
            await joinCompanyById(found.id);
        } catch (e) {
            console.error(e);
            setError("Ошибка при поиске компании");
        }
    }

    async function fetchPendingRequests(companyId) {
        try {
            setLoadingRequests(true);
            const res = await axios.get(`${API_BASE}/companies/${companyId}/requests`, {
                headers: getTokenHeader(),
            });
            setPendingRequests(res.data || []);
        } catch (e) {
            console.error(e);
            setError("Не удалось загрузить заявки");
        } finally {
            setLoadingRequests(false);
        }
    }

    async function approveRequest(requestId, approved) {
        try {
            await axios.post(
                `${API_BASE}/companies/requests/${requestId}/approve?approved=${approved}`,
                {},
                { headers: getTokenHeader() }
            );
            if (user && user.company) fetchPendingRequests(user.company.id);
        } catch (e) {
            console.error(e);
            setError("Ошибка при обработке заявки");
        }
    }
    const handleCompanyLogoUpload = async (e) => {
        const file = e.target?.files?.[0];
        if (!file || !user?.company) return;

        const fd = new FormData();
        fd.append("file", file);

        try {
            await axios.post(`${API_BASE}/companies/${user.company.id}/upload-logo`, fd, {
                headers: {
                    ...getTokenHeader(),
                    "Content-Type": "multipart/form-data",
                },
            });
            fetchMe();
        } catch (e) {
            console.error(e);
            setError("Ошибка при загрузке логотипа компании");
        }
    };
    async function changePassword() {
        try {
            await axios.post(`${API_BASE}/users/change-password`, passwordForm, {
                headers: getTokenHeader(),
            });
            setShowPasswordModal(false);
            alert("Пароль успешно изменён!");
        } catch (e) {
            console.error(e);
            setError("Ошибка при смене пароля");
        }
    }

    async function leaveCompany() {
        try {
            const res = await axios.delete(`${API_BASE}/users/leave`, {
                headers: getTokenHeader(),
            });
            await fetchMe();
        } catch (e) {
            console.error("leaveCompany error:", e);
            const serverMsg = e?.response?.data?.error || e?.response?.data?.message || e.message;
            setError(serverMsg || "Ошибка при выходе из компании");
        }
    }



    async function deleteCompany() {
        try {
            await axios.delete(`${API_BASE}/companies/${user.company.id}`, { headers: getTokenHeader() });
            fetchMe();
        } catch (e) {
            console.error(e);
            setError("Ошибка при удалении компании");
        }
    }

    if (!user) return <div className="profile-page">Загрузка...</div>;

    const isOwner = user.company && user.company.ownerId === user.id;

    return (
        <div className="profile-page">
            <div className="profile-left card">
                <div className="avatar-section">
                    <img
                        src={
                            user?.avatarPath
                                ? `http://localhost:8080${user.avatarPath}`
                                : "http://localhost:8080/uploads/avatars/default.png"
                        }
                        alt="Аватар"
                        className="profile-avatar"
                    />

                    <label className="change-avatar">
                        Загрузить
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                </div>

                <div className="user-info">
                    <div className="name-line">
                        <h2>{user.username}</h2>
                        <button className="edit-link" onClick={() => setShowNameModal(true)}>
                            ✎
                        </button>
                    </div>


                    <div className="email">{user.email}</div>

                    <div className="password-section">
                        <button className="change-password-btn" onClick={() => setShowPasswordModal(true)}>
                            Сменить пароль
                        </button>
                    </div>
                </div>
            </div>

            <div className="profile-right card">
                <h3>Компания</h3>
                {user.company ? (
                    <div className="company-card">
                        <div className="company-head">
                            <img
                                className="company-logo"
                                src={
                                    user.company.logoPath
                                        ? `http://localhost:8080${user.company.logoPath}`
                                        : "/company-default.png"
                                }
                                alt="logo"
                            />


                            <div className="company-info">
                                <div className="company-name">{user.company.name}</div>
                                <div className="company-address">{user.company.address}</div>
                            </div>
                            <div className="company-actions">
                                {isOwner ? (
                                    <>
                                        <button
                                            className="btn ghost"
                                            onClick={() => {
                                                setCompanyForm(user.company);
                                                setShowEditCompanyModal(true);
                                            }}
                                        >
                                            Редактировать
                                        </button>

                                        <button className="btn danger" onClick={() => setShowDeleteCompanyModal(true)}>
                                            Удалить компанию
                                        </button>
                                    </>
                                ) : (
                                    <button className="btn danger" onClick={leaveCompany}>
                                        Покинуть компанию
                                    </button>
                                )}
                            </div>


                        </div>
                        <p className="company-desc"></p>
                            {isOwner && (
                                <label className="change-avatar">
                                    Загрузить логотип
                                    <input type="file" accept="image/*" onChange={handleCompanyLogoUpload}/>
                                </label>
                            )}
                            <p className="company-desc">{user.company.description}</p>

                            {isOwner && (
                                <div className="requests-block">
                                    <h4>Заявки на вступление</h4>
                                    {loadingRequests ? (
                                        <div>Загрузка...</div>
                                    ) : pendingRequests.length === 0 ? (
                                        <div className="muted">Нет ожидающих заявок</div>
                                    ) : (
                                        <ul className="requests-list">
                                            {pendingRequests.map((r) => (
                                                <li key={r.id} className="request-item">
                                                    <div className="request-info">
                                                        <div className="requester-name">{r.requesterUsername}</div>
                                                        <div className="request-meta">id: {r.requesterId}</div>
                                                    </div>
                                                    <div className="request-actions">
                                                        <button
                                                            className="btn small"
                                                            onClick={() => approveRequest(r.id, true)}
                                                        >
                                                            Одобрить
                                                        </button>
                                                        <button
                                                            className="btn small ghost"
                                                            onClick={() => approveRequest(r.id, false)}
                                                        >
                                                            Отклонить
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                    </div>
                    ) : (
                    <div className="no-company">
                        <div>Вы ещё не присоединены ни к одной компании</div>
                        <div className="no-company-actions">
                            <button className="btn primary" onClick={() => setShowCompanyModal(true)}>
                                Добавить компанию
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Модалка создания компании */}
            {showCompanyModal && (
                <div className="modal-overlay">
                    <div className="modal card">
                        <button className="modal-close" onClick={() => setShowCompanyModal(false)}>
                            ✕
                        </button>
                        <h3>Создать новую компанию</h3>
                        <div className="form-row">
                            <label>Название</label>
                            <input
                                value={companyForm.name}
                                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                            />
                        </div>
                        <div className="form-row">
                            <label>Адрес</label>
                            <input
                                value={companyForm.address}
                                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                            />
                        </div>
                        <div className="form-row">
                            <label>Описание</label>
                            <textarea
                                value={companyForm.description}
                                onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn primary" onClick={createCompany}>
                                Создать
                            </button>
                        </div>

                        <hr />

                        <h3>Присоединиться к существующей</h3>
                        <div className="form-row">
                            <label>Название компании</label>
                            <input
                                value={joinCompanyName}
                                onChange={(e) => setJoinCompanyName(e.target.value)}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn" onClick={findCompanyByNameAndJoin}>
                                Найти и отправить заявку
                            </button>
                        </div>
                        {error && <div className="error">{error}</div>}
                    </div>
                </div>
            )}

            {/* Модалка редактирования компании */}
            {showEditCompanyModal && (
                <div className="modal-overlay">
                    <div className="modal card">
                        <button className="modal-close" onClick={() => setShowEditCompanyModal(false)}>
                            ✕
                        </button>
                        <h3>Редактировать компанию</h3>
                        <div className="form-row">
                            <label>Название</label>
                            <input
                                value={companyForm.name}
                                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                            />
                        </div>
                        <div className="form-row">
                            <label>Адрес</label>
                            <input
                                value={companyForm.address}
                                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                            />
                        </div>
                        <div className="form-row">
                            <label>Описание</label>
                            <textarea
                                value={companyForm.description}
                                onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn primary" onClick={updateCompany}>
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модалка смены пароля */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal card">
                        <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                            ✕
                        </button>
                        <h3>Сменить пароль</h3>
                        <div className="form-row">
                            <label>Старый пароль</label>
                            <input
                                type="password"
                                value={passwordForm.oldPassword}
                                onChange={(e) =>
                                    setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                                }
                            />
                        </div>
                        <div className="form-row">
                            <label>Новый пароль</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) =>
                                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                                }
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn primary" onClick={changePassword}>
                                Сменить
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Модалка редактирования имени */}
            {showNameModal && (
                <div className="modal-overlay">
                    <div className="modal card">
                        <button className="modal-close" onClick={() => setShowNameModal(false)}>
                            ✕
                        </button>
                        <h3>Изменить имя</h3>
                        <div className="form-row">
                            <label>Новое имя</label>
                            <input
                                value={nameValue}
                                onChange={(e) => setNameValue(e.target.value)}
                                className="styled-input"
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn primary"
                                onClick={() => {
                                    saveName();
                                    setShowNameModal(false);
                                }}
                            >
                                Сохранить
                            </button>
                            <button className="btn ghost" onClick={() => setShowNameModal(false)}>
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модалка подтверждения удаления компании */}
            {showDeleteCompanyModal && (
                <div className="modal-overlay">
                    <div className="modal card">
                        <button className="modal-close" onClick={() => setShowDeleteCompanyModal(false)}>
                            ✕
                        </button>
                        <h3>Удалить компанию</h3>
                        <p>Вы уверены, что хотите удалить компанию <b>{user.company.name}</b>? Это действие нельзя отменить.</p>
                        <div className="modal-actions">
                            <button
                                className="btn danger"
                                onClick={() => {
                                    deleteCompany();
                                    setShowDeleteCompanyModal(false);
                                }}
                            >
                                Удалить
                            </button>
                            <button className="btn ghost" onClick={() => setShowDeleteCompanyModal(false)}>
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
