<template>
  <v-data-table-server
    :headers="[...headers, {
      key: 'actions',
      title: 'Actions'
    }]"
    :items="data.items"
    :page="data.page"
    @update:options="loadItems"
    :items-length="data.totalItems">

    <template v-slot:item.actions="{ item }: {item: TEntityModel}">
      <v-btn text color="red" size="small" flat @click="onDelete(item._id)">
        Delete
      </v-btn>
    </template>

    <template v-if="data.sortBy && data.sortBy.key" v-slot:[`header.${data.sortBy.key}`]="{ item }">
      {{ headers.find(x => x.key == data.sortBy.key)?.title }} ({{ data.sortBy.order.toUpperCase() }})
    </template>

    <template #bottom>
      <div class="d-flex justify-start align-center ga-3 mt-3">
        <v-btn text @click="prevPage" :disabled="data.page <= 1" color="primary" rounded flat size="small">
          &lt;
        </v-btn>
        <span class="mx-2">Page {{ data.page }} of {{ totalPages }}</span>
        <v-btn text @click="nextPage" :disabled="data.page >= totalPages" color="primary" rounded flat size="small">
          &gt;
        </v-btn>
      </div>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts" generic="TEntityModel extends CrimsonEntity">

import { useController } from '../../utility/useController';
import CrimsonEntity from '../../base/CrimsonEntity';
import DataTable from './DataTable';
import { DataComponentPropsWithListCache, DataComponentProps } from '../../interfaces/CrimsonProps';
import { CrimsonDataList } from '../../interfaces/CrimsonData';
import { Ref, ref, onMounted, computed } from 'vue';
import DataTableHeader from './DataTableHeader';
import { Faker, faker } from '@faker-js/faker';
import { mdi } from 'vuetify/iconsets/mdi-svg';
import { ObjectId } from 'mongodb';

interface Props extends DataComponentProps<TEntityModel> {
    headers: DataTableHeader<TEntityModel>[];
    /*!--empty-line--!*/
    // If any of the below mocking params are null, then mocking will be disabled.
    mockUpFunction?: (faker: Faker) => TEntityModel;
    // If the total number of rows exceeds this value, mocking is disabled
    mockingRowLimit?: number;
    // The number of rows to generate with the mock function
    rowsToMock?: number;
    /*!--empty-line--!*/
    where?: Partial<TEntityModel>;
}

interface Data extends CrimsonDataList<TEntityModel> {
    totalItems: number;
    page: number;
    rowsPerPage: number;
    sortBy?: any;
    hasBeenMocked: boolean;
}

interface PaginationQuery {
    page: number;
    itemsPerPage: number;
    sortBy?: any[];
}

interface EmitEvents {
    (e: 'refreshMethodCreated', payload: () => void): void;
}

const client = new DataTable<TEntityModel>();

const emit = defineEmits<EmitEvents>();

const props = defineProps<Props>();

const data = ref<Data>({
    items: [],
    totalItems: 0,
    page: 1,
    rowsPerPage: 10,
    hasBeenMocked: false
}) as Ref<Data>;

onMounted(() => {
    emit('refreshMethodCreated', refresh);
});

const totalPages = computed(() => Math.ceil(data.value.totalItems / data.value.rowsPerPage));

const refresh = async () => {
    await loadItems({
        page: data.value.page,
        itemsPerPage: data.value.rowsPerPage,
        sortBy: data.value.sortBy
    });
};

// Convert where clause into a delimited csv list.
function toQueryParam(where: Partial<TEntityModel>): string {
    return Object.entries(where)
        .map(([key, value]) => `${key}:${value}`)
        .join(',');
}

async function loadItems({ page, itemsPerPage, sortBy }: PaginationQuery) {
    let sortParam;
    let sortOrder;
    /*!--empty-line--!*/
    if (sortBy && sortBy.length) {
        sortParam = sortBy[0].key;
        sortOrder = sortBy[0].order;
        data.value.sortBy = sortBy[0];
    }
    else {
        data.value.sortBy = undefined;
    }
    /*!--empty-line--!*/
    /*!--empty-line--!*/
    const response = await client.getTableItems(props.entityModel.name, {
        body: undefined,
        query: {
            itemsPerPage: itemsPerPage.toString(),
            page: page.toString(),
            sortBy: sortParam ?? "",
            sortOrder: sortOrder ?? "",
            where: props.where ? toQueryParam(props.where) : ""
        }
    });
    /*!--empty-line--!*/
    data.value.items = response.itemsForPage;
    data.value.totalItems = response.totalItemCount;
    data.value.page = page;
    data.value.rowsPerPage = itemsPerPage;
    /*!--empty-line--!*/
    if ((props.mockUpFunction && props.mockingRowLimit && props.rowsToMock) && !data.value.hasBeenMocked && data.value.totalItems < props.mockingRowLimit) {
        data.value.hasBeenMocked = true;
        const items: TEntityModel[] = [];
        /*!--empty-line--!*/
        for (let i = 0; i < props.rowsToMock; i++) {
            items.push(props.mockUpFunction(faker));
        }
        /*!--empty-line--!*/
        const bodyItems = items.filter(item => typeof item === 'object' && item !== null);
        /*!--empty-line--!*/
        await client.postSeed(props.entityModel.name, {
            body: bodyItems
        });
        /*!--empty-line--!*/
        await loadItems({ page, itemsPerPage, sortBy });
    }
}

function prevPage() {
    if (data.value.page > 1) {
        loadItems({ page: data.value.page - 1, itemsPerPage: data.value.rowsPerPage, sortBy: [] });
    }
}

function nextPage() {
    if (data.value.page < totalPages.value) {
        loadItems({ page: data.value.page + 1, itemsPerPage: data.value.rowsPerPage, sortBy: [] });
    }
}

async function onDelete(_id: any) {
    data.value.items = data.value.items.filter(item => String(item._id) !== String(_id));
    /*!--empty-line--!*/
    await client.deleteItem(props.entityModel.name, {
        query: {
            _id
        }
    });
}
/*!--empty-line--!*/ 

</script>