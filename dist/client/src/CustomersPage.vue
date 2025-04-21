<template>
  <div class="d-flex justify-end">
    <v-btn color="primary" @click="() => isCreateFormVisible = !isCreateFormVisible">{{ isCreateFormVisible ? 'Hide' : 'Create' }}</v-btn>
  </div>

  <!-- Create Form -->
  <div v-show="isCreateFormVisible" class="mb-6">
    <CrimsonForm :entity-model="Customer" title="Create Invoice" @create="(item) => localItems.push(item)">
      <template #model="{item}">
        <v-text-field
          v-model="item.firstName"
          label="First Name"
          dense
          required
        ></v-text-field>

        <v-text-field
          v-model="item.lastName"
          label="Last Name"
          dense
          required
        ></v-text-field>

        <v-text-field
          v-model="item.email"
          label="Email"
          dense
          required
        ></v-text-field>

        <v-text-field
          v-model="item.phoneNumber"
          label="Phone Number"
          dense
          required
        ></v-text-field>
      </template>
    </CrimsonForm>
  </div>

  <v-container fluid>
    <v-row>
      <CrimsonDataIterator :entity-model="Customer" :local-cache="localItems">
        <template #each="{ item }">
          <v-col cols="12" sm="6" md="4" lg="3">
            <v-card>
              <v-card-title>
                {{ item.firstName }} {{ item.lastName }}
              </v-card-title>
              <v-card-subtitle>
                {{ item.email }}
              </v-card-subtitle>
              <v-card-text>
                Phone: {{ item.phoneNumber }}
              </v-card-text>
            </v-card>
          </v-col>
        </template>
      </CrimsonDataIterator>
    </v-row>
  </v-container>

</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import Customer from './models/Customer';
  import CrimsonDataIterator from '@crimson/components/DataIterator/CrimsonDataIterator.vue';
  import CrimsonForm from '@crimson/components/Form/CrimsonForm.vue';
  import {Faker} from "@faker-js/faker";

  const localItems = ref<Customer[]>([]);
  const isCreateFormVisible = ref(false);

  // function mockItem(faker: Faker) : Invoice {
  //   return {

  //   }
  // }
</script>