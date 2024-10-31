import type { Task } from "./task";

export interface Column {
  tasks: Task[];
  label: string;
}
