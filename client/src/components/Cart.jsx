import { useEffect, useState } from "react";
import { getCart, removeFromCart, clearCart } from "../api/cart";
import { checkout } from "../api/orders";

export default function Cart({ user }) {

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deliveryTime, setDeliveryTime] = useState(null);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        const data = await getCart();
        setItems(data);
        setLoading(false);
    }

    async function handleRemove(id) {
        await removeFromCart(id);
        load();
    }

    async function handleCheckout() {
        if (!user?.company || !user?.company.latitude) {
            alert("У пользователя нет координат.");
            return;
        }

        const result = await checkout(user.latitude, user.longitude);
        console.log(result);
        alert("Заказ оформлен!");
        load();
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div className="cart">
            <h2>Корзина</h2>
            {items.length === 0 ? (
                <p>Пусто</p>
            ) : (
                <>
                    <ul>
                        {items.map(i => (
                            <li key={i.id}>
                                {i.product.name} x {i.quantity}
                                <button onClick={() => handleRemove(i.product.id)}>Удалить</button>
                            </li>
                        ))}
                    </ul>

                    <button onClick={handleCheckout}>Оформить заказ</button>
                    <button onClick={clearCart}>Очистить</button>
                </>
            )}
        </div>
    );
}
