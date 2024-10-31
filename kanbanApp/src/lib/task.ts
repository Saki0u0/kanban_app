import type { Assignee } from "./assignee";

export interface Task {
  id: number;
  title: string;
  description: string;
  label: string;
  assignees: Assignee[];
}
