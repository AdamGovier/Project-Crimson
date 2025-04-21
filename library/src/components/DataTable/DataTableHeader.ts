export default interface DataTableHeader<TEntityModel> {
  key: keyof TEntityModel;
  title: string;
}