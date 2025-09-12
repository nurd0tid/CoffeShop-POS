export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: {
    size: string;
    value: number;
  }[];
};
