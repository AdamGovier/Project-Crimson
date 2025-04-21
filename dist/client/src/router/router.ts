import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import InvoicePage from "../InvoicePage.vue";
import CustomersPage from "../CustomersPage.vue";
import Page3 from "../Page3.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Invoices',
    component: InvoicePage
  },
  {
    path: '/customers',
    name: 'Customers',
    component: CustomersPage
  },
  {
    path: '/page3',
    name: 'Page3',
    component: Page3
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;