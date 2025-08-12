export const environment = {
    production: false,
    apiUrl: 'your api url',
    endpoints: {
        register: '/register',
        login: '/login',
        logout: '/logout',
        productsSearch: '/products/search',
        productsIndex: '/products',
        productsCategories: '/products/categories',
        productsDecrementStock: '/products/decrement-stock',
        favoritesIndex: '/favorites',
        favoritesAdd: '/favorites',
        favoritesRemove: '/favorites',
        cartIndex: '/cart',
        cartAdd: '/cart',
        cartRemove: '/cart',
        cartUpdate: '/cart',
        cartCheckout: '/cart/checkout',
        ordersIndex: '/orders',
        bossendpoints: {
            allfeeds: '/allfeeds',
            createfeed: '/createfeed',
            updatefeed: '/updatefeed',
            deletefeed: '/deletefeed'
        }
    }
};
