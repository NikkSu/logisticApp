// src/pages/AnalyticsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../styles/analytics.css";

const API = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

function authHeaders() {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
}

function monthKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [hover, setHover] = useState(null);

    useEffect(() => {
        (async function load() {
            setLoading(true);
            try {
                const headers = { headers: authHeaders() };

                const [oRes, pRes] = await Promise.all([
                    axios.get(`${API}/orders`, headers),
                    axios.get(`${API}/products`, headers)
                ]);

                setOrders(Array.isArray(oRes.data) ? oRes.data : []);
                setProducts(Array.isArray(pRes.data) ? pRes.data : []);
            } catch (e) {
                console.error("Analytics load error", e);
                setError(e?.response?.data || e.message || "Ошибка загрузки данных");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Map products
    const productById = useMemo(() => {
        const m = new Map();
        for (const p of products) m.set(p.id, p);
        return m;
    }, [products]);

    // MAIN STATS
    const stats = useMemo(() => {
        const result = {
            totalOrders: 0,
            totalRevenue: 0,
            avgOrderValue: 0,
            ordersByMonth: {},
            ordersByStatus: {},
            suppliers: {},
            topProducts: {},
            categoryCounts: {}
        };

        if (!orders.length) return result;

        result.totalOrders = orders.length;

        for (const o of orders) {
            const dateStr = o.date || o.createdAt || null;
            const month = dateStr ? monthKey(dateStr) : "unknown";

            const sum = Number(o.totalSum || 0);
            result.totalRevenue += sum;

            // month
            if (!result.ordersByMonth[month])
                result.ordersByMonth[month] = { count: 0, revenue: 0 };
            result.ordersByMonth[month].count += 1;
            result.ordersByMonth[month].revenue += sum;

            // status
            const st = o.status || "UNKNOWN";
            result.ordersByStatus[st] = (result.ordersByStatus[st] || 0) + 1;

            // supplier
            const supName =
                o.supplierName ||
                (o.supplier && (o.supplier.companyName || o.supplier.name)) ||
                "—";

            if (!result.suppliers[supName])
                result.suppliers[supName] = { ordersCount: 0, revenue: 0 };
            result.suppliers[supName].ordersCount += 1;
            result.suppliers[supName].revenue += sum;

            // products inside order
            for (const it of o.items || []) {
                const pid = it.productId;
                const qty = Number(it.quantity || 0);
                const price = Number(it.price || 0);
                const revenue = qty * price;

                if (!result.topProducts[pid]) {
                    result.topProducts[pid] = {
                        id: pid,
                        qty: 0,
                        revenue: 0,
                        name: it.productName ||
                            productById.get(pid)?.name ||
                            "—",
                        supplierName:
                            productById.get(pid)?.supplierCompanyName || "—",
                        category:
                            productById.get(pid)?.category ||
                            it.category ||
                            "—"
                    };
                }

                const tp = result.topProducts[pid];
                tp.qty += qty;
                tp.revenue += revenue;

                // category counter
                const cat = tp.category;
                result.categoryCounts[cat] = (result.categoryCounts[cat] || 0) + qty;
            }
        }

        result.avgOrderValue =
            result.totalOrders > 0
                ? result.totalRevenue / result.totalOrders
                : 0;

        return result;
    }, [orders, productById]);


    const topProductsArr = useMemo(() => {
        const arr = Object.values(stats.topProducts || {});
        arr.sort((a, b) => b.qty - a.qty || b.revenue - a.revenue);
        return arr.slice(0, 20);
    }, [stats.topProducts]);


    const monthsSorted = useMemo(() => {
        const keys = Object.keys(stats.ordersByMonth || {}).sort();

        return keys.map(k => {
            const obj = stats.ordersByMonth[k];

            return {
                key: k,
                count: Number(obj.count ?? 0),
                revenue: Number(obj.revenue ?? 0)
            };
        });
    }, [stats.ordersByMonth]);



    useEffect(() => {
        console.log("ORDERS RAW:", orders);
        console.log("MONTHS SORTED:", monthsSorted);
        console.log("ordersByMonth:", stats.ordersByMonth);
    }, [orders, monthsSorted, stats.ordersByMonth]);
    const maxCategory = Math.max(1, ...Object.values(stats.categoryCounts));
    const maxCount = Math.max(...monthsSorted.map(x => x.count));
    const maxRevenue = Math.max(...monthsSorted.map(x => x.revenue));



    if (loading)
        return <div className="analytics-container"><h2>Загрузка аналитики...</h2></div>;
    console.log("monthsSorted:", monthsSorted);
    console.log("maxCount:", maxCount, "maxRevenue:", maxRevenue);
    // --- FORECAST (Linear Regression) ---
    function linearRegression(data) {
        const n = data.length;
        const sumX = data.reduce((s, v, i) => s + i, 0);
        const sumY = data.reduce((s, v) => s + v.count, 0);
        const sumXY = data.reduce((s, v, i) => s + i * v.count, 0);
        const sumX2 = data.reduce((s, v, i) => s + i * i, 0);

        const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const a = (sumY - b * sumX) / n;

        return { a, b };
    }

    const regression = linearRegression(monthsSorted);

// прогноз на 3 месяца
    const forecast = [];

    for (let i = 1; i <= 3; i++) {
        const x = monthsSorted.length - 1 + i;
        const predicted = regression.a + regression.b * x;
        forecast.push(Math.max(0, predicted));
    }
    // === LINE CHART WITH FORECAST (SVG) ==================================

    function generatePath(points) {
        if (points.length === 0) return "";

        let d = `M ${points[0].x},${points[0].y}`;

        for (let i = 1; i < points.length; i++) {
            const p = points[i];
            const prev = points[i - 1];
            const cx = (prev.x + p.x) / 2;
            d += ` Q ${cx},${prev.y} ${p.x},${p.y}`;
        }
        return d;
    }

// Prepare data
    const labels = monthsSorted.map(m => m.key);
    const values = monthsSorted.map(m => m.count);

    const maxValue = Math.max(...values, ...forecast, 10);

    const chartWidth = 900;
    const chartHeight = 260;
    const padding = 40;

    const totalPoints = values.length;
    const step = (chartWidth - padding * 2) / (totalPoints - 1);

// Chart points (real)
    const chartPoints = values.map((v, i) => ({
        x: padding + i * step,
        y: chartHeight - padding - (v / maxValue) * (chartHeight - padding * 2),
        value: v,
        label: labels[i]
    }));
// === COMBINED CHART DATA FOR SIMPLE LINE GRAPH ===
    const chartData = [
        ...monthsSorted.map(m => {
            const max = Math.max(...monthsSorted.map(x => x.revenue), ...forecast, 10);
            return {
                key: m.key,
                revenue: m.revenue,
                predicted: false,
                h: (m.revenue / max) * 100
            };
        }),
        ...forecast.map((f, i) => {
            const max = Math.max(...monthsSorted.map(x => x.revenue), ...forecast, 10);
            return {
                key: `Прогноз +${i + 1}`,
                revenue: f,
                predicted: true,
                h: (f / max) * 100
            };
        })
    ];

// Forecast points (after real ones)
    const forecastPoints = forecast.map((f, i) => ({
        x: padding + (totalPoints + i) * step,
        y: chartHeight - padding - (f / maxValue) * (chartHeight - padding * 2),
        value: f,
        label: `Прогноз +${i + 1}`
    }));

    const pathReal = generatePath(chartPoints);
    const pathForecast = generatePath([chartPoints.at(-1), ...forecastPoints]);


    return (
        <div className="analytics-container">
            <h1>Аналитика по компании</h1>
            {error && <div className="error-box">Ошибка: {String(error)}</div>}

            {/* --- TOP METRICS --- */}
            <div className="analytics-grid">
                <div className="analytics-card">
                    <div className="analytics-label">Всего заказов</div>
                    <div className="analytics-value">{stats.totalOrders}</div>
                </div>

                <div className="analytics-card">
                    <div className="analytics-label">Общая сумма</div>
                    <div className="analytics-value">
                        {stats.totalRevenue.toLocaleString()} ₽
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="analytics-label">Средний чек</div>
                    <div className="analytics-value">
                        {stats.avgOrderValue.toFixed(2)} ₽
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="analytics-label">Уникальных товаров</div>
                    <div className="analytics-value">
                        {Object.keys(stats.topProducts).length}
                    </div>
                </div>
            </div>

            {/* MONTH TABLE */}
            <div className="section-block">
                <h2>Сумма и количество заказов по месяцам</h2>
                {monthsSorted.length === 0 ? (
                    <p>Нет данных</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Месяц</th>
                            <th>Заказов</th>
                            <th>Сумма (₽)</th>
                            <th>Средний чек (₽)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {monthsSorted.map(m => (
                            <tr key={m.key}>
                                <td>{m.key}</td>
                                <td>{m.count}</td>
                                <td>{m.revenue.toLocaleString()}</td>
                                <td>
                                    {m.count ? (m.revenue / m.count).toFixed(2) : "—"}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* TOP PRODUCTS */}
            <div className="section-block">
                <h2>Топ товаров</h2>
                <div className="top-products-grid">
                    {topProductsArr.map(p => (
                        <div className="product-card" key={p.id}>
                            <div className="pc-left">
                                <div className="pc-title">{p.name}</div>
                                <div className="pc-supplier">Поставщик: {p.supplierName}</div>
                            </div>
                            <div className="pc-right">
                                <div className="pc-qty">{p.qty} шт</div>
                                <div className="pc-rev">{p.revenue.toLocaleString()} ₽</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SUPPLIERS */}
            <div className="section-block">
                <h2>Сравнение поставщиков</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Поставщик</th>
                        <th>Заказов</th>
                        <th>На сумму (₽)</th>
                        <th>Средний чек</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(stats.suppliers)
                        .sort((a, b) => b[1].ordersCount - a[1].ordersCount)
                        .map(([name, s]) => (
                            <tr key={name}>
                                <td>{name}</td>
                                <td>{s.ordersCount}</td>
                                <td>{s.revenue.toLocaleString()}</td>
                                <td>{(s.revenue / s.ordersCount).toFixed(2)} ₽</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="chart-block">
                <div className="chart-title">График покупок</div>

                <div className="bar-chart">
                    {monthsSorted.map(m => {
                        const max = Math.max(...monthsSorted.map(x => x.revenue));
                        const h = max ? (m.revenue / max) * 100 : 0;

                        return (
                            <div key={m.key} className="bar-item-wrapper">
                                <div className="bar-item" style={{height: `${h}%`}}></div>

                                <div className="tooltip">
                                    <div><b>{m.key}</b></div>
                                    <div>Заказов: {m.count}</div>
                                    <div>Доход: {m.revenue.toLocaleString()} ₽</div>
                                    <div>Средний чек: {(m.revenue / Math.max(m.count, 1)).toLocaleString()} ₽</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* === LINE CHART (SVG) WITH FORECAST === */}
            <div className="section-block">
                <h2>Динамика заказов (с прогнозом)</h2>

                <div className="svg-chart-container">

                    <svg width="100%" height="300" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart">
                        {/* === Y AXIS === */}
                        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                            const y = chartHeight - padding - (t * (chartHeight - padding * 2));
                            const value = Math.round(maxValue * t);

                            return (
                                <g key={"y" + i}>
                                    <line
                                        x1={padding}
                                        x2={chartWidth - padding}
                                        y1={y}
                                        y2={y}
                                        stroke="#ddd"
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={padding - 10}
                                        y={y + 4}
                                        fontSize="12"
                                        fill="#666"
                                        textAnchor="end"
                                    >
                                        {value}
                                    </text>
                                </g>
                            );
                        })}

                        {/* REAL LINE */}
                        <path
                            d={pathReal}
                            fill="none"
                            stroke="#007bff"
                            strokeWidth="3"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            className="svg-anim"
                        />

                        {/* FORECAST LINE (DASHED) */}
                        <path
                            d={pathForecast}
                            fill="none"
                            stroke="#00c853"
                            strokeWidth="3"
                            strokeDasharray="8 8"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            className="svg-anim"
                        />

                        {/* REAL POINTS */}
                        {chartPoints.map((p, i) => (
                            <g
                                key={i}
                                onMouseEnter={() => setHover({x: p.x, y: p.y, label: p.label, value: p.value})}
                                onMouseLeave={() => setHover(null)}
                            >
                                <circle cx={p.x} cy={p.y} r="5" fill="#007bff"/>
                            </g>

                        ))}
                        {/* === X AXIS === */}
                        {chartPoints.map((p, i) => (
                            <text
                                key={"x" + i}
                                x={p.x}
                                y={chartHeight - 5}
                                fontSize="12"
                                fill="#333"
                                textAnchor="middle"
                            >
                                {p.label}
                            </text>
                        ))}

                        {/* FORECAST POINTS */}
                        {forecastPoints.map((p, i) => (
                            <g
                                key={"f" + i}
                                onMouseEnter={() => setHover({x: p.x, y: p.y, label: p.label, value: p.value})}
                                onMouseLeave={() => setHover(null)}
                            >
                                <circle cx={p.x} cy={p.y} r="5" fill="#00c853"/>
                            </g>

                        ))}
                        {hover && (
                            <g>
                                <rect
                                    x={hover.x + 10}
                                    y={hover.y - 35}
                                    width="140"
                                    height="40"
                                    rx="6"
                                    fill="white"
                                    stroke="#888"
                                    strokeWidth="1"
                                />
                                <text x={hover.x + 20} y={hover.y - 15} fontSize="13" fill="#000">
                                    {hover.label}
                                </text>
                                <text x={hover.x + 20} y={hover.y + 2} fontSize="13" fill="#333">
                                    {hover.value.toLocaleString()} шт
                                </text>
                            </g>
                        )}

                    </svg>
                </div>
            </div>


        </div>
    );
}
