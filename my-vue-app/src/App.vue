<template>
  <div id="app">
    <NavbarComponent />

    <div class="auth-wrapper">
      <div class="auth-inner">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
  import NavbarComponent from './components/views/Nav.vue';

  export default {
    name: 'App',
    components: {
      NavbarComponent,
    }
  };
</script>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap");

  .auth-wrapper {
    min-height: calc(100vh - 80px);
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding-top: 80px;
  }

  .auth-inner {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 0;
  }

  .navbar-light {
    background-color: var(--bg-primary) !important;
    box-shadow: var(--shadow-md) !important;
  }

  .error-message {
    color: var(--danger-color);
    font-size: 0.875rem;
    font-weight: 500;
    margin-top: 0.5rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .auth-wrapper {
      padding-top: 70px;
    }
    
    .auth-inner {
      padding: 1rem;
    }
  }

  @media (max-width: 480px) {
    .auth-wrapper {
      padding-top: 60px;
    }
    
    .auth-inner {
      padding: 0.75rem;
    }
  }
</style>
