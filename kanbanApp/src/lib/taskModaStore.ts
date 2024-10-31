export class TaskModalContext {
  private static instance: TaskModalContext;
  private isOpen: boolean = false;
  private taskId: string = "";
  private columnLabel: string = "";
  private listenerFunctions: (() => void)[] = [];

  static getInstance() {
    if (!TaskModalContext.instance) {
      TaskModalContext.instance = new TaskModalContext();
    }
    return TaskModalContext.instance;
  }

  openModal(taskId: string, columnLabel: string) {
    this.taskId = taskId;
    this.columnLabel = columnLabel;
    this.isOpen = true;
    this.notifyListeners();
  }

  closeModal() {
    this.taskId = "";
    this.columnLabel = "";
    this.isOpen = false;
    this.notifyListeners();
  }

  addListener(listener: () => void) {
    this.listenerFunctions.push(listener);
  }

  notifyListeners() {
    this.listenerFunctions.forEach((listener) => listener());
  }

  getIsOpen() {
    return this.isOpen;
  }

  getTaskId() {
    return this.taskId;
  }

  getColumnLabel() {
    return this.columnLabel;
  }
}
