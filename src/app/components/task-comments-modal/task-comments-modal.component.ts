import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { generateUniqueIdWithTimestamp } from '../../utils/generate-unique-id-with-timestamp';
import { CdkObserveContent } from '@angular/cdk/observers';
import { ITask } from '../../interfaces/task.interface';
import { IComment } from '../../interfaces/comment.interface';

@Component({
  selector: 'app-task-comments-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './task-comments-modal.component.html',
  styleUrl: './task-comments-modal.component.css',
})
export class TaskCommentsModalComponent {
  commentControl = new FormControl('', [Validators.required]);
  readonly _task: ITask = inject(DIALOG_DATA);
  readonly _taskService = inject(TaskService);
  readonly _dialogRef: DialogRef<boolean> = inject(DialogRef);
  isCommentsChange = false;

  @ViewChild('commentInput') commentInputRef!: ElementRef<HTMLInputElement>;

  onAddComment() {
    const newComment: IComment = {
      id: generateUniqueIdWithTimestamp(),
      description: this.commentControl.value || '',
    };

    this._task.comments.unshift(newComment);

    this.commentControl.reset();

    this.isCommentsChange = true;

    this.commentInputRef.nativeElement.focus();
  }

  onRemoveModal(commentId: string) {
    this._task.comments = this._task.comments.filter((comment) => comment.id !== commentId);
    this.isCommentsChange = true;
  }

  onCloseModal() {
    this._dialogRef.close(this.isCommentsChange);
  }
}
