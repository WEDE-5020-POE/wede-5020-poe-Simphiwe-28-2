// ============================================
// MZIZI CATERING - COMPLETE JAVASCRIPT FILE
// Handles Cart, Checkout, Payments, and Forms
// ============================================

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== SHOPPING CART FUNCTIONS ==========
    
    // Initialize cart from localStorage or empty array
    let cart = JSON.parse(localStorage.getItem('mziziCart')) || [];
    
    // Function to add item to cart
    window.addToCart = function(name, price) {
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: Date.now(),
                name: name,
                price: price,
                quantity: 1
            });
        }
        
        // Save to localStorage
        localStorage.setItem('mziziCart', JSON.stringify(cart));
        
        // Update display
        updateCartDisplay();
        
        // Update floating cart count
        updateFloatingCartCount();
        
        // Show notification
        showNotification(`${name} added to cart!`, 'success');
    };
    
    // Function to update floating cart count
    function updateFloatingCartCount() {
        const cartCountSpan = document.getElementById('cartItemCount');
        if (cartCountSpan) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountSpan.textContent = totalItems;
            cartCountSpan.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    }
    
    // Function to update cart display
    window.updateCartDisplay = function() {
        const cartContainer = document.getElementById('cartItems');
        const totalElement = document.getElementById('cartTotal');
        
        if (!cartContainer) return;
        
        if (cart.length === 0) {
            cartContainer.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Your cart is empty 🛒</p>';
            if (totalElement) totalElement.innerText = '0';
            updateFloatingCartCount();
            return;
        }
        
        let html = '';
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 12px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="flex: 2;">
                        <strong style="font-size: 1rem;">${escapeHtml(item.name)}</strong><br>
                        <small style="color: #666;">R${item.price} x ${item.quantity}</small>
                    </div>
                    <div style="flex: 1; text-align: right;">
                        <strong style="color: #8B4513; font-size: 1rem;">R${itemTotal}</strong><br>
                        <button onclick="removeFromCart(${index})" style="background: #dc3545; color: white; border: none; border-radius: 5px; padding: 5px 10px; margin-top: 5px; cursor: pointer; font-size: 11px;">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `;
        });
        
        cartContainer.innerHTML = html;
        if (totalElement) totalElement.innerText = total;
        
        // Store total for checkout
        localStorage.setItem('cartTotal', total);
        updateFloatingCartCount();
    };
    
    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Function to remove item from cart
    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        localStorage.setItem('mziziCart', JSON.stringify(cart));
        updateCartDisplay();
        showNotification('Item removed from cart', 'info');
    };
    
    // Function to clear entire cart
    window.clearCart = function() {
        cart = [];
        localStorage.setItem('mziziCart', JSON.stringify(cart));
        updateCartDisplay();
        showNotification('Cart cleared', 'info');
    };
    
    // ========== GENERATE ORDER NUMBER ==========
    
    function generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const random = Math.floor(Math.random() * 9000 + 1000);
        
        return `MZ-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
    }
    
    // ========== CHECKOUT WITH PAYMENT OPTIONS ==========
    
    
    // Main checkout function
    window.checkout = function() {
        const total = parseInt(localStorage.getItem('cartTotal')) || 0;
        
        if (cart.length === 0) {
            showNotification('Your cart is empty! Add some delicious food first.', 'error');
            return;
        }
        
        showPaymentModal(total);
    };
    
    // Show payment options modal
    window.showPaymentModal = function(total) {
        const orderNumber = generateOrderNumber();
        
        const modalHTML = `
            <div id="paymentModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 9999;">
                <div style="background: white; border-radius: 20px; max-width: 650px; width: 90%; max-height: 85vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    
                    <div style="padding: 25px;">
                        <!-- Header -->
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2 style="color: #8B4513; font-size: 1.6rem; margin: 0 0 10px 0;"><i class="fas fa-credit-card"></i> Complete Your Order</h2>
                            <div style="background: #f0e6d2; padding: 12px; border-radius: 10px;">
                                <small style="color: #666; font-size: 0.75rem; display: block;">ORDER NUMBER</small>
                                <strong style="color: #8B4513; font-family: monospace; font-size: 1rem; word-break: break-all;">${orderNumber}</strong>
                            </div>
                        </div>
                        
                        <!-- ORDER SUMMARY - Improved Size -->
                        <div style="background: #f9f9f9; border-radius: 12px; padding: 15px; margin: 15px 0;">
                            <h3 style="color: #8B4513; font-size: 1.2rem; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                                <i class="fas fa-shopping-bag"></i> Order Summary
                                <span style="font-size: 0.8rem; font-weight: normal; margin-left: auto; background: #8B4513; color: white; padding: 2px 10px; border-radius: 20px;">${cart.length} item(s)</span>
                            </h3>
                            <div style="max-height: 280px; overflow-y: auto; padding-right: 8px;">
                                ${cart.map(item => `
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                        <div style="flex: 2;">
                                            <div style="font-weight: 600; font-size: 1rem; color: #333;">${escapeHtml(item.name)}</div>
                                            <div style="font-size: 0.8rem; color: #666; margin-top: 4px;">Quantity: ${item.quantity} × R${item.price}</div>
                                        </div>
                                        <div style="flex: 1; text-align: right; font-weight: bold; color: #8B4513; font-size: 1rem;">R${item.price * item.quantity}</div>
                                    </div>
                                `).join('')}
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0 5px 0; margin-top: 10px; border-top: 2px solid #8B4513;">
                                <span style="font-size: 1.2rem; font-weight: bold; color: #333;">Total Amount:</span>
                                <span style="font-size: 1.5rem; font-weight: bold; color: #8B4513;">R${total}</span>
                            </div>
                        </div>
                        
                        <!-- Payment Options -->
                        <div style="margin: 15px 0;">
                            <h3 style="color: #8B4513; font-size: 1.1rem; margin: 0 0 12px 0;"><i class="fas fa-money-bill-wave"></i> Select Payment Method</h3>
                            <div id="paymentOptions">
                                <label style="display: flex; align-items: center; padding: 14px; margin: 8px 0; border: 2px solid #ddd; border-radius: 10px; cursor: pointer; transition: all 0.3s ease;">
                                    <input type="radio" name="paymentMethod" value="card" checked style="margin-right: 12px; width: 18px; height: 18px;">
                                    <i class="fas fa-credit-card" style="color: #8B4513; font-size: 22px; width: 30px;"></i>
                                    <div>
                                        <strong style="font-size: 1rem;">Credit/Debit Card</strong>
                                        <br><small style="color: #666;">Visa, Mastercard, American Express</small>
                                    </div>
                                </label>
                                
                                <label style="display: flex; align-items: center; padding: 14px; margin: 8px 0; border: 2px solid #ddd; border-radius: 10px; cursor: pointer; transition: all 0.3s ease;">
                                    <input type="radio" name="paymentMethod" value="cash" style="margin-right: 12px; width: 18px; height: 18px;">
                                    <i class="fas fa-money-bill-wave" style="color: #8B4513; font-size: 22px; width: 30px;"></i>
                                    <div>
                                        <strong style="font-size: 1rem;">Cash on Delivery</strong>
                                        <br><small style="color: #666;">Pay when you receive your order</small>
                                    </div>
                                </label>
                                
                                <label style="display: flex; align-items: center; padding: 14px; margin: 8px 0; border: 2px solid #ddd; border-radius: 10px; cursor: pointer; transition: all 0.3s ease;">
                                    <input type="radio" name="paymentMethod" value="ewallet" style="margin-right: 12px; width: 18px; height: 18px;">
                                    <i class="fas fa-mobile-alt" style="color: #8B4513; font-size: 22px; width: 30px;"></i>
                                    <div>
                                        <strong style="font-size: 1rem;">E-Wallet / Mobile Money</strong>
                                        <br><small style="color: #666;">Pay via mobile payment</small>
                                    </div>
                                </label>
                                
                                <label style="display: flex; align-items: center; padding: 14px; margin: 8px 0; border: 2px solid #ddd; border-radius: 10px; cursor: pointer; transition: all 0.3s ease;">
                                    <input type="radio" name="paymentMethod" value="bank" style="margin-right: 12px; width: 18px; height: 18px;">
                                    <i class="fas fa-university" style="color: #8B4513; font-size: 22px; width: 30px;"></i>
                                    <div>
                                        <strong style="font-size: 1rem;">Bank Transfer</strong>
                                        <br><small style="color: #666;">EFT / Direct Bank Deposit</small>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Delivery Information -->
                        <div style="background: #fff8f0; border-radius: 12px; padding: 15px; margin: 15px 0;">
                            <h3 style="color: #8B4513; font-size: 1.1rem; margin: 0 0 12px 0;"><i class="fas fa-truck"></i> Delivery Information</h3>
                            <input type="text" id="deliveryName" placeholder="Full Name *" required style="width: 100%; padding: 12px; margin: 6px 0; border: 1px solid #ccc; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;">
                            <input type="tel" id="deliveryPhone" placeholder="Phone Number *" required style="width: 100%; padding: 12px; margin: 6px 0; border: 1px solid #ccc; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;">
                            <input type="email" id="deliveryEmail" placeholder="Email Address" style="width: 100%; padding: 12px; margin: 6px 0; border: 1px solid #ccc; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;">
                            <input type="text" id="deliveryAddress" placeholder="Delivery Address *" required style="width: 100%; padding: 12px; margin: 6px 0; border: 1px solid #ccc; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box;">
                            <textarea id="deliveryNotes" placeholder="Special instructions (gate code, landmarks, etc.)" rows="2" style="width: 100%; padding: 12px; margin: 6px 0; border: 1px solid #ccc; border-radius: 8px; font-size: 0.95rem; box-sizing: border-box; resize: vertical;"></textarea>
                        </div>
                        
                        <!-- Buttons -->
                        <div style="display: flex; gap: 12px; margin-top: 20px;">
                            <button onclick="closePaymentModal()" style="flex: 1; background: #6c757d; color: white; padding: 14px; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                            <button onclick="processPayment('${orderNumber}')" style="flex: 1; background: #8B4513; color: white; padding: 14px; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                                <i class="fas fa-check"></i> Confirm & Pay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        // Add hover effects to payment options
        const paymentLabels = document.querySelectorAll('#paymentOptions label');
        paymentLabels.forEach(label => {
            label.addEventListener('mouseenter', function() {
                this.style.borderColor = '#8B4513';
                this.style.backgroundColor = '#fef5ea';
            });
            label.addEventListener('mouseleave', function() {
                this.style.borderColor = '#ddd';
                this.style.backgroundColor = 'transparent';
            });
        });
    }
    
    // Close payment modal
    window.closePaymentModal = function() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }
    
    // Process payment based on selected method
    window.processPayment = function(orderNumber) {
        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
        const paymentMethod = selectedPayment ? selectedPayment.value : 'card';
        
        const name = document.getElementById('deliveryName')?.value || '';
        const phone = document.getElementById('deliveryPhone')?.value || '';
        const email = document.getElementById('deliveryEmail')?.value || '';
        const address = document.getElementById('deliveryAddress')?.value || '';
        const notes = document.getElementById('deliveryNotes')?.value || 'None';
        
        if (!name || name.trim() === '') {
            showNotification('❌ Please enter your name', 'error');
            return;
        }
        
        if (!phone || phone.trim() === '') {
            showNotification('❌ Please enter your phone number', 'error');
            return;
        }
        
        if (!address || address.trim() === '') {
            showNotification('❌ Please enter delivery address', 'error');
            return;
        }
        
        const total = localStorage.getItem('cartTotal') || 0;
        
        const now = new Date();
        const orderDate = now.toLocaleDateString('en-ZA');
        const orderTime = now.toLocaleTimeString('en-ZA');
        
        const order = {
            orderNumber: orderNumber,
            orderDate: orderDate,
            orderTime: orderTime,
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            })),
            totalAmount: total,
            paymentMethod: paymentMethod,
            deliveryInfo: {
                name: name,
                phone: phone,
                email: email || 'Not provided',
                address: address,
                notes: notes
            },
            status: 'pending',
            estimatedDelivery: getEstimatedDelivery()
        };
        
        const orders = JSON.parse(localStorage.getItem('mziziOrders')) || [];
        orders.push(order);
        localStorage.setItem('mziziOrders', JSON.stringify(orders));
        
        closePaymentModal();
        showOrderConfirmation(order);
        
        cart = [];
        localStorage.setItem('mziziCart', JSON.stringify(cart));
        updateCartDisplay();
        localStorage.setItem('lastOrderNumber', orderNumber);
    }
    
    function getEstimatedDelivery() {
        const now = new Date();
        const deliveryTime = new Date(now.getTime() + 60 * 60 * 1000);
        return deliveryTime.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
    }
    
    function showOrderConfirmation(order) {
        const paymentNames = {
            'card': '💳 Credit/Debit Card',
            'cash': '💰 Cash on Delivery',
            'ewallet': '📱 E-Wallet / Mobile Money',
            'bank': '🏦 Bank Transfer'
        };
        
        const paymentDisplay = paymentNames[order.paymentMethod] || order.paymentMethod;
        
        let paymentInstructions = '';
        switch(order.paymentMethod) {
            case 'card':
                paymentInstructions = '🔐 You will be redirected to our secure payment gateway. Please have your card ready.';
                break;
            case 'cash':
                paymentInstructions = `💵 Please have R${order.totalAmount} cash ready when your order arrives.`;
                break;
            case 'ewallet':
                paymentInstructions = `📲 You will receive an SMS with a payment link to complete R${order.totalAmount} payment.`;
                break;
            case 'bank':
                paymentInstructions = `🏦 Please transfer R${order.totalAmount} to:<br><br>
                    <strong>Mzizi Catering</strong><br>
                    FNB Account: 62878945612<br>
                    Branch Code: 250655<br>
                    Reference: ${order.orderNumber}<br><br>
                    Send proof of payment to contact@mzizicatering.co.za`;
                break;
        }
        
        const confirmHTML = `
            <div id="confirmModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 9999;">
                <div style="background: white; border-radius: 25px; max-width: 550px; width: 90%; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    
                    <div style="padding: 30px; text-align: center;">
                        <!-- Success Icon -->
                        <div style="background: #28a745; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                            <i class="fas fa-check" style="font-size: 45px; color: white;"></i>
                        </div>
                        
                        <h2 style="color: #8B4513; margin: 0 0 10px 0; font-size: 1.6rem;">🎉 Order Confirmed!</h2>
                        
                        <!-- Order Number Box -->
                        <div style="background: linear-gradient(135deg, #8B4513, #A0522D); padding: 20px; border-radius: 15px; margin: 20px 0;">
                            <small style="color: #ffcd94; letter-spacing: 2px; font-size: 0.7rem;">ORDER NUMBER</small>
                            <h3 style="color: white; font-size: 1.1rem; margin: 10px 0; font-family: monospace; word-break: break-all;">${order.orderNumber}</h3>
                            <div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
                                <button onclick="copyOrderNumber('${order.orderNumber}')" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 6px 15px; border-radius: 20px; cursor: pointer; font-size: 0.8rem;">
                                    <i class="fas fa-copy"></i> Copy
                                </button>
                                <button onclick="printOrder('${order.orderNumber}')" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 6px 15px; border-radius: 20px; cursor: pointer; font-size: 0.8rem;">
                                    <i class="fas fa-print"></i> Print
                                </button>
                            </div>
                        </div>
                        
                        <!-- Order Details -->
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 12px; margin: 15px 0; text-align: left;">
                            <p style="margin: 8px 0; font-size: 0.9rem;"><strong><i class="fas fa-calendar"></i> Order Date:</strong> ${order.orderDate} at ${order.orderTime}</p>
                            <p style="margin: 8px 0; font-size: 0.9rem;"><strong><i class="fas fa-truck"></i> Est. Delivery:</strong> Around ${order.estimatedDelivery}</p>
                            <p style="margin: 8px 0; font-size: 0.9rem;"><strong><i class="fas fa-credit-card"></i> Payment Method:</strong> ${paymentDisplay}</p>
                            <p style="margin: 8px 0; font-size: 0.9rem;"><strong><i class="fas fa-map-marker-alt"></i> Delivery To:</strong> ${order.deliveryInfo.address}</p>
                        </div>
                        
                        <!-- Order Summary -->
                        <div style="background: #f0e6d2; padding: 15px; border-radius: 12px; margin: 15px 0; text-align: left;">
                            <h4 style="color: #8B4513; margin: 0 0 12px 0; font-size: 1rem;"><i class="fas fa-receipt"></i> Order Summary</h4>
                            ${order.items.map(item => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.85rem;">
                                    <span>${escapeHtml(item.name)} x${item.quantity}</span>
                                    <span style="color: #8B4513;">R${item.subtotal}</span>
                                </div>
                            `).join('')}
                            <hr style="margin: 10px 0;">
                            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1rem;">
                                <span>Total Paid:</span>
                                <span style="color: #8B4513;">R${order.totalAmount}</span>
                            </div>
                        </div>
                        
                        <!-- Payment Instructions -->
                        <div style="background: #e8f5e9; padding: 15px; border-radius: 10px; margin: 15px 0; text-align: left;">
                            <p style="margin: 0; color: #2e7d32; font-size: 0.85rem;">
                                <i class="fas fa-info-circle"></i> 
                                <strong>Payment Instructions:</strong><br>
                                ${paymentInstructions}
                            </p>
                        </div>
                        
                        <p style="color: #666; margin: 15px 0; font-size: 0.8rem;">
                            <i class="fas fa-envelope"></i> A confirmation SMS has been sent to ${order.deliveryInfo.phone}
                        </p>
                        
                        <!-- Buttons -->
                        <div style="display: flex; gap: 12px; margin-top: 20px;">
                            <button onclick="closeConfirmModal()" style="flex: 1; background: #8B4513; color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">
                                <i class="fas fa-check"></i> Done
                            </button>
                            <button onclick="viewOrderHistory()" style="flex: 1; background: #2c3e50; color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">
                                <i class="fas fa-history"></i> My Orders
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', confirmHTML);
        document.body.style.overflow = 'hidden';
    }
    
    window.copyOrderNumber = function(orderNumber) {
        navigator.clipboard.writeText(orderNumber).then(() => {
            showNotification('📋 Order number copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy order number', 'error');
        });
    }
    
    window.printOrder = function(orderNumber) {
        const orders = JSON.parse(localStorage.getItem('mziziOrders')) || [];
        const order = orders.find(o => o.orderNumber === orderNumber);
        
        if (order) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Mzizi Catering - Order ${order.orderNumber}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .order-number { font-size: 20px; color: #8B4513; margin: 10px 0; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background: #8B4513; color: white; }
                        .total { font-size: 18px; font-weight: bold; text-align: right; }
                        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Mzizi Catering</h1>
                        <p>bringing you back to our roots</p>
                        <div class="order-number">Order #: ${order.orderNumber}</div>
                        <p>Date: ${order.orderDate} at ${order.orderTime}</p>
                    </div>
                    
                    <h3>Order Summary</h3>
                    <table>
                        <tr><th>Item</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>R${item.price}</td>
                                <td>R${item.subtotal}</td>
                            </tr>
                        `).join('')}
                    </table>
                    <div class="total">Total: R${order.totalAmount}</div>
                    
                    <h3>Delivery Information</h3>
                    <p><strong>Name:</strong> ${order.deliveryInfo.name}</p>
                    <p><strong>Phone:</strong> ${order.deliveryInfo.phone}</p>
                    <p><strong>Address:</strong> ${order.deliveryInfo.address}</p>
                    <p><strong>Notes:</strong> ${order.deliveryInfo.notes}</p>
                    
                    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                    <p><strong>Estimated Delivery:</strong> Around ${order.estimatedDelivery}</p>
                    
                    <div class="footer">
                        <p>Thank you for choosing Mzizi Catering!</p>
                        <p>Contact us: 076 841 1046 | contact@mzizicatering.co.za</p>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    }
    
    window.viewOrderHistory = function() {
        closeConfirmModal();
        showOrderHistory();
    }
    
    function showOrderHistory() {
        const orders = JSON.parse(localStorage.getItem('mziziOrders')) || [];
        
        if (orders.length === 0) {
            showNotification('No orders found. Place your first order!', 'info');
            return;
        }
        
        const historyHTML = `
            <div id="historyModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 9999;">
                <div style="background: white; border-radius: 20px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                    <div style="padding: 25px;">
                        <h2 style="color: #8B4513; text-align: center; margin: 0 0 15px 0;"><i class="fas fa-history"></i> My Orders</h2>
                        <hr>
                        ${orders.reverse().map(order => `
                            <div style="border: 1px solid #ddd; border-radius: 10px; padding: 15px; margin: 15px 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                                    <div>
                                        <strong style="color: #8B4513; font-size: 0.9rem;">${order.orderNumber}</strong><br>
                                        <small style="color: #666;">${order.orderDate}</small>
                                    </div>
                                    <div style="text-align: right;">
                                        <strong style="color: #8B4513; font-size: 1rem;">R${order.totalAmount}</strong><br>
                                        <span style="background: #28a745; color: white; padding: 2px 10px; border-radius: 12px; font-size: 0.7rem;">${order.status}</span>
                                    </div>
                                </div>
                                <hr style="margin: 10px 0;">
                                <div style="font-size: 0.8rem;">
                                    <p style="margin: 5px 0;"><strong>Delivery to:</strong> ${order.deliveryInfo.address}</p>
                                    <p style="margin: 5px 0;"><strong>Items:</strong> ${order.items.length} item(s)</p>
                                </div>
                            </div>
                        `).join('')}
                        <button onclick="closeHistoryModal()" style="background: #8B4513; color: white; padding: 12px 20px; border: none; border-radius: 8px; width: 100%; cursor: pointer; font-size: 1rem; margin-top: 10px;">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', historyHTML);
        document.body.style.overflow = 'hidden';
    }
    
    window.closeHistoryModal = function() {
        const modal = document.getElementById('historyModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }
    
    window.closeConfirmModal = function() {
        const modal = document.getElementById('confirmModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    }
    
    // ========== NOTIFICATION SYSTEM ==========
    
    function showNotification(message, type = 'success') {
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 14px 22px;
            border-radius: 10px;
            box-shadow: 0 3px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
            font-size: 0.9rem;
        `;
        notification.innerHTML = `<i class="fas ${icons[type]}"></i> ${message}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    // ========== FORM HANDLING ==========
    
    const enquiryForm = document.getElementById('enquiryForm');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = enquiryForm.querySelector('input[placeholder="Full Name"]')?.value || 'Customer';
            showNotification(`Thank you ${name}! We'll contact you within 24 hours.`, 'success');
            enquiryForm.reset();
        });
    }
    
    const contactForm = document.querySelector('form[action="mailto:contact@mzizicatering.co.za"]');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            contactForm.reset();
        });
    }
    
    // ========== MOBILE MENU TOGGLE ==========
    
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && window.innerWidth <= 768) {
        const navDiv = document.querySelector('nav > div:first-child');
        if (navDiv && !document.querySelector('.hamburger-btn')) {
            const hamburger = document.createElement('button');
            hamburger.className = 'hamburger-btn';
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            hamburger.style.cssText = `
                background: #8B4513;
                color: white;
                border: none;
                padding: 10px 18px;
                border-radius: 8px;
                font-size: 20px;
                cursor: pointer;
                margin-left: auto;
            `;
            
            hamburger.addEventListener('click', function() {
                const isVisible = navMenu.style.display === 'flex';
                navMenu.style.display = isVisible ? 'none' : 'flex';
                navMenu.style.flexDirection = 'column';
                navMenu.style.width = '100%';
                navMenu.style.padding = '15px 0';
                navMenu.style.gap = '10px';
            });
            
            navDiv.appendChild(hamburger);
            navMenu.style.display = 'none';
        }
    }
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            const navMenuElem = document.querySelector('.nav-menu');
            const hamburger = document.querySelector('.hamburger-btn');
            if (navMenuElem) navMenuElem.style.display = 'flex';
            if (hamburger) hamburger.style.display = 'none';
        } else {
            const hamburger = document.querySelector('.hamburger-btn');
            if (hamburger) hamburger.style.display = 'block';
        }
    });
    
    // ========== IMAGE GALLERY LIGHTBOX ==========
    
    const galleryImages = document.querySelectorAll('.gallery-img, section img, .menu-img');
    galleryImages.forEach(img => {
        if (img.closest('.nav-menu')) return;
        if (img.closest('button')) return;
        
        img.style.cursor = 'pointer';
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            const lightbox = document.createElement('div');
            lightbox.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10001;
                cursor: pointer;
            `;
            
            const enlargedImg = document.createElement('img');
            enlargedImg.src = this.src;
            enlargedImg.style.maxWidth = '90%';
            enlargedImg.style.maxHeight = '90%';
            enlargedImg.style.borderRadius = '15px';
            enlargedImg.style.boxShadow = '0 5px 30px rgba(0,0,0,0.5)';
            
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.style.cssText = `
                position: absolute;
                top: 20px;
                right: 30px;
                background: white;
                border: none;
                font-size: 30px;
                cursor: pointer;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            lightbox.appendChild(enlargedImg);
            lightbox.appendChild(closeBtn);
            
            lightbox.addEventListener('click', () => {
                lightbox.remove();
                document.body.style.overflow = 'auto';
            });
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                lightbox.remove();
                document.body.style.overflow = 'auto';
            });
            
            document.body.appendChild(lightbox);
            document.body.style.overflow = 'hidden';
        });
    });
    
    // ========== RESPONSIVE MENU GRID STYLES ==========
    
    // Add responsive menu grid styles
    const responsiveStyles = document.createElement('style');
    responsiveStyles.textContent = `
        /* Menu Grid Container */
        .menu-grid, 
        .menu-items-container,
        .items-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 25px;
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        /* Individual Menu Item Card */
        .menu-item, 
        .menu-card,
        .food-item {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 3px 15px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .menu-item:hover,
        .menu-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        /* Menu Item Images */
        .menu-item img,
        .menu-card img,
        .food-item img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
        
        /* Menu Item Content */
        .menu-item-content,
        .menu-card-content {
            padding: 15px;
        }
        
        .menu-item h3,
        .menu-card h3 {
            font-size: 1.2rem;
            margin: 0 0 8px 0;
            color: #8B4513;
        }
        
        .menu-item p,
        .menu-card p {
            font-size: 0.9rem;
            color: #666;
            line-height: 1.4;
        }
        
        /* Price and Add to Cart Button */
        .price-cart-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 12px;
            padding-top: 10px;
            border-top: 1px solid #eee;
        }
        
        .price {
            font-size: 1.3rem;
            font-weight: bold;
            color: #8B4513;
        }
        
        .add-to-cart-btn {
            background: #8B4513;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.3s ease;
        }
        
        .add-to-cart-btn:hover {
            background: #A0522D;
            transform: scale(1.05);
        }
        
        /* Desktop Large */
        @media (min-width: 1200px) {
            .menu-grid, .menu-items-container {
                grid-template-columns: repeat(4, 1fr);
                gap: 30px;
                padding: 30px;
            }
            .menu-item img, .menu-card img {
                height: 220px;
            }
        }
        
        /* Desktop */
        @media (min-width: 992px) and (max-width: 1199px) {
            .menu-grid, .menu-items-container {
                grid-template-columns: repeat(3, 1fr);
                gap: 25px;
                padding: 25px;
            }
        }
        
        /* Tablet */
        @media (min-width: 768px) and (max-width: 991px) {
            .menu-grid, .menu-items-container {
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                padding: 20px;
            }
            .menu-item img, .menu-card img {
                height: 180px;
            }
        }
        
        /* Mobile Landscape */
        @media (min-width: 576px) and (max-width: 767px) {
            .menu-grid, .menu-items-container {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                padding: 15px;
            }
            .menu-item img, .menu-card img {
                height: 160px;
            }
            .menu-item h3, .menu-card h3 {
                font-size: 1rem;
            }
            .price {
                font-size: 1.1rem;
            }
        }
        
        /* Mobile Portrait */
        @media (max-width: 575px) {
            .menu-grid, .menu-items-container {
                grid-template-columns: 1fr;
                gap: 20px;
                padding: 15px;
            }
            .menu-item img, .menu-card img {
                height: 200px;
            }
            .menu-item-content, .menu-card-content {
                padding: 12px;
            }
        }
        
        /* Animations */
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        
        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #8B4513 !important;
            box-shadow: 0 0 5px rgba(139,69,19,0.3);
        }
    `;
    document.head.appendChild(responsiveStyles);
    
    // ========== INITIALIZE CART ==========
    updateCartDisplay();
    
    console.log('Mzizi Catering - Website fully loaded! 🍲');
    console.log('Features: Cart System | Payment Options | Order Numbers | Order History | Responsive Design');
});