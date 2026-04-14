import { UserStatus } from "@/generated/prisma";
import { Order } from "./order";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: UserStatus;
  role: string;
  createdAt: Date;
  orders?: Order[];
}
