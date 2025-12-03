import React, { useEffect, useState } from "react";
import ModalMap from "../../components/ModalMap";
import "../../styles/supplier.css";

const API = "http://localhost:8080/api";

function getAuth() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function MyCompany() {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    // поля редактирования
    const [editingField, setEditingField] = useState(null);
    const [tempValue, setTempValue] = useState("");

    // лого
    const [logoEdit, setLogoEdit] = useState(false);
    const [logoFile, setLogoFile] = useState(null);

    // карта
    const [locationModal, setLocationModal] = useState(false);

    useEffect(() => {
        loadCompany();
    }, []);

    async function loadCompany() {
        setLoading(true);
        const res = await fetch(`${API}/companies/my`, { headers: getAuth() });
        setCompany(await res.json());
        setLoading(false);
    }

    function beginEdit(field) {
        setEditingField(field);
        setTempValue(company[field] || "");
    }

    function cancelEdit() {
        setEditingField(null);
        setTempValue("");
    }

    async function saveField(field) {
        const body = { ...company, [field]: tempValue };

        await fetch(`${API}/companies/${company.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...getAuth() },
            body: JSON.stringify(body),
        });

        await loadCompany();
        setEditingField(null);
    }

    async function saveLogo() {
        const fd = new FormData();
        fd.append("file", logoFile);

        await fetch(`${API}/companies/${company.id}/upload-logo`, {
            method: "POST",
            headers: getAuth(),
            body: fd,
        });

        await loadCompany();
        setLogoEdit(false);
    }

    // 🔵 Сохранение точки из карты
    async function saveLocation(lat, lng) {
        const res = await fetch(`${API}/companies/${company.id}/location`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuth() },
            body: JSON.stringify({ lat, lng }),
        });

        const updated = await res.json();

        setCompany({
            ...company,
            address: updated.address,
            latitude: updated.lat,
            longitude: updated.lng,
        });

        setLocationModal(false);
    }

    if (loading || !company) {
        return <p className="admin-no-results">Загрузка...</p>;
    }

    return (
        <div className="company-wide" style={{ maxWidth: "1100px", margin: "auto" }}>

            <div className="company-row">

                {/* LEFT — LOGO */}
                <div className="company-logo-section">
                    <img
                        src={`http://localhost:8080${company.logoPath}`}
                        className="company-logo-main"
                        alt="logo"
                    />

                    {!logoEdit ? (
                        <button className="edit-link" onClick={() => setLogoEdit(true)}>
                            ✎ Изменить логотип
                        </button>
                    ) : (
                        <div className="logo-edit-block">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setLogoFile(e.target.files[0])}
                            />
                            <button className="save-btn" onClick={saveLogo}>Сохранить</button>
                            <button className="cancel-btn" onClick={() => setLogoEdit(false)}>
                                Отмена
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT — Fields */}
                <div className="company-info">

                    {[
                        { key: "name", label: "Название компании" },
                        { key: "website", label: "Сайт" },
                        { key: "contactEmail", label: "Email" },
                        { key: "phone", label: "Телефон" },
                        { key: "inn", label: "ИНН" },


                        {
                            key: "address",
                            label: "Адрес",
                            isAddress: true
                        }


                        ].map(f => (
                        <div className="company-field-row" key={f.key}>
                            <div className="field-label">{f.label}</div>

                            {/* Адрес отображается только текстом + кнопка карты */}
                            {f.isAddress ? (
                                <div className="field-view">
                                    {company.address || "-"}
                                    <button
                                        className="geo-btn"
                                        onClick={() => setLocationModal(true)}
                                        style={{ marginLeft: 10 }}
                                    >
                                        🌍
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {editingField !== f.key ? (
                                        <div className="field-view">
                                            {company[f.key] || "-"}
                                            <button className="edit-link" onClick={() => beginEdit(f.key)}>✎</button>
                                        </div>
                                    ) : (
                                        <div className="field-edit">
                                            <input
                                                value={tempValue}
                                                onChange={(e) => setTempValue(e.target.value)}
                                            />
                                            <div className="edit-actions">
                                                <button className="save-btn" onClick={() => saveField(f.key)}>Сохранить</button>
                                                <button className="cancel-btn" onClick={cancelEdit}>Отмена</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}

                </div>
            </div>

            {/* DESCRIPTION */}
            <div className="company-description-block">
                <div className="field-label">Описание</div>

                {editingField !== "description" ? (
                    <div className="description-view">
                        {company.description || "-"}
                        <button className="edit-link" onClick={() => beginEdit("description")}>
                            ✎
                        </button>
                    </div>
                ) : (
                    <div className="field-edit">
                        <textarea
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                        />
                        <div className="edit-actions">
                            <button className="save-btn" onClick={() => saveField("description")}>
                                Сохранить
                            </button>
                            <button className="cancel-btn" onClick={cancelEdit}>Отмена</button>
                        </div>
                    </div>
                )}
            </div>

            {/* MAP MODAL */}
            {locationModal && (
                <ModalMap
                    initialLat={company.latitude || 55.751244}
                    initialLng={company.longitude || 37.618423}
                    onSelect={saveLocation}
                    onClose={() => setLocationModal(false)}
                />
            )}
        </div>
    );
}
