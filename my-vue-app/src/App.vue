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
  @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300..900&display=swap");

  * {
    box-sizing: border-box;
  }

  body {
    background: #f1f1f1;
    min-height: 100vh;
    font-family: 'Montserrat', sans-serif;
  }

  .auth-wrapper {
    min-height: 100vh;
    background: #b5d3e5;
  }

  .auth-inner {
    width: auto !important;
    border-radius: 12px;
    /* box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); */
    padding: 20px;
  }

  .navbar-light {
    background-color: #bfd7eb !important;
    box-shadow: 0px 14px 80px rgb(0 0 0 / 50%) !important;
  }

  .error-message {
    color: red;
    font-size: 12px;
    font-weight: 500;
  }
</style>