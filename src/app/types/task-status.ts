import { TasksStatusEnum } from '../enums/task-status.enum';

export type TaskStatus = TasksStatusEnum.TODO | TasksStatusEnum.DOING | TasksStatusEnum.DONE;
