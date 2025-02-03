document.addEventListener('DOMContentLoaded', () => {
    const cartItems = [
        { id: 1, name: 'Cesta', price: 10.00, quantity: 1, inStock: true, image: './assets/images/product1.webp', selected: true },
        { id: 2, name: 'Flores', price: 15.00, quantity: 2, inStock: true, image: './assets/images/product2.webp', selected: true },
        { id: 3, name: 'Switch', price: 0, quantity: 1, inStock: false, image: './assets/images/product3.webp', selected: true },
        { id: 4, name: 'Tablet', price: 25.00, quantity: 1, inStock: true, image: './assets/images/product4.webp', selected: true },
        { id: 5, name: 'Cámara', price: 30.00, quantity: 1, inStock: true, image: './assets/images/product5.webp', selected: true }
    ];

    const shippingMethods = {
        zone1: [
            { id: 'standard', name: 'Envío Estándar', price: 5.00 },
            { id: 'express', name: 'Envío Exprés', price: 10.00 }
        ],
        zone2: [
            { id: 'standard', name: 'Envío Estándar', price: 7.00 }
        ],
        zone3: [] // No servida
    };

    const discountCodes = {
        'DESCUENTO10': 0.10,
        'DESCUENTO20': 0.20
    };

    const cartContainer = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const igicElement = document.getElementById('igic');
    const totalElement = document.getElementById('total');
    const checkoutButton = document.getElementById('checkout-button');
    const backToCartButton = document.getElementById('back-to-cart');
    const shippingMethodsContainer = document.getElementById('shipping-methods');
    const customerDataSection = document.getElementById('customer-data');
    const customerForm = document.getElementById('customer-form');
    const billingSameCheckbox = document.getElementById('billing-same');
    const billingFields = document.getElementById('billing-fields');
    const paymentDataSection = document.getElementById('payment-data');
    const paymentForm = document.getElementById('payment-form');
    const backToCustomerDataButton = document.getElementById('back-to-customer-data');
    const discountCodeInput = document.getElementById('discount-code');
    const applyDiscountButton = document.getElementById('apply-discount');
    const discountMessage = document.getElementById('discount-message');
    const paymentTotalElement = document.getElementById('payment-total');
    const navigationSteps = document.querySelectorAll('#navigation-steps li');
    const confirmationSection = document.getElementById('confirmation');
    const orderSummary = document.getElementById('order-summary');
    const finishButton = document.getElementById('finish-button');
    let discount = 0;
    let shippingPrice = 0;

    function renderCart() {
        cartContainer.innerHTML = '';
        let subtotal = 0;

        cartItems.forEach(item => {
            if (item.quantity > 0) {
                const itemElement = document.createElement('div');
                itemElement.className = item.inStock ? 'cart-item' : 'cart-item out-of-stock';
                itemElement.innerHTML = `
                    <input type="checkbox" ${item.selected ? 'checked' : ''} data-id="${item.id}" class="select-item">
                    <img src="${item.image}" alt="${item.name}">
                    <span>${item.name}</span>
                    <span>${item.price.toFixed(2)} €</span>
                    <input type="number" value="${item.quantity}" min="0" data-id="${item.id}" class="quantity-input">
                    <span>Total: ${(item.price * item.quantity).toFixed(2)} €</span>
                    <button data-id="${item.id}">Eliminar</button>
                `;
                cartContainer.appendChild(itemElement);
                if (item.selected) {
                    subtotal += item.price * item.quantity;
                }
            }
        });

        const igic = subtotal * 0.07;
        const discountAmount = subtotal * discount;
        const total = subtotal + igic - discountAmount;

        if (subtotalElement) subtotalElement.textContent = subtotal.toFixed(2);
        if (igicElement) igicElement.textContent = igic.toFixed(2);
        if (totalElement) totalElement.textContent = total.toFixed(2);
        if (paymentTotalElement) paymentTotalElement.textContent = (total).toFixed(2);

        checkoutButton.disabled = subtotal === 0;
    }

    function renderShippingMethods(zone) {
        shippingMethodsContainer.innerHTML = '';
        const methods = shippingMethods[zone];
        if (methods.length === 0) {
            shippingMethodsContainer.innerHTML = '<p>No realizamos envíos a la zona seleccionada.</p>';
            return;
        }
        methods.forEach(method => {
            const methodElement = document.createElement('div');
            methodElement.innerHTML = `
                <input type="radio" name="shipping-method" value="${method.id}" data-price="${method.price}" required>
                <label>${method.name} (${method.price.toFixed(2)} €)</label>
            `;
            shippingMethodsContainer.appendChild(methodElement);
        });

        shippingMethodsContainer.addEventListener('change', (event) => {
            if (event.target.name === 'shipping-method') {
                shippingPrice = parseFloat(event.target.dataset.price);
                renderCart();
            }
        });
    }

    function updateNavigation(step) {
        navigationSteps.forEach((navStep, index) => {
            if (index < step) {
                navStep.classList.add('completed');
                navStep.classList.remove('active');
                navStep.classList.remove('disabled');
            } else if (index === step) {
                navStep.classList.add('active');
                navStep.classList.remove('completed');
                navStep.classList.remove('disabled');
            } else {
                navStep.classList.remove('active', 'completed');
                navStep.classList.add('disabled');
            }
        });
    }

    cartContainer.addEventListener('input', (event) => {
        const id = parseInt(event.target.dataset.id, 10);
        const item = cartItems.find(item => item.id === id);
        if (event.target.classList.contains('quantity-input')) {
            item.quantity = parseInt(event.target.value, 10);
            if (item.quantity === 0) {
                const itemIndex = cartItems.findIndex(item => item.id === id);
                cartItems.splice(itemIndex, 1);
            }
        }
        renderCart();
    });

    cartContainer.addEventListener('change', (event) => {
        if (event.target.classList.contains('select-item')) {
            const id = parseInt(event.target.dataset.id, 10);
            const item = cartItems.find(item => item.id === id);
            item.selected = event.target.checked;
            renderCart();
        }
    });

    cartContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const id = parseInt(event.target.dataset.id, 10);
            const itemIndex = cartItems.findIndex(item => item.id === id);
            cartItems.splice(itemIndex, 1);
            renderCart();
        }
    });

    applyDiscountButton.addEventListener('click', () => {
        const code = discountCodeInput.value.trim().toUpperCase();
        if (discountCodes[code]) {
            discount = discountCodes[code];
            discountMessage.textContent = `Código aplicado: ${code} - Descuento del ${(discount * 100).toFixed(0)}%`;
        } else {
            discount = 0;
            discountMessage.textContent = 'Código de descuento no válido.';
        }
        renderCart();
    });

    renderCart();

    checkoutButton.addEventListener('click', () => {
        document.getElementById('cart').style.display = 'none';
        customerDataSection.style.display = 'block';
        updateNavigation(1);
    });

    backToCartButton.addEventListener('click', () => {
        customerDataSection.style.display = 'none';
        document.getElementById('cart').style.display = 'block';
        updateNavigation(0);
    });

    billingSameCheckbox.addEventListener('change', () => {
        billingFields.style.display = billingSameCheckbox.checked ? 'none' : 'block';
    });

    document.getElementById('zone').addEventListener('change', (event) => {
        const zone = event.target.value;
        renderShippingMethods(zone);
    });

    customerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // Validar y procesar los datos del cliente
        const formData = new FormData(customerForm);
        const customerData = {
            name: formData.get('name'),
            surname: formData.get('surname'),
            address: formData.get('address'),
            city: formData.get('city'),
            postalCode: formData.get('postal-code'),
            zone: formData.get('zone'),
            billingSame: formData.get('billing-same'),
            billingAddress: formData.get('billing-address'),
            billingCity: formData.get('billing-city'),
            billingPostalCode: formData.get('billing-postal-code'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            shippingMethod: formData.get('shipping-method')
        };

        // Validar datos del cliente
        if (!customerData.name || !customerData.surname || !customerData.address || !customerData.city || !customerData.postalCode || !customerData.zone || !customerData.email || !customerData.phone || !customerData.shippingMethod) {
            alert('Por favor, complete todos los campos obligatorios.');
            return;
        }

        if (customerData.zone === 'zone3') {
            alert('No realizamos envíos a la zona seleccionada.');
            return;
        }

        // Continuar a la siguiente etapa
        customerDataSection.style.display = 'none';
        paymentDataSection.style.display = 'block';
        updateNavigation(2);
    });

    backToCustomerDataButton.addEventListener('click', () => {
        paymentDataSection.style.display = 'none';
        customerDataSection.style.display = 'block';
        updateNavigation(1);
    });

    paymentForm.addEventListener('change', (event) => {
        if (event.target.name === 'payment-method') {
            const paymentMethod = event.target.value;
            document.getElementById('card-details').style.display = paymentMethod === 'card' ? 'block' : 'none';
            document.getElementById('paypal-details').style.display = paymentMethod === 'paypal' ? 'block' : 'none';
            document.getElementById('bank-transfer-details').style.display = paymentMethod === 'bank-transfer' ? 'block' : 'none';
        }
    });

    paymentForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // Validar y procesar los datos de pago
        const formData = new FormData(paymentForm);
        const paymentData = {
            paymentMethod: formData.get('payment-method'),
            cardName: formData.get('card-name'),
            cardNumber: formData.get('card-number'),
            cardExpiry: formData.get('card-expiry'),
            cardCvc: formData.get('card-cvc'),
            paypalEmail: formData.get('paypal-email'),
            bankReceipt: formData.get('bank-receipt')
        };

        // Validar datos de pago
        if (!paymentData.paymentMethod) {
            alert('Por favor, seleccione un método de pago.');
            return;
        }

        if (paymentData.paymentMethod === 'card') {
            if (!paymentData.cardName || !paymentData.cardNumber || !paymentData.cardExpiry || !paymentData.cardCvc) {
                alert('Por favor, complete todos los campos de la tarjeta.');
                return;
            }
            if (!/^\d{16}$/.test(paymentData.cardNumber)) {
                alert('El número de la tarjeta debe tener 16 dígitos.');
                return;
            }
            if (!/^\d{3}$/.test(paymentData.cardCvc)) {
                alert('El CVC debe tener 3 dígitos.');
                return;
            }
            if (!/^\d{2}\/\d{2}$/.test(paymentData.cardExpiry)) {
                alert('La fecha de caducidad debe tener el formato MM/AA.');
                return;
            }
        } else if (paymentData.paymentMethod === 'paypal') {
            if (!paymentData.paypalEmail) {
                alert('Por favor, ingrese su correo electrónico de PayPal.');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentData.paypalEmail)) {
                alert('Por favor, ingrese un correo electrónico válido.');
                return;
            }
        } else if (paymentData.paymentMethod === 'bank-transfer') {
            if (!paymentData.bankReceipt) {
                alert('Por favor, suba el justificante de la transferencia bancaria.');
                return;
            }
        }

        // Continuar a la siguiente etapa
        paymentDataSection.style.display = 'none';
        confirmationSection.style.display = 'block';
        updateNavigation(3);
        renderOrderSummary();
    });

    function renderOrderSummary() {
        orderSummary.innerHTML = '';
        cartItems.forEach(item => {
            if (item.selected) {
                const itemElement = document.createElement('div');
                itemElement.className = item.inStock ? 'cart-item' : 'cart-item out-of-stock';
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <span>${item.name}</span>
                    <span>${item.price.toFixed(2)} €</span>
                    <span>Cantidad: ${item.quantity}</span>
                    <span>Total: ${(item.price * item.quantity).toFixed(2)} €</span>
                `;
                orderSummary.appendChild(itemElement);
            }
        });

        const subtotal = parseFloat(subtotalElement.textContent);
        const igic = parseFloat(igicElement.textContent);
        const discountAmount = subtotal * discount;
        const total = subtotal + igic - discountAmount + shippingPrice;

        const summaryElement = document.createElement('div');
        summaryElement.className = 'order-summary';
        summaryElement.innerHTML = `
            <p>Subtotal: ${subtotal.toFixed(2)} €</p>
            <p>IGIC: ${igic.toFixed(2)} €</p>
            <p>Descuento: ${discountAmount.toFixed(2)} €</p>
            <p>Envío: ${shippingPrice.toFixed(2)} €</p>
            <p>Total: ${total.toFixed(2)} €</p>
        `;
        orderSummary.appendChild(summaryElement);
    }

    finishButton.addEventListener('click', () => {
        alert('Gracias por tu compra. Tu pedido ha sido confirmado.');
        // Aquí puedes añadir lógica adicional para finalizar el pedido, como redirigir al usuario o limpiar el carrito.
    });

    navigationSteps.forEach((navStep, index) => {
        navStep.addEventListener('click', () => {
            if (index <= Array.from(navigationSteps).findIndex(step => step.classList.contains('active'))) {
                if (index === 0) {
                    document.getElementById('cart').style.display = 'block';
                    customerDataSection.style.display = 'none';
                    paymentDataSection.style.display = 'none';
                    confirmationSection.style.display = 'none';
                } else if (index === 1) {
                    document.getElementById('cart').style.display = 'none';
                    customerDataSection.style.display = 'block';
                    paymentDataSection.style.display = 'none';
                    confirmationSection.style.display = 'none';
                } else if (index === 2) {
                    document.getElementById('cart').style.display = 'none';
                    customerDataSection.style.display = 'none';
                    paymentDataSection.style.display = 'block';
                    confirmationSection.style.display = 'none';
                }
                updateNavigation(index);
            }
        });
    });
});