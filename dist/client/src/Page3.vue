<template>
  <div class="d-flex justify-end">
    <v-btn color="primary" @click="() => isCreateFormVisible = !isCreateFormVisible">{{ isCreateFormVisible ? 'Hide' : 'Create' }}</v-btn>
  </div>

  <!-- Create Form -->
  <div v-show="isCreateFormVisible" class="mb-6">
    <CrimsonForm :entity-model="Inventory" title="Create Invoice" @create="refreshTableMethod">
      <template #model="{item}">
        <v-text-field
          v-model="item.serialNumber"
          label="Serial Number"
          dense
          required
        ></v-text-field>

        <v-text-field
          v-model="item.name"
          label="Name"
          dense
          required
        ></v-text-field>

        <v-text-field
          v-model="item.description"
          label="Description"
          dense
          required
        ></v-text-field>
      </template>
    </CrimsonForm>
  </div>

    <!-- Data Table -->
    <CrimsonDataTable :entity-model="Inventory"
    :headers="[
      {
        key: 'serialNumber',
        title: 'Serial Number'
      },
      {
        key: 'name',
        title: 'Name'
      },
      {
        key: 'description',
        title: 'Description'
      }
    ]" @refresh-method-created="method => refreshTableMethod = method" 
    >
      
    <!-- :mock-up-function="mockItem" :rows-to-mock="50" :mocking-row-limit="5000" -->
    </CrimsonDataTable>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import Inventory from './models/Inventory';
  import CrimsonDataTable from '@crimson/components/DataTable/CrimsonDataTable.vue';
  import CrimsonForm from '@crimson/components/Form/CrimsonForm.vue';
  import {Faker} from "@faker-js/faker";

  const refreshTableMethod = ref<() => void>();

  const isCreateFormVisible = ref(false);
</script>