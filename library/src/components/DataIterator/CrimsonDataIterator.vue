<template>
  <slot name="each" v-for="(item, index) in cacheEnabledItems" :key="item._id" :item="item" />
</template>

<script lang="ts" setup generic="TEntityModel extends CrimsonEntity">
import { ref, Ref, onMounted, computed } from 'vue';

import { DataComponentProps, DataComponentPropsWithListCache } from '../../interfaces/CrimsonProps';
import { CrimsonDataList } from '../../interfaces/CrimsonData';
import Dataiterator from "./DataIterator";
import { useController } from '../../utility/useController';
import CrimsonEntity from '../../base/CrimsonEntity';

// Tell tle compiler which backend controller to use, and then the client what routes are available to hit.
const client = useController<Dataiterator<TEntityModel>>();

const props = defineProps<DataComponentPropsWithListCache<TEntityModel>>();

const data = ref<CrimsonDataList<TEntityModel>>({
  items: []
}) as Ref<CrimsonDataList<TEntityModel>>;

onMounted(async () => {
  data.value.items = await client.getItems();
});

// Allow for external addition of items.
const cacheEnabledItems = computed(() => {
  return [...props.localCache ?? [], ...data.value.items];
});
</script>