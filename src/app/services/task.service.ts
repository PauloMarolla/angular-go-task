import { Injectable } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { ITask } from '../interfaces/task.interface';
import { ITaskFormControls } from '../interfaces/tasak-form-controls.interface';
import { generateUniqueIdWithTimestamp } from '../utils/generate-unique-id-with-timestamp';
import { TasksStatusEnum } from '../enums/task-status.enum';
import { IComment } from '../interfaces/comment.interface';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private todoTasks$ = new BehaviorSubject<ITask[]>(this.loadTasksFromLocalStorage(TasksStatusEnum.TODO));
  readonly todoTasks = this.todoTasks$.asObservable().pipe(
    map((tasks) => structuredClone(tasks)),
    tap((tasks) => this.saveTasksOnLocalStorage(TasksStatusEnum.TODO, tasks)),
  );

  private doingTasks$ = new BehaviorSubject<ITask[]>(this.loadTasksFromLocalStorage(TasksStatusEnum.DOING));
  readonly doingTasks = this.doingTasks$.asObservable().pipe(
    map((tasks) => structuredClone(tasks)),
    tap((tasks) => this.saveTasksOnLocalStorage(TasksStatusEnum.DOING, tasks)),
  );

  private doneTasks$ = new BehaviorSubject<ITask[]>(this.loadTasksFromLocalStorage(TasksStatusEnum.DONE));
  readonly doneTasks = this.doneTasks$.asObservable().pipe(
    map((tasks) => structuredClone(tasks)),
    tap((tasks) => this.saveTasksOnLocalStorage(TasksStatusEnum.DONE, tasks)),
  );

  addTask(newTask: ITaskFormControls) {
    const newTaskList: ITask[] = [...this.todoTasks$.value, { ...newTask, id: generateUniqueIdWithTimestamp(), comments: [], status: TasksStatusEnum.TODO }];
    this.todoTasks$.next(newTaskList);
  }

  updateTaskStatus(taskId: string, taskCurrentStatus: TasksStatusEnum, taskNextStatus: TasksStatusEnum) {
    const currentTaskList = this.getTaskListByStatus(taskCurrentStatus);
    const nextTaskList = this.getTaskListByStatus(taskNextStatus);
    const currentTask = currentTaskList.value.find((task) => task.id === taskId);

    if (currentTask) {
      currentTask.status = taskNextStatus;

      const updatedCurrentTaskList = currentTaskList.value.filter((task) => task.id !== taskId);

      currentTaskList.next([...updatedCurrentTaskList]);
      nextTaskList.next([...nextTaskList.value, { ...currentTask }]);
    }
  }

  updateTaskNameAndDescription(taskId: string, taskStatus: TasksStatusEnum, taskName: string, taskDescription: string) {
    const taskList = this.getTaskListByStatus(taskStatus);
    const taskToUpdate = taskList.value.find((task) => task.id === taskId);

    if (taskToUpdate) {
      taskToUpdate.name = taskName;
      taskToUpdate.description = taskDescription;

      const updatedTaskList = taskList.value.map((task) => (task.id === taskId ? { ...taskToUpdate } : task));
      taskList.next([...updatedTaskList]);
    }
  }

  updateTaskComments(taskId: string, taskStatus: TasksStatusEnum, comments: IComment[]) {
    const taskList = this.getTaskListByStatus(taskStatus);
    const taskToUpdate = taskList.value.find((task) => task.id === taskId);

    if (taskToUpdate) {
      taskToUpdate.comments = comments;

      const updatedTaskList = taskList.value.map((task) => (task.id === taskId ? { ...taskToUpdate } : task));
      taskList.next([...updatedTaskList]);
    }
  }

  deleteTask(taskId: string, taskStatus: TasksStatusEnum) {
    const taskList = this.getTaskListByStatus(taskStatus);
    const updatedTaskList = taskList.value.filter((task) => task.id !== taskId);
    taskList.next([...updatedTaskList]);
  }

  private getTaskListByStatus(status: TasksStatusEnum): BehaviorSubject<ITask[]> {
    switch (status) {
      case TasksStatusEnum.TODO:
        return this.todoTasks$;
      case TasksStatusEnum.DOING:
        return this.doingTasks$;
      case TasksStatusEnum.DONE:
        return this.doneTasks$;
    }
  }

  private saveTasksOnLocalStorage(key: string, tasks: ITask[]) {
    try {
      localStorage.setItem(key, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage', error);
    }
  }

  private loadTasksFromLocalStorage(key: string): ITask[] {
    try {
      const tasks = localStorage.getItem(key);
      return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
      console.error('Error loading tasks from localStorage', error);
      return [];
    }
  }
}
