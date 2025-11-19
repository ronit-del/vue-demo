<template>
  <div id="app">
    <router-view v-if="!isAuthenticated" />
    <div v-else class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <div class="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <span v-if="!sidebarCollapsed" class="logo-text">Admin Panel</span>
          </div>
          <button @click="toggleSidebar" class="sidebar-toggle" aria-label="Toggle sidebar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L10 10L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M10 5L5 10L10 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </div>
        <nav class="sidebar-nav">
          <router-link v-for="item in menuItems" :key="item.path" :to="item.path" class="nav-item"
            :class="{ active: $route.path === item.path }">
            <span class="nav-icon" v-html="item.icon"></span>
            <span v-if="!sidebarCollapsed" class="nav-text">
              {{ item.label }}
            </span>
          </router-link>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <header class="header">
          <div class="header-left">
            <h1 class="page-title">
              {{ currentPageTitle }}
            </h1>
            <p v-if="currentPageDescription" class="page-description">
              {{ currentPageDescription }}
            </p>
          </div>
          <div class="header-right">
            <div class="notification-wrapper">
              <button class="header-btn" aria-label="Notifications" ref="notificationButton" title="Notifications"
                @click="toggleNotifications">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10 2C8.34 2 7 3.34 7 5V7C5.06 7.06 3.5 8.62 3.5 10.56V14.5C3.5 14.78 3.28 15 3 15H2C1.72 15 1.5 15.22 1.5 15.5C1.5 15.78 1.72 16 2 16H18C18.28 16 18.5 15.78 18.5 15.5C18.5 15.22 18.28 15 18 15H17C16.72 15 16.5 14.78 16.5 14.5V10.56C16.5 8.62 14.94 7.06 13 7V5C13 3.34 11.66 2 10 2Z"
                    fill="currentColor" />
                  <path d="M8 17C8 17.55 8.45 18 9 18H11C11.55 18 12 17.55 12 17H8Z" fill="currentColor" />
                </svg>
                <span v-if="notificationCount > 0" class="notification-badge">
                  {{ notificationCount > 99 ? "99+" : notificationCount }}
                </span>
              </button>
              <div v-if="showNotificationDropdown" class="notification-dropdown">
                <div class="notification-header">
                  <h3>Notifications</h3>
                  <button v-if="unreadNotifications.length > 0" @click="markAllAsRead" class="mark-all-read-btn">
                    Mark all as read
                  </button>
                </div>
                <div class="notification-list">
                  <div v-if="notifications.length === 0" class="notification-empty">
                    <p>No notifications</p>
                  </div>
                  <div v-for="notification in notifications" :key="notification.id" class="notification-item"
                    :class="{ unread: !notification.is_read }" @click="handleNotificationClick(notification)">
                    <div class="notification-content">
                      <p class="notification-message">
                        {{ notification.message }}
                      </p>
                      <span class="notification-time">
                        {{ formatTime(notification.created_at) }}
                      </span>
                    </div>
                    <div v-if="!notification.is_read" class="notification-dot"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="user-menu">
              <div class="user-info">
                <span class="user-name">{{ user?.name || "Admin" }}</span>
              </div>
              <button @click="handleLogout" class="logout-btn" title="Logout">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M13 3H16C16.5304 3 17.0391 3.21071 17.4142 3.58579C17.7893 3.96086 18 4.46957 18 5V15C18 15.5304 17.7893 16.0391 17.4142 16.4142C17.0391 16.7893 16.5304 17 16 17H13M10 14L13 11M13 11L10 8M13 11H3"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <!-- Content Area -->
        <main class="content">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      sidebarCollapsed: false,
      showNotificationDropdown: false,
      notificationPollInterval: null,
      menuItems: [
        {
          path: "/",
          label: "Dashboard",
          icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 10L10 3L17 10M10 3V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        },
        {
          path: "/orders",
          label: "Orders",
          icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3H17L16 11H4L3 3ZM3 3L2 1M5 15H7M17 15H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 19C9.55228 19 10 18.5523 10 18C10 17.4477 9.55228 17 9 17C8.44772 17 8 17.4477 8 18C8 18.5523 8.44772 19 9 19Z" stroke="currentColor" stroke-width="2"/><path d="M15 19C15.5523 19 16 18.5523 16 18C16 17.4477 15.5523 17 15 17C14.4477 17 14 17.4477 14 18C14 18.5523 14.4477 19 15 19Z" stroke="currentColor" stroke-width="2"/></svg>',
        },
        {
          path: "/customers",
          label: "Customers",
          icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 19V17C17 15.9391 16.5786 14.9217 15.8284 14.1716C15.0783 13.4214 14.0609 13 13 13H7C5.93913 13 4.92172 13.4214 4.17157 14.1716C3.42143 14.9217 3 15.9391 3 17V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 9C12.2091 9 14 7.20914 14 5C14 2.79086 12.2091 1 10 1C7.79086 1 6 2.79086 6 5C6 7.20914 7.79086 9 10 9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        },
        {
          path: "/prices",
          label: "Prices",
          icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2V18M10 2C8.89543 2 8 2.89543 8 4C8 5.10457 8.89543 6 10 6M10 2C11.1046 2 12 2.89543 12 4C12 5.10457 11.1046 6 10 6M10 14C8.89543 14 8 14.8954 8 16C8 17.1046 8.89543 18 10 18M10 14C11.1046 14 12 14.8954 12 16C12 17.1046 11.1046 18 10 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        },
      ],
    };
  },

  computed: {
    isAuthenticated() {
      return this.$store.state.auth.isAuthenticated;
    },

    currentPageTitle() {
      const route = this.$route;

      if (route.name === 'OrderEdit') {
        return 'Edit Order';
      }
      if (route.name === 'OrderDetails') {
        return 'Order Details';
      }
      if (route.name === 'CustomerEdit') {
        return 'Edit Customer';
      }
      
      const menuItem = this.menuItems.find((item) => item.path === route.path);
      return menuItem ? menuItem.label : "Dashboard";
    },

    currentPageDescription() {
      const route = this.$route;
      
      if (route.name === 'OrderEdit') {
        const order = this.currentOrder;
        if (order) {
          if (order.order_number) {
            return `Order: ${order.order_number}`;
          }
          if (order.id) {
            return `Order: ${order.id}`;
          }
        }
        return 'Order: Loading...';
      }
      if (route.name === 'OrderDetails') {
        return 'View complete order information';
      }
      if (route.name === 'CustomerEdit') {
        const customer = this.currentCustomer;
        if (customer && customer.name) {
          return `Customer: ${customer.name}`;
        }
        return 'Customer: Loading...';
      }
      
      const routePath = route.path;
      if (routePath === '/') {
        return 'Overview of your business metrics and recent activity';
      }
      if (routePath === '/orders' || routePath.startsWith('/orders/')) {
        return 'Manage and track all orders';
      }
      if (routePath === '/customers' || routePath.startsWith('/customers/')) {
        return 'Manage your customer database';
      }
      if (routePath === '/prices') {
        return 'Manage product pricing and inventory';
      }
      
      return null;
    },

    currentOrder() {
      const route = this.$route;
      if (route.name === 'OrderEdit' || route.name === 'OrderDetails') {
        const orderId = route.params.id;
        if (orderId) {
          return this.$store.state.orders.find(order => 
            order.id === parseInt(orderId) || order.id === orderId
          );
        }
      }
      return null;
    },

    currentCustomer() {
      const route = this.$route;
      if (route.name === 'CustomerEdit') {
        const customerId = route.params.id;
        if (customerId) {
          return this.$store.state.customers.find(customer => 
            customer.id === parseInt(customerId) || customer.id === customerId
          );
        }
      }
      return null;
    },

    user() {
      return this.$store.state.auth.user;
    },

    notifications() {
      return this.$store.state.notifications || [];
    },

    notificationCount() {
      return this.$store.state.notificationCount || 0;
    },

    unreadNotifications() {
      return this.notifications.filter((n) => !n.is_read);
    },
  },

  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    handleLogout() {
      if (this.notificationPollInterval) {
        clearInterval(this.notificationPollInterval);
      }
      this.$store.dispatch("logout");
      this.$router.push("/login");
    },

    toggleNotifications() {
      this.showNotificationDropdown = !this.showNotificationDropdown;
      if (this.showNotificationDropdown) {
        this.$store.dispatch("fetchNotifications");
        this.$store.dispatch("fetchNotificationCount");
      }
    },

    async handleNotificationClick(notification) {
      if (!notification.is_read) {
        await this.$store.dispatch("markNotificationRead", notification.id);
      }
      this.showNotificationDropdown = false;
      if (notification.order_id) {
        this.$router.push(`/orders/${notification.order_id}`);
      } else {
        this.$router.push("/orders");
      }
    },

    async markAllAsRead() {
      await this.$store.dispatch("markAllNotificationsRead");
    },

    formatTime(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    },

    startNotificationPolling() {
      // Poll every 5 seconds for new notifications to get real-time updates
      this.notificationPollInterval = setInterval(() => {
        if (this.isAuthenticated) {
          // Fetch both count and notifications to keep everything in sync
          this.$store.dispatch("fetchNotificationCount");
          // Only fetch full notifications if dropdown is open to avoid unnecessary requests
          if (this.showNotificationDropdown) {
            this.$store.dispatch("fetchNotifications");
          }
        }
      }, 5000); // Poll every 5 seconds instead of 30
    },
  },

  mounted() {
    if (this.isAuthenticated) {
      this.$store.dispatch("fetchNotifications");
      this.$store.dispatch("fetchNotificationCount");
      this.startNotificationPolling();
    }
    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (
        this.$refs.notificationButton &&
        !this.$refs.notificationButton.contains(e.target) &&
        !e.target.closest(".notification-dropdown")
      ) {
        this.showNotificationDropdown = false;
      }
    });
  },

  beforeUnmount() {
    if (this.notificationPollInterval) {
      clearInterval(this.notificationPollInterval);
    }
  },

  watch: {
    isAuthenticated(newVal) {
      if (newVal) {
        this.$store.dispatch("fetchNotifications");
        this.$store.dispatch("fetchNotificationCount");
        this.startNotificationPolling();
      } else {
        if (this.notificationPollInterval) {
          clearInterval(this.notificationPollInterval);
        }
      }
    },
    '$route'(to, from) {
      // Fetch orders/customers when navigating to edit pages if not already loaded
      if (to.name === 'OrderEdit' || to.name === 'OrderDetails') {
        if (this.$store.state.orders.length === 0) {
          this.$store.dispatch('fetchOrders');
        }
      }
      if (to.name === 'CustomerEdit') {
        if (this.$store.state.customers.length === 0) {
          this.$store.dispatch('fetchCustomers');
        }
      }
    },
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #6366f1;
  --primary-dark: #4f46e5;
  --primary-light: #818cf8;
  --secondary-color: #8b5cf6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-tertiary: #94a3b8;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 80px;
}

.dflex {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-back {
  width: 200px;
  height: 40px;
  border: 1px solid var(--border-color);
  background: var(--primary-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--bg-primary);
  transition: all 0.2s ease;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  line-height: 1.6;
}

#app {
  min-height: 100vh;
}

.admin-layout {
  display: flex;
  min-height: 100vh;
}

/* Sidebar Styles */
.sidebar {
  width: var(--sidebar-width);
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: white;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  transition: width 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
}

.logo svg {
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .logo-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.sidebar-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sidebar.collapsed .sidebar-toggle svg {
  transform: rotate(180deg);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  margin: 0.25rem 0.5rem;
  border-radius: 8px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(99, 102, 241, 0.2);
  color: white;
}

.nav-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: var(--primary-color);
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.nav-icon svg {
  width: 20px;
  height: 20px;
}

.nav-text {
  white-space: nowrap;
  font-weight: 500;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .nav-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.sidebar.collapsed~.main-content {
  margin-left: var(--sidebar-collapsed-width);
}

/* Header */
.header {
  background: var(--bg-primary);
  padding: 1rem 2rem 1rem 1rem !important;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.page-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-btn {
  position: relative;
  background: var(--bg-secondary);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.header-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.notification-wrapper {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--danger-color);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-primary);
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  max-height: 500px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notification-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
}

.notification-header h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.mark-all-read-btn {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.mark-all-read-btn:hover {
  background: var(--bg-tertiary);
}

.notification-list {
  height: 250px;
  overflow-y: auto;
}

.notification-empty {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.notification-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;
}

.notification-item:hover {
  background: var(--bg-secondary);
}

.notification-item.unread {
  background: rgba(99, 102, 241, 0.05);
}

.notification-item.unread:hover {
  background: rgba(99, 102, 241, 0.1);
}

.notification-content {
  flex: 1;
}

.notification-message {
  font-size: 0.875rem;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  flex-shrink: 0;
  margin-left: 0.75rem;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .notification-dropdown {
    width: 320px;
    right: -20px;
  }
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.logout-btn {
  background: var(--bg-secondary);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: var(--bg-tertiary);
  color: var(--danger-color);
}

/* Content Area */
.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .content {
    padding: 1rem;
  }

  .header {
    padding: 1rem 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
