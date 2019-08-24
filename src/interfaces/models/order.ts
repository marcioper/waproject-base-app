export interface IOrder {
  id?: number;
  description: string;
  amount: number;
  price: number;

  createdDate?: Date;
  updatedDate?: Date;
}
