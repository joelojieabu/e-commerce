import { Rating } from "./rating.model";

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  title: string;
  rating: Rating;
}
