<template>
  <div class="dashboard">
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3H21L20 11H4L3 3ZM3 3L2 1M5 15H7M17 15H13" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
            <path
              d="M9 19C9.55228 19 10 18.5523 10 18C10 17.4477 9.55228 17 9 17C8.44772 17 8 17.4477 8 18C8 18.5523 8.44772 19 9 19Z"
              stroke="currentColor" stroke-width="2" />
            <path
              d="M15 19C15.5523 19 16 18.5523 16 18C16 17.4477 15.5523 17 15 17C14.4477 17 14 17.4477 14 18C14 18.5523 14.4477 19 15 19Z"
              stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Total Orders</p>
          <h3 class="stat-value">{{ stats.totalOrders }}</h3>
          <p class="stat-change" :class="getChangeClass(stats.changes?.totalOrdersChange)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" v-if="(stats.changes?.totalOrdersChange || 0) >= 0" />
              <path d="M8 4V12M8 12L4 8M8 12L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" v-else />
            </svg>
            {{ formatPercentage(stats.changes?.totalOrdersChange) }}%
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17 19V17C17 15.9391 16.5786 14.9217 15.8284 14.1716C15.0783 13.4214 14.0609 13 13 13H7C5.93913 13 4.92172 13.4214 4.17157 14.1716C3.42143 14.9217 3 15.9391 3 17V19"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path
              d="M10 9C12.2091 9 14 7.20914 14 5C14 2.79086 12.2091 1 10 1C7.79086 1 6 2.79086 6 5C6 7.20914 7.79086 9 10 9Z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Total Customers</p>
          <h3 class="stat-value">{{ stats.totalCustomers }}</h3>
          <p class="stat-change" :class="getChangeClass(stats.changes?.totalCustomersChange)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" v-if="(stats.changes?.totalCustomersChange || 0) >= 0" />
              <path d="M8 4V12M8 12L4 8M8 12L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" v-else />
            </svg>
            {{ formatPercentage(stats.changes?.totalCustomersChange) }}%
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2V22M12 2C10.8954 2 10 2.89543 10 4C10 5.10457 10.8954 6 12 6M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6M12 14C10.8954 14 10 14.8954 10 16C10 17.1046 10.8954 18 12 18M12 14C13.1046 14 14 14.8954 14 16C14 17.1046 13.1046 18 12 18"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">Revenue</p>
          <h3 class="stat-value">${{ formatCurrency(stats.revenue) }}</h3>
          <p class="stat-change" :class="getChangeClass(stats.changes?.revenueChange)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" v-if="(stats.changes?.revenueChange || 0) >= 0" />
              <path d="M8 4V12M8 12L4 8M8 12L12 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" v-else />
            </svg>
            {{ formatPercentage(stats.changes?.revenueChange) }}%
          </p>
        </div>
      </div>

    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="charts-header">
        <h2 class="section-title">Analytics</h2>
        <div class="chart-controls">
          <select v-model="chartType" @change="onChartTypeChange" class="chart-select">
            <option value="day">Daily</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          <select v-model="chartPeriod" @change="fetchChartData" class="chart-select">
            <option v-for="option in periodOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
      <div class="charts-grid">
        <div class="dashboard-card chart-card">
          <div class="card-header">
            <h2 class="card-title">Orders</h2>
          </div>
          <div class="card-content">
            <div v-if="chartLoading" class="chart-loading">
              <div class="spinner"></div>
              <p>Loading chart data...</p>
            </div>
            <div v-else class="chart-container">
              <LineChart :data="ordersChartData" :options="chartOptions" />
            </div>
          </div>
        </div>
        <div class="dashboard-card chart-card">
          <div class="card-header">
            <h2 class="card-title">Customers</h2>
          </div>
          <div class="card-content">
            <div v-if="chartLoading" class="chart-loading">
              <div class="spinner"></div>
              <p>Loading chart data...</p>
            </div>
            <div v-else class="chart-container">
              <LineChart :data="customersChartData" :options="chartOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="dashboard-grid">
      <div class="dashboard-card">
        <div class="card-header">
          <h2 class="card-title">Recent Orders</h2>
          <router-link to="/orders" class="card-link">View All</router-link>
        </div>
        <div class="card-content">
          <div v-if="recentOrders.length === 0" class="empty-state">
            <p>No recent orders</p>
          </div>
          <div v-else class="recent-list">
            <div v-for="order in recentOrders" :key="order.id" class="recent-item">
              <div class="recent-item-info">
                <p class="recent-item-title">{{ order.order_number }}</p>
                <p class="recent-item-subtitle">{{ order.customer }}</p>
              </div>
              <div class="recent-item-meta">
                <span class="status-badge" :class="getStatusClass(order.status)">{{ order.status }}</span>
                <span class="recent-item-amount">${{ formatCurrency(order.total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header">
          <h2 class="card-title">Recent Products</h2>
          <router-link to="/prices" class="card-link">View All</router-link>
        </div>
        <div class="card-content">
          <div v-if="recentProducts.length === 0" class="empty-state">
            <p>No products available</p>
          </div>
          <div v-else class="recent-list">
            <div v-for="product in recentProducts" :key="product.id" class="recent-item product-item">
              <div class="product-image-container">
                <img v-if="product.image" :src="product.image" :alt="product.name" class="product-image" />
                <div v-else class="product-image-placeholder">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <div class="recent-item-info">
                <p class="recent-item-title">{{ product.name }}</p>
                <p class="recent-item-subtitle">{{ getCategory(product) }} • Stock: {{ product.stock_quantity || 0 }}</p>
              </div>
              <div class="recent-item-meta">
                <span class="recent-item-amount">${{ formatCurrency(product.price || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Line as LineChart } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { getChartData } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default {
  name: 'DashboardComponent',
  components: {
    LineChart
  },
  data() {
    return {
      loading: false,
      chartLoading: false,
      chartType: 'day',
      chartPeriod: '30',
      chartData: {
        orders: [],
        customers: []
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        elements: {
          line: {
            tension: 0.4,
            borderWidth: 3
          },
          point: {
            radius: 4,
            hoverRadius: 6
          }
        }
      }
    }
  },

  computed: {
    stats() {
      return this.$store.state.dashboardStats;
    },

    recentOrders() {
      return this.$store.state.orders.slice(0, 5);
    },

    recentProducts() {
      return this.$store.state.products.slice(0, 5);
    },

    ordersChartData() {
      return {
        labels: this.chartData.orders.map(item => item.period),
        datasets: [{
          label: 'Orders',
          data: this.chartData.orders.map(item => item.count),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true
        }]
      };
    },

    customersChartData() {
      return {
        labels: this.chartData.customers.map(item => item.period),
        datasets: [{
          label: 'Customers',
          data: this.chartData.customers.map(item => item.count),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true
        }]
      };
    },

    periodOptions() {
      if (this.chartType === 'day') {
        return [
          { value: '7', label: 'Last 7 days' },
          { value: '30', label: 'Last 30 days' },
          { value: '90', label: 'Last 90 days' }
        ];
      } else if (this.chartType === 'month') {
        return [
          { value: '3', label: 'Last 3 months' },
          { value: '6', label: 'Last 6 months' },
          { value: '12', label: 'Last 12 months' }
        ];
      } else if (this.chartType === 'year') {
        return [
          { value: '2', label: 'Last 2 years' },
          { value: '5', label: 'Last 5 years' },
          { value: '10', label: 'Last 10 years' }
        ];
      }
      return [];
    }
  },

  methods: {
    getCategory(product) {
      // Use stored category if available, otherwise infer from image path
      if (product.category) {
        const categoryMap = {
          'electronics': 'Electronics',
          'clothes': 'Clothing',
          'home_appliances': 'Home Appliances',
          'beauty': 'Beauty'
        };
        return categoryMap[product.category] || product.category;
      }
      
      // Fallback: Extract category from image path
      if (product.image) {
        if (product.image.includes('electronics')) return 'Electronics';
        if (product.image.includes('clothes')) return 'Clothing';
        if (product.image.includes('home_appliances') || product.image.includes('home appliance')) return 'Home Appliances';
        if (product.image.includes('beuty') || product.image.includes('beauty')) return 'Beauty';
      }
      return 'General';
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('en-US').format(value);
    },

    formatPercentage(value) {
      const num = value || 0;
      const sign = num >= 0 ? '+' : '';
      return `${sign}${num.toFixed(1)}`;
    },

    getChangeClass(change) {
      const num = change || 0;
      return num >= 0 ? 'stat-change-positive' : 'stat-change-negative';
    },

    getStatusClass(status) {
      const statusMap = {
        'Pending': 'status-pending',
        'Processing': 'status-processing',
        'Shipped': 'status-shipped',
        'Delivered': 'status-delivered',
        'Cancelled': 'status-cancelled'
      };
      return statusMap[status] || 'status-default';
    },

    async fetchChartData() {
      this.chartLoading = true;
      try {
        const response = await getChartData(this.chartType, this.chartPeriod);
        if (response.success && response.data) {
          this.chartData = {
            orders: response.data.orders || [],
            customers: response.data.customers || []
          };
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
        this.chartData = {
          orders: [],
          customers: []
        };
      } finally {
        this.chartLoading = false;
      }
    },

    onChartTypeChange() {
      // Reset period to default when type changes
      if (this.chartType === 'day') {
        this.chartPeriod = '30';
      } else if (this.chartType === 'month') {
        this.chartPeriod = '12';
      } else if (this.chartType === 'year') {
        this.chartPeriod = '5';
      }
      this.fetchChartData();
    }
  },

  async created() {
    this.loading = true;
    await Promise.all([
      this.$store.dispatch('fetchOrders'),
      this.$store.dispatch('fetchDashboardStats'),
      this.$store.dispatch('fetchProducts'),
      this.fetchChartData()
    ]);
    this.loading = false;
  }
};
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.stat-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-primary {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.stat-icon-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.stat-icon-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.stat-icon-danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.stat-change-positive {
  color: var(--success-color);
}

.stat-change-negative {
  color: var(--danger-color);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.dashboard-card {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.card-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: color 0.2s ease;
}

.card-link:hover {
  color: var(--primary-dark);
}

.card-content {
  padding: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.recent-item:hover {
  background: var(--bg-tertiary);
}

.recent-item-info {
  flex: 1;
}

.recent-item-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.recent-item-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.recent-item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.recent-item-amount {
  font-weight: 700;
  color: var(--text-primary);
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning-color);
}

.status-processing {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.status-shipped {
  background: rgba(59, 130, 246, 0.1);
  color: var(--info-color);
}

.status-delivered {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success-color);
}

.status-cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
}

.status-default {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.action-btn-primary {
  background: var(--primary-color);
  color: white;
}

.action-btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.action-btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.action-btn-secondary:hover {
  background: var(--bg-tertiary);
}

.action-btn-tertiary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.action-btn-tertiary:hover {
  background: var(--bg-tertiary);
}

.product-item {
  gap: 1rem;
}

.product-image-container {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.charts-section {
  margin-bottom: 2rem;
}

.charts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.chart-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chart-select:hover {
  border-color: var(--primary-color);
}

.chart-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
}

.chart-card {
  min-height: 400px;
}

.chart-container {
  height: 350px;
  position: relative;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 350px;
  color: var(--text-secondary);
  gap: 1rem;
}

.chart-loading .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .card-header,
  .card-content {
    padding: 1.25rem;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .charts-header {
    flex-direction: column;
    align-items: stretch;
  }

  .chart-controls {
    width: 100%;
  }

  .chart-select {
    flex: 1;
    min-width: 120px;
  }

  .chart-container {
    height: 300px;
  }

  .chart-loading {
    height: 300px;
  }
}
</style>
