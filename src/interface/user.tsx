import { UserStatus } from "@/generated/prisma";
import { Order } from "./order";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  totalOrders: number;
  totalSpent: number;
  status: UserStatus;
  role: string;
  orders: Order[]
}
