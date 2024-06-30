export interface CrudRepository<TCreateData, TUpdateData, TData> {
  create(data: TCreateData): Promise<TData>;

  findAll(): Promise<TData[]>;

  findOne(id: string): Promise<TData>;

  update(id: string, data: TUpdateData): Promise<TData>;

  delete(id: string): Promise<boolean>;
}
