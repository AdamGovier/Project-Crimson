<template>
  <v-navigation-drawer app permanent class="pa-6">
    <h1>Example Invoices App</h1>
    <v-list dense class="mt-3">
      <v-list-item link :to="{ name: 'Invoices' }">
        <v-list-item-content>
          <v-list-item-title>Invoices</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link :to="{ name: 'Customers' }">
        <v-list-item-content>
          <v-list-item-title>Customers</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link :to="{ name: 'Page3' }">
        <v-list-item-content>
          <v-list-item-title>Page 3</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>

</script>