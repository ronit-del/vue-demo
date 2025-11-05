<template>
    <nav class="navbar navbar-expand-lg navbar-light fixed-top">
        <div class="container">
            <router-link to="/" class="navbar-brand">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3H21L20 11H4L3 3ZM3 3L2 1M5 15H7M17 15H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 19C9.55228 19 10 18.5523 10 18C10 17.4477 9.55228 17 9 17C8.44772 17 8 17.4477 8 18C8 18.5523 8.44772 19 9 19Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M15 19C15.5523 19 16 18.5523 16 18C16 17.4477 15.5523 17 15 17C14.4477 17 14 17.4477 14 18C14 18.5523 14.4477 19 15 19Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span>SmartShop</span>
            </router-link>
            <button class="navbar-toggler" type="button" @click="toggleMobileMenu" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" :class="{ show: mobileMenuOpen }" id="navbarNav">
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item" v-if="!this.user">
                        <router-link to="/login" class="nav-link">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 2V18M10 2L6 6M10 2L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Login
                        </router-link>
                    </li>
                    <li class="nav-item" v-if="!this.user">
                        <router-link to="/register" class="nav-link">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 19V17C17 15.9391 16.5786 14.9217 15.8284 14.1716C15.0783 13.4214 14.0609 13 13 13H7C5.93913 13 4.92172 13.4214 4.17157 14.1716C3.42143 14.9217 3 15.9391 3 17V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10 9C12.2091 9 14 7.20914 14 5C14 2.79086 12.2091 1 10 1C7.79086 1 6 2.79086 6 5C6 7.20914 7.79086 9 10 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Register
                        </router-link>
                    </li>
                    <li class="nav-item" v-if="this.user">
                        <router-link to="/checkout" class="nav-link">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 3H17L16 11H4L3 3ZM3 3L2 1M5 15H7M17 15H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Cart
                        </router-link>
                    </li>
                    <li class="nav-item" v-if="this.user">
                        <router-link to="/profile" class="user-menu" active-class="active">
                            <div class="user-avatar">
                                {{ getUserInitials() }}
                            </div>
                            <span class="user-name">{{ user.name || ''}}</span>
                        </router-link>
                    </li>
                    <li class="nav-item" v-if="this.user">
                        <a @click="logout" class="nav-link logout-link">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 18V2M10 2L14 6M10 2L6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Logout
                        </a>
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
            mobileMenuOpen: false,
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

        toggleMobileMenu() {
            this.mobileMenuOpen = !this.mobileMenuOpen;
        },

        getUserInitials() {
            if (!this.user?.name) return 'U';
            return this.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
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
    background-color: var(--bg-primary);
    box-shadow: var(--shadow-md);
    padding: 1rem 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    transition: all 0.3s ease;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.navbar-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    text-decoration: none;
    transition: color 0.3s ease;
}

.navbar-brand:hover {
    color: var(--primary-color);
}

.navbar-brand svg {
    color: var(--primary-color);
}

.navbar-toggler {
    display: none;
    background: none;
    border: 2px solid var(--border-color);
    border-radius: 6px;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--text-primary);
}

.navbar-toggler-icon {
    display: block;
    width: 24px;
    height: 2px;
    background: currentColor;
    position: relative;
}

.navbar-toggler-icon::before,
.navbar-toggler-icon::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    background: currentColor;
    left: 0;
}

.navbar-toggler-icon::before {
    top: -8px;
}

.navbar-toggler-icon::after {
    top: 8px;
}

.navbar-nav {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
}

.nav-item {
    display: flex;
    align-items: center;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-primary);
    font-weight: 500;
    padding: 0.75rem 1.25rem;
    font-size: 0.875rem;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
}

.nav-link:hover {
    color: var(--primary-color);
    background: var(--bg-secondary);
}

.nav-link.router-link-active {
    color: var(--primary-color);
    background: rgba(99, 102, 241, 0.1);
}

.logout-link {
    color: var(--danger-color);
}

.logout-link:hover {
    color: white;
    background: var(--danger-color);
}

.user-menu {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    margin: 0 0.5rem;
    text-decoration: none;
    transition: all 0.3s ease;
    cursor: pointer;
}

.user-menu:hover {
    background: var(--bg-tertiary);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.user-menu.active {
    background: rgba(99, 102, 241, 0.1);
    border: 2px solid var(--primary-color);
}

.user-menu.active .user-avatar {
    box-shadow: 0 0 0 2px var(--primary-color);
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    flex-shrink: 0;
}

.user-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.875rem;
}

@media (max-width: 768px) {
    .navbar-toggler {
        display: block;
    }

    .navbar-collapse {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg-primary);
        box-shadow: var(--shadow-lg);
        padding: 1rem;
        border-top: 1px solid var(--border-color);
    }

    .navbar-collapse.show {
        display: block;
    }

    .navbar-nav {
        flex-direction: column;
        align-items: stretch;
        gap: 0;
    }

    .nav-item {
        width: 100%;
    }

    .nav-link {
        width: 100%;
        padding: 1rem;
        justify-content: flex-start;
    }

    .user-menu {
        margin: 0.5rem 0;
        width: 100%;
        justify-content: flex-start;
    }

    .container {
        padding: 0 1rem;
    }
}
</style>
