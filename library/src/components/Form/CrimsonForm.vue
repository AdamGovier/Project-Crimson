<template>
  <v-form @submit.prevent="onSubmit">
    <v-card>
      <v-card-title>
        {{ props.title }}
      </v-card-title>

      <v-card-text>
        <slot name="model" :item="(data.item as TEntityModel)" />
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="primary"
            text="Submit"
            variant="text"
            type="submit"
          ></v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script lang="ts" setup generic="TEntityModel extends CrimsonEntity">
import CrimsonEntity from '../../base/CrimsonEntity';
import { CrimsonFocussedItem } from '../../interfaces/CrimsonData';
import { ref, Ref, onMounted } from 'vue';
import Form from "./Form";
import { useController } from '../../utility/useController';
import { DataComponentProps } from '../../interfaces/CrimsonProps';

interface FormMeta {
  title: string
}

interface EmitEvents {
  (e: 'create', payload: TEntityModel): void;
}

const emit = defineEmits<EmitEvents>();

const client = useController<Form<TEntityModel>>();

const props = defineProps<DataComponentProps<TEntityModel> & FormMeta>();

const data = ref<CrimsonFocussedItem<TEntityModel>>({
  item: {} as TEntityModel
}) as Ref<CrimsonFocussedItem<TEntityModel>>;

async function onSubmit() {
  const item = await client.postCreate({
    body: data.value.item
  });

  emit('create', item);

  data.value.item = {} as TEntityModel;
}
</script>