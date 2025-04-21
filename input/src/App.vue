<template>
  <v-app>
    <Sidebar />

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>


  </v-app>
</template>

<script setup lang="ts">
import Sidebar from "./layout/Sidebar.vue";
</script>