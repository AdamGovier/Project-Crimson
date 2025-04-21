<template>

</template>

<script lang="ts" setup generic="TEntityModel extends CrimsonEntity">
import CrimsonEntity from '../../base/CrimsonEntity';
import { CrimsonFocussedItem } from '../../interfaces/CrimsonData';
import { ref, Ref, onMounted } from 'vue';
import Seeder from "./Seeder";
import { useController } from '../../utility/useController';
import { DataComponentProps } from '../../interfaces/CrimsonProps';
import { faker, Faker } from "@faker-js/faker";

interface SeederProps {
  seeder: (faker: Faker) => TEntityModel,
  count: number
}

const client = useController<Seeder<TEntityModel>>();

const props = defineProps<DataComponentProps<TEntityModel> & SeederProps>();

onMounted(async () => {
  const items: TEntityModel[] = [];

  for (let i = 0; i < props.count; i++) {
    items.push(props.seeder(faker));
  }

  await client.postSeed({
    body: items
  });
});
</script>