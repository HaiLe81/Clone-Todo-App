import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { TodoService } from './../../services/todo.service';
import { Filter, FilterButton } from './../../models/filtering.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  filterButtons: FilterButton[] = [
    { type: Filter.All, label: 'All', isActive: true },
    { type: Filter.Active, label: 'Active', isActive: false },
    { type: Filter.Completed, label: 'Completed', isActive: false },
  ]

  length = 0;
  hasComplete$: Observable<boolean>;
  destroy$: Subject<null> = new Subject<null>();

  constructor(private todoService: TodoService) {

  }

  ngOnInit(): void {
    // takeUntil
    this.hasComplete$ = this.todoService.todo$.pipe(
      map(todos => todos.some(t => t.isCompleted)), // 1 or many completed => true else return false
      takeUntil(this.destroy$) // input observable or object. used unsubscribe when ngOnDestroy().
    );

    this.todoService.length$.pipe(takeUntil(this.destroy$)).subscribe(length => {
      this.length = length;
    })
  }

  filter(type: Filter) {
    this.setActiveFilterBtn(type);
    this.todoService.filtereTodos(type);
  }

  private setActiveFilterBtn(type: Filter) {
    this.filterButtons.forEach(btn => {
      btn.isActive = btn.type === type;
    });
  }

  clearCompleted(){
    this.todoService.clearCompleted()
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
