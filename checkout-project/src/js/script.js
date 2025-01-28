// This file contains the JavaScript code that handles the functionality of the checkout process.

document.addEventListener('DOMContentLoaded', function() {
    const cart = [
        { id: 1, name: 'Product 1', price: 10.00, quantity: 1, inStock: true },
        { id: 2, name: 'Product 2', price: 15.00, quantity: 1, inStock: true },
        { id: 3, name: 'Product 3', price: 20.00, quantity: 1, inStock: true },
        { id: 4, name: 'Product 4', price: 25.00, quantity: 1, inStock: false },
        { id: 5, name: 'Product 5', price: 30.00, quantity: 1, inStock: true }
    ];

    function updateCartDisplay() {
        const cartContainer = document.getElementById('cart');
        cartContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach(item => {
            if (item.quantity > 0) {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                cartContainer.innerHTML += `
                    <div class="cart-item ${item.inStock ? '' : 'out-of-stock'}">
                        <span>${item.name}</span>
                        <span>Units: <button onclick="changeQuantity(${item.id}, -1)">-</button> ${item.quantity} <button onclick="changeQuantity(${item.id}, 1)">+</button></span>
                        <span>Price: $${item.price.toFixed(2)}</span>
                        <span>Total: $${itemTotal.toFixed(2)}</span>
                        <button onclick="removeItem(${item.id})">Remove</button>
                    </div>
                `;
            }
        });

        const tax = subtotal * 0.07;
        const total = subtotal + tax;

        cartContainer.innerHTML += `
            <div class="cart-summary">
                <span>Subtotal: $${subtotal.toFixed(2)}</span>
                <span>IGIC (7%): $${tax.toFixed(2)}</span>
                <span>Total: $${total.toFixed(2)}</span>
            </div>
        `;

        document.getElementById('checkout-button').disabled = cart.every(item => item.quantity === 0);
    }

    window.changeQuantity = function(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity < 0) item.quantity = 0;
            updateCartDisplay();
        }
    };

    window.removeItem = function(id) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity = 0;
            updateCartDisplay();
        }
    };

    updateCartDisplay();
});