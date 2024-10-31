import { atom } from "nanostores";
import type { Task } from "./task";
import type { Column } from "./columns";
import type { Assignee } from "./assignee";
import { assigneeMap } from "./assignee";

export class TaskContext {
  private static instance: TaskContext;
  private filter: string = "";
  private listenerFunctions: (() => void)[] = [];
  private $columns = atom<Column[]>([]);

  static getInstance() {
    if (!TaskContext.instance) {
      TaskContext.instance = new TaskContext();
    }
    console.log("TaskContext instance created");
    console.log(TaskContext.instance);
    return TaskContext.instance;
  }

  private constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    const storedColumns = localStorage.getItem("tasks");
    if (storedColumns) {
      this.$columns.set(JSON.parse(storedColumns));
    } else {
      this.$columns.set([
        {
          tasks: [
            {
              id: 1,
              title: "Carve Pumpkin",
              description:
                "Create jack-o'-lanterns for the front porch. Don't forget the LED candles!",
              label: "todo",
              assignees: [assigneeMap.pumpkin],
            },
          ],
          label: "To Do",
        },
        {
          tasks: [
            {
              id: 2,
              title: "Prepare Witch Costume",
              description:
                "This year's theme: Wicked Witch!  Find the pointy hat and broomstick.",
              label: "In Progress",
              assignees: [assigneeMap.dracula, assigneeMap.ghost],
            },
          ],
          label: "In Progress",
        },
        {
          tasks: [
            {
              id: 3,
              title: "Stock Up on Treats",
              description:
                "Buy candy, cookies, and other treats for Halloween.",
              label: "done",
              assignees: [assigneeMap.hat, assigneeMap.spider],
            },
          ],
          label: "Done",
        },
      ]);
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(this.$columns.get()));
  }

  updateFilter(keyword: string) {
    this.filter = keyword;
    if (keyword.length >= 3) {
      this.notifyListeners();
    } else {
      this.filter = "";
      this.notifyListeners();
    }
  }

  getTask(id: number, label: string) {
    return this.$columns
      .get()
      .find((column) => column.label === label)
      ?.tasks.find((task) => task.id === id);
  }

  getColumns() {
    const filter = this.filter;
    if (!filter) return this.$columns.get();

    const filteredColumns = this.$columns.get().map((column) => {
      const matchedTasks = column.tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(this.filter.toLowerCase()) ||
          task.description.toLowerCase().includes(this.filter.toLowerCase())
      );
      return { ...column, tasks: matchedTasks };
    });

    return filteredColumns;
  }

  getLabels() {
    return this.$columns.get().map((column) => column.label);
  }

  addColumn(label: string) {
    const columns = this.$columns.get();
    let newLabel = label;
    let counter = 1;
    while (columns.find((column) => column.label === newLabel)) {
      newLabel = `${label} ${counter}`;
      counter++;
    }
    columns.push({ label: newLabel, tasks: [] });
    this.$columns.set(columns);
    this.notifyListeners();
  }

  deleteColumn(label: string) {
    this.$columns.set(
      this.$columns.get().filter((column) => column.label !== label)
    );
    this.notifyListeners();
  }

  updateColumnLabel(label: string, newLabel: string) {
    const columns = this.$columns.get();
    const targetColumn = columns.find((column) => column.label === label);
    if (!targetColumn) return;

    targetColumn.label = newLabel;

    this.$columns.set(columns);
    this.notifyListeners();
  }

  // Task Manipulation
  addTask(title: string, description: string, label: string) {
    const columns = this.$columns.get();
    const targetColumn = columns.find((column) => column.label === label);

    if (!targetColumn) return;

    const newTask: Task = {
      id: Date.now(),
      title,
      description,
      label,
      assignees: [],
    };

    targetColumn.tasks = [...targetColumn.tasks, newTask];

    //this.$columns.set(columns.map((c) => (c.label === label ? targetColumn : c)));
    this.notifyListeners();
  }

  updateTaskLabel(taskId: number, preLabel: string, newLabel: string) {
    const columns = this.$columns.get();
    const fromColumn = columns.find((column) => column.label === preLabel);
    const toColumn = columns.find((column) => column.label === newLabel);
    if (!fromColumn || !toColumn) return;

    const taskIndex = fromColumn.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;

    // Remove the task from the source column and get it
    const [task] = fromColumn.tasks.splice(taskIndex, 1);
    // Insert the task at the new index in the destination column
    toColumn.tasks.push(task);

    // Notification
    this.notifyListeners();
  }

  moveTask(
    taskId: number,
    preLabel: string,
    newLabel: string,
    newIndex: number
  ) {
    const columns = this.$columns.get();
    const fromColumn = columns.find((column) => column.label === preLabel);
    const toColumn = columns.find((column) => column.label === newLabel);
    if (!fromColumn || !toColumn) return;

    const taskIndex = fromColumn.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;

    // Remove the task from the source column and get it
    const [task] = fromColumn.tasks.splice(taskIndex, 1);

    // Insert the task at the new index in the destination column
    toColumn.tasks.splice(newIndex, 0, task);

    // Notification
    this.notifyListeners();
  }

  editTask(
    label: string,
    taskId: number,
    newTitle: string,
    newDescription: string
  ) {
    const targetColumn = this.$columns
      .get()
      .find((column) => column.label === label);
    if (!targetColumn) return;

    targetColumn.tasks = targetColumn.tasks.map((task) =>
      task.id === taskId
        ? { ...task, title: newTitle, description: newDescription }
        : task
    );

    this.$columns.set(
      this.$columns.get().map((c) => (c.label === label ? targetColumn : c))
    );
    this.notifyListeners();
  }

  updateTaskTitle(taskId: number, label: string, newTitle: string) {
    const targetColumn = this.$columns
      .get()
      .find((column) => column.label === label);
    if (!targetColumn) return;

    targetColumn.tasks = targetColumn.tasks.map((task) =>
      task.id === taskId ? { ...task, title: newTitle } : task
    );
    this.notifyListeners();
  }

  updateTaskDescription(taskId: number, label: string, newDescription: string) {
    const targetColumn = this.$columns
      .get()
      .find((column) => column.label === label);
    if (!targetColumn) return;

    targetColumn.tasks = targetColumn.tasks.map((task) =>
      task.id === taskId ? { ...task, description: newDescription } : task
    );
    this.notifyListeners();
  }

  deleteTask(id: number, label: string) {
    const targetColumn = this.$columns
      .get()
      .find((column) => column.label === label);

    if (!targetColumn) return;

    const updateColumnTasks = targetColumn.tasks.filter(
      (task) => task.id !== id
    );

    // entire column
    this.$columns.set(
      this.$columns
        .get()
        .map((c) =>
          c.label === label ? { ...targetColumn, tasks: updateColumnTasks } : c
        )
    );

    this.notifyListeners();
  }

  addAssignee(taskId: number, label: string, assigneeName: Assignee["name"]) {
    const targetColumn = this.$columns
      .get()
      .find((column) => column.label === label);
    if (!targetColumn) return;

    targetColumn.tasks = targetColumn.tasks.map((task) =>
      task.id === taskId
        ? { ...task, assignees: [...task.assignees, assigneeMap[assigneeName]] }
        : task
    );
    console.log(targetColumn.tasks);
    this.notifyListeners();
  }

  removeAssignee(
    taskId: number,
    label: string,
    assigneeName: Assignee["name"]
  ) {
    const targetColumn = this.$columns
      .get()
      .find((column) => column.label === label);
    if (!targetColumn) return;

    targetColumn.tasks = targetColumn.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            assignees: task.assignees.filter((a) => a.name !== assigneeName),
          }
        : task
    );
    this.notifyListeners();
  }

  // Notification
  addListener(listener: () => void) {
    this.listenerFunctions.push(listener);
  }

  notifyListeners() {
    this.listenerFunctions.forEach((listener) => listener());
    this.saveToLocalStorage();
  }
  // end of Notification
}
