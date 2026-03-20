const BASE_URL = 'http://localhost:8080/api';

const handleResponse = async (res) => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
};

// Products
export const productsAPI = {
    getAll: () => fetch(`${BASE_URL}/products`).then(handleResponse),
    getById: (id) => fetch(`${BASE_URL}/products/${id}`).then(handleResponse),
    search: (keyword) => fetch(`${BASE_URL}/products/search?keyword=${keyword}`).then(handleResponse),
};

// Cart
export const cartAPI = {
    getCart: () => fetch(`${BASE_URL}/cart`).then(handleResponse),
    addItem: (productId, quantity = 1) =>
        fetch(`${BASE_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity })
        }).then(handleResponse),
    updateItem: (productId, quantity) =>
        fetch(`${BASE_URL}/cart/${productId}?quantity=${quantity}`, {
            method: 'PUT'
        }).then(handleResponse),
    removeItem: (productId) =>
        fetch(`${BASE_URL}/cart/${productId}`, { method: 'DELETE' }).then(handleResponse),
    clearCart: () =>
        fetch(`${BASE_URL}/cart/clear`, { method: 'DELETE' }).then(handleResponse),
};

// Wishlist
export const wishlistAPI = {
    getWishlist: (userId) =>
        fetch(`${BASE_URL}/wishlist/${userId}`).then(handleResponse),
    addItem: (userId, productId) =>
        fetch(`${BASE_URL}/wishlist/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, productId })
        }).then(handleResponse),
    removeItem: (userId, productId) =>
        fetch(`${BASE_URL}/wishlist/remove?userId=${userId}&productId=${productId}`, {
            method: 'DELETE'
        }).then(handleResponse),
    checkItem: (userId, productId) =>
        fetch(`${BASE_URL}/wishlist/check?userId=${userId}&productId=${productId}`).then(handleResponse),
};

// Orders
export const ordersAPI = {
    placeOrder: (orderData) =>
        fetch(`${BASE_URL}/orders/place`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        }).then(handleResponse),
    getUserOrders: (userId) =>
        fetch(`${BASE_URL}/orders/user/${userId}`).then(handleResponse),
};

// Reviews
export const reviewsAPI = {
    getReviews: (productId) =>
        fetch(`${BASE_URL}/reviews/product/${productId}`).then(handleResponse),
    addReview: (reviewData) =>
        fetch(`${BASE_URL}/reviews/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        }).then(handleResponse),
};

// Coupons
export const couponsAPI = {
    validate: (code, orderAmount) =>
        fetch(`${BASE_URL}/coupons/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, orderAmount })
        }).then(handleResponse),
};

// Notifications
export const notificationsAPI = {
    getAll: (userId) =>
        fetch(`${BASE_URL}/notifications/${userId}`).then(handleResponse),
    markAllRead: (userId) =>
        fetch(`${BASE_URL}/notifications/${userId}/read-all`, { method: 'PUT' }).then(handleResponse),
    add: (userId, message, type, icon) =>
        fetch(`${BASE_URL}/notifications/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, message, type, icon })
        }).then(handleResponse),
};

// Addresses
export const addressAPI = {
    getAddresses: (userId) =>
        fetch(`${BASE_URL}/addresses/user/${userId}`).then(handleResponse),
    addAddress: (addressData) =>
        fetch(`${BASE_URL}/addresses/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addressData)
        }).then(handleResponse),
    deleteAddress: (id) =>
        fetch(`${BASE_URL}/addresses/${id}`, { method: 'DELETE' }).then(handleResponse),
    setDefault: (id) =>
        fetch(`${BASE_URL}/addresses/${id}/default`, { method: 'PUT' }).then(handleResponse),
};

// Auth
export const authAPI = {
    login: (email, password) =>
        fetch(`${BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        }).then(handleResponse),
    register: (userData) =>
        fetch(`${BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        }).then(handleResponse),
};

// Legacy support
export const api = {
    getProducts: () => productsAPI.getAll(),
    addToCart: (productId, quantity) => cartAPI.addItem(productId, quantity),
};

export default api;