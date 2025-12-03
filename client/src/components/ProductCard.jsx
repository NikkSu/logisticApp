import { addToCart } from "../api/cart";
import { useState } from "react";

export default function ProductCard({ product, user }) {

    const [deliveryMinutes, setDeliveryMinutes] = useState(null);

    async function calcDelivery() {
        const sup = product.supplier;
        if (!sup?.user?.company) return;

        const company = sup.user.company;

        const url = `http://router.project-osrm.org/route/v1/driving/${company.longitude},${company.latitude};${user.longitude},${user.latitude}?overview=false`;

        const res = await fetch(url);
        const json = await res.json();
        const seconds = json.routes[0].duration;
        setDeliveryMinutes(Math.round(seconds / 60));
    }

    return (
        <div className="product-card">
            <h3>{product.name}</h3>
            <div>Цена: {product.price}₽</div>

            <button onClick={() => addToCart(product.id)}>Добавить в корзину</button>
            <button onClick={calcDelivery}>Расчёт доставки</button>

            {deliveryMinutes && (
                <div>Доставка: {deliveryMinutes} мин</div>
            )}
        </div>
    );
}
