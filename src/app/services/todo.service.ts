import { LocalStorageService } from './local-storage.service';
import { Todo } from './../models/todo.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Filter } from '../models/filtering.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  private static readonly TodoStorageKey = 'todos';

  private todos: Todo[];
  private filteredTodos: Todo[];
  private lengthSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private displayTodosSubject: BehaviorSubject<Todo[]> = new BehaviorSubject<Todo[]>([]);
  private currentFilter: Filter = Filter.All;

  todo$: Observable<Todo[]> = this.displayTodosSubject.asObservable(); //expose
  length$: Observable<number> = this.lengthSubject.asObservable();

  constructor(private storageService: LocalStorageService) { }

  fetchFromLocaStorage(){
    this.todos = this.storageService.getValue<Todo[]>(TodoService.TodoStorageKey) || [];
    // this.filteredTodos = [...this.todos.map(todo => ({...todo}))];  //cloneDeep of lodash
    this.filteredTodos = [...this.todos];  //cloneDeep of lodash
    this.updateTodosDate();
  }

  updateToLocalStorage(){
    this.storageService.setObject(TodoService.TodoStorageKey, this.todos);
    this.filtereTodos(this.currentFilter, false);
    this.updateTodosDate();
  }

  addTodo(content: string){
    const date = new Date(Date.now()).getTime();
    const newTodo = new Todo(date, content);
    this.todos.unshift(newTodo);
    this.updateToLocalStorage();
  }

  changeTodoStatus(id: number, isCompleted: boolean) {
    const index = this.todos.findIndex(e => e.id === id);
    const todo = this.todos[index];
    todo.isCompleted = isCompleted;
    this.todos.splice(index, 1, todo);
    this.updateToLocalStorage();
  }

  editTodo(id: number, content: string){
    const index = this.todos.findIndex(e => e.id === id);
    const todo = this.todos[index];
    todo.content = content;
    this.todos.splice(index, 1, todo);
    this.updateToLocalStorage();
  }

  deleteTodo(id: number){
    const index = this.todos.findIndex(e => e.id === id);
    this.todos.splice(index, 1);
    this.updateToLocalStorage();
  }

  toggleAll(){
    this.todos = this.todos.map(todo => {
      return {
        ...todo,
        isCompleted: !this.todos.every(t => t.isCompleted)
      }
    })
    this.updateToLocalStorage();
  }

  clearCompleted(){
    this.todos = this.todos.filter(todo => !todo.isCompleted)
    this.updateToLocalStorage();
  }

  filtereTodos(filter: Filter, isFiltering: boolean = true){
    this.currentFilter = filter;
    switch(filter){
      case Filter.Active:
        this.filteredTodos = this.todos.filter(todo => !todo.isCompleted)
        break;
      case Filter.Completed:
        this.filteredTodos = this.todos.filter(todo => todo.isCompleted);
        break;
      case Filter.All:
        this.filteredTodos = [...this.todos]
        break;
    }
    if(isFiltering){
      this.updateToLocalStorage();
    }
  }

  private updateTodosDate() {
    this.displayTodosSubject.next(this.filteredTodos);
    this.lengthSubject.next(this.todos.length);
  }
}
