<template>
  <div class="d-flex justify-end">
    <v-btn color="primary" @click="() => isCreateFormVisible = !isCreateFormVisible">{{ isCreateFormVisible ? 'Hide' : 'Create' }}</v-btn>
  </div>

  <!-- Create Form -->
  <div v-show="isCreateFormVisible" class="mb-6">
    <CrimsonForm :entity-model="Invoice" title="Create Invoice" @create="refreshTableMethod">
      <template #model="{item}">
        <v-row>
          <v-col>
            <label>Invoiced on Date</label>
            <v-date-picker
              v-model="item.invoicedOnDate"
              dense
              required
            ></v-date-picker>
          </v-col>

          <v-col>
            <label>Due Date</label>
            <v-date-picker
              v-model="item.dueDate"
              dense
              required
            ></v-date-picker>
          </v-col>
        </v-row>


        <v-text-field
          v-model="item.totalAmount"
          type="number"
          label="Total Amount"
          dense
          required
        ></v-text-field>

        <v-text-field
          v-model="item.comments"
          label="Comment"
          dense
          required
        ></v-text-field>
      </template>
    </CrimsonForm>
  </div>

  <!-- Data Table -->
  <CrimsonDataTable :entity-model="Invoice"
  :where="
    {
      isPaid: true
    }
  "
  
  :headers="[
    {
      key: 'invoicedOnDate',
      title: 'Invoiced on Date'
    },
    {
      key: 'dueDate',
      title: 'Due Date'
    },
    {
      key: 'totalAmount',
      title: 'Total Amount'
    },
    {
      key: 'comments',
      title: 'Comment'
    }
  ]" @refresh-method-created="method => refreshTableMethod = method" 
  >
    
  <!-- :mock-up-function="mockItem" :rows-to-mock="50" :mocking-row-limit="5000" -->
  </CrimsonDataTable>

</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import Invoice from './models/Invoice';
  import CrimsonDataTable from '@crimson/components/DataTable/CrimsonDataTable.vue';
  import CrimsonForm from '@crimson/components/Form/CrimsonForm.vue';
  import {Faker} from "@faker-js/faker";

  const refreshTableMethod = ref<() => void>();

  const isCreateFormVisible = ref(false);

  // function mockItem(faker: Faker) : Invoice {
  //   return {

  //   }
  // }
</script>