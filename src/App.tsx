/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import * as todoService from './api/todos';
import { FilterType } from './types/FilterTypes';
import cn from 'classnames';

const getFilteredTodos = (todos: Todo[], filter: FilterType) => {
  switch (filter) {
    case FilterType.active:
      return todos.filter(todo => !todo.completed);
    case FilterType.completed:
      return todos.filter(todo => todo.completed);
    default:
      return todos;
  }
};

export const App: React.FC = () => {
  const [todosFromServer, setTodosFromServer] = useState<Todo[]>([]);
  const [filterType, setFilterType] = useState<FilterType>(FilterType.all);
  const [errorMessage, setErrorMessage] = useState<string | null>('');

  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmiting] = useState(false);
  const [deletingTodoIds, setDeletingTodoIds] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const visibleTodos = getFilteredTodos(todosFromServer, filterType);

  const unCompletedTodos = todosFromServer.filter(todo => !todo.completed);
  const completedTodos = todosFromServer.filter(todo => todo.completed);

  useEffect(() => {
    setLoading(true);

    todoService
      .getTodos()
      .then(todos => setTodosFromServer(todos))
      .catch(() => setErrorMessage('Unable to load todos'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (inputRef.current && !isSubmitting && !loading && deletingTodoIds) {
      inputRef.current.focus();
    }
  }, [isSubmitting, loading, deletingTodoIds]);

  const deleteTodo = (todoId: number) => {
    setDeletingTodoIds(prevIds => [...prevIds, todoId]);

    return todoService
      .deleteTodo(todoId)
      .then(() => {
        setTodosFromServer(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        setTodosFromServer(todosFromServer);
        setErrorMessage('Unable to delete a todo');
      })
      .finally(() =>
        setDeletingTodoIds(prevIds => prevIds.filter(tId => todoId !== tId)),
      );
  };

  const addTodo = ({ title, completed, userId }: Todo) => {
    return todoService
      .createTodo({ title, completed, userId })
      .then(newTodoData => {
        setTodosFromServer(prevTodos => [...prevTodos, newTodoData]);
        setNewTodo('');
      })
      .catch(() => {
        setErrorMessage('Unable to add a todo');
      });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newTodoTitle = newTodo.trim();

    if (newTodoTitle === '') {
      setErrorMessage('Title should not be empty');

      return;
    }

    const newTodoItem = {
      id: +new Date(),
      title: newTodoTitle,
      completed: false,
      userId: USER_ID,
    };

    setIsSubmiting(true);

    addTodo(newTodoItem).finally(() => setIsSubmiting(false));
  };

  const deleteAllCompleted = () => {
    if (completedTodos.length === 0) {
      return;
    }

    completedTodos.map(todo => deleteTodo(todo.id));

    setTodosFromServer(todosFromServer.filter(todo => !todo.completed));
  };

  if (errorMessage) {
    setTimeout(() => setErrorMessage(null), 3000);
  }

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              disabled={isSubmitting || loading}
              autoFocus
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {/* This is a completed todo */}
          {visibleTodos.map(todo => (
            <div
              data-cy="Todo"
              className={todo.completed ? 'todo completed' : 'todo'}
              key={todo.id}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  checked={todo.completed}
                />
              </label>

              <span data-cy="TodoTitle" className="todo__title">
                {todo.title}
              </span>

              {/* Remove button appears only on hover */}
              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
                onClick={() => deleteTodo(todo.id)}
              >
                ×
              </button>

              {/* overlay will cover the todo while it is being deleted or updated */}
              <div
                data-cy="TodoLoader"
                className={cn('modal overlay', {
                  'is-active': deletingTodoIds.includes(todo.id),
                })}
              >
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          ))}

          {isSubmitting && (
            // eslint-disable-next-line react/jsx-no-comment-textnodes
            <div data-cy="Todo" className="todo">
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                />
              </label>
              <span data-cy="TodoTitle" className="todo__title">
                {newTodo}
              </span>
              {/* Remove button appears only on hover */}
              <button
                type="button"
                className="todo__remove"
                data-cy="TodoDelete"
              >
                ×
              </button>
              {/* overlay will cover the todo while it is being deleted or updated */}
              <div data-cy="TodoLoader" className="modal overlay is-active">
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          )}
        </section>

        {/* Hide the footer if there are no todos "filter__link selected"*/}
        {todosFromServer.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {unCompletedTodos.length} items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={cn('filter__link', {
                  selected: FilterType.all === filterType,
                })}
                data-cy="FilterLinkAll"
                onClick={() => setFilterType(FilterType.all)}
              >
                All
              </a>

              <a
                href="#/active"
                className={cn('filter__link', {
                  selected: FilterType.active === filterType,
                })}
                data-cy="FilterLinkActive"
                onClick={() => setFilterType(FilterType.active)}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={cn('filter__link', {
                  selected: FilterType.completed === filterType,
                })}
                data-cy="FilterLinkCompleted"
                onClick={() => setFilterType(FilterType.completed)}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled={completedTodos.length === 0}
              onClick={deleteAllCompleted}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={cn(
          'notification is-danger is-light has-text-weight-normal',
          {
            hidden: !errorMessage,
          },
        )}
      >
        <button data-cy="HideErrorButton" type="button" className="delete" />
        {/* show only one message at a time */}
        {errorMessage}
      </div>
    </div>
  );
};
