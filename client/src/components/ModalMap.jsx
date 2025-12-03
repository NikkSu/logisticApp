import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function ModalMap({ initialLat, initialLng, onSelect, onClose }) {
    const [pos, setPos] = useState([initialLat, initialLng]);

    function MapClicker() {
        useMapEvents({
            click(e) {
                setPos([e.latlng.lat, e.latlng.lng]);
            }
        });
        return null;
    }

    function submitLocation() {
        const [lat, lng] = pos;

        // ВАЖНО: передаём два отдельных аргумента!
        onSelect(lat, lng);
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal card big-map-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <h3>Выберите точку на карте</h3>

                <MapContainer
                    center={pos}
                    zoom={15}
                    style={{ height: "400px", width: "100%", borderRadius: "12px" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClicker />
                    <Marker position={pos} icon={markerIcon} />
                </MapContainer>

                <button
                    className="btn primary"
                    style={{ marginTop: 20 }}
                    onClick={submitLocation}
                >
                    Сохранить
                </button>
            </div>
        </div>
    );
}
