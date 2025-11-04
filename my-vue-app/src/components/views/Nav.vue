<template>
    <nav class="navbar navbar-expand-lg navbar-light fixed-top">
        <div class="container">
            <a class="navbar-brand" href="/">Home</a>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item" v-if="!this.user">
                        <a href="/login" class="nav-link">Login</a>
                    </li>
                    <li class="nav-item">
                        <a href="/register" class="nav-link">Register</a>
                    </li>
                    <li class="nav-item" v-if="this.user">
                        <a href="/checkout" class="nav-link">Checkout</a>
                    </li>
                    <li class="nav-item" v-if="this.user">
                        <a @click="logout" class="nav-link">Logout</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    name: 'NavbarComponent',
    data() {
        return {
            user: JSON.parse(localStorage.getItem('user')) || null,
        };
    },

    methods: {
        logout() {
            localStorage.removeItem('user');
            this.user = null;
            window.dispatchEvent(new Event('storage'));
            this.$router.push('/login');
        },

        syncUser() {
            this.user = JSON.parse(localStorage.getItem('user'));
        },
    },

    mounted() {
        this.syncUser();
        window.addEventListener('storage', this.syncUser);
    },

    beforeUnmount() {
        window.removeEventListener('storage', this.syncUser);
    },
}
</script>

<style scoped>
.navbar {
    background-color: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.navbar .navbar-brand {
    font-size: 24px;
    font-weight: 700;
    color: #444;
}

.navbar .navbar-nav .nav-item {
    cursor: pointer
}

.navbar .navbar-nav .nav-link {
    color: #444;
    font-weight: 500;
    padding: 8px 20px;
    font-size: 16px;
}

.navbar .navbar-nav .nav-link:hover {
    color: #167bff;
}

@media (max-width: 768px) {
    .navbar .navbar-nav .nav-link {
        padding: 8px 12px;
    }
}
</style>