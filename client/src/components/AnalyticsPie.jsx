import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function AnalyticsPie({ stats, small }) {
    const data = [
        { name: "Создано", value: stats.created },
        { name: "Отправлено", value: stats.sent },
        { name: "Получено", value: stats.received },
        { name: "Отменено", value: stats.cancelled }
    ];

    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f"];

        const size = small ? 180 : 360;
        const radius = small ? 70 : 110;

        return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 25 }}>
            <PieChart width={360} height={300}>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    label
                >
                    {data.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>

                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
}
