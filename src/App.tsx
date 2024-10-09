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

  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [addNewTodo, setAddNewTodo] = useState<Todo | null>(null);

  const visibleTodos = getFilteredTodos(todosFromServer, filterType);

  const unCompletedTodos = todosFromServer.filter(todo => !todo.completed);
  const completedTodos = todosFromServer.filter(todo => todo.completed);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    todoService
      .getTodos()
      .then(todos => setTodosFromServer(todos))
      .catch(() => setErrorMessage('Unable to load todos'));
  }, []);

  useEffect(() => {
    if (loading === false && !addNewTodo) {
      inputRef.current?.focus();
    }
  }, [loading, addNewTodo]);

  const handleDeleteTodo = (todoId: number) => {
    setLoading(true);

    todoService
      .deleteTodo(todoId)
      .then(() =>
        setTodosFromServer(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        ),
      )
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
      })
      .finally(() => setLoading(false));
  };

  const addTodo = ({ title, completed, userId }: Todo) => {
    todoService
      .addTodo({ title, completed, userId })
      .then(newTodo => {
        setTodosFromServer(currentTodos => [...currentTodos, newTodo]);
        setNewTitle('');
      })
      .catch(() => {
        setErrorMessage('Unable to add todo');
      });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newTodoTitle = newTitle.trim();

    if (newTodoTitle === '') {
      setErrorMessage('Title should not be empty');

      return;
    }

    const newTodo = {
      id: +new Date(),
      title: newTodoTitle,
      completed: false,
      userId: USER_ID,
    };

    setAddNewTodo(newTodo);

    addTodo(newTodo);
    setAddNewTodo(null);
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
              value={newTitle}
              // autoFocus
              onChange={e => setNewTitle(e.target.value)}
              disabled={!!addNewTodo}
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
                onClick={() => handleDeleteTodo(todo.id)}
              >
                ×
              </button>

              {/* overlay will cover the todo while it is being deleted or updated */}
              <div data-cy="TodoLoader" className="modal overlay">
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          ))}

          {addNewTodo && (
            // eslint-disable-next-line react/jsx-no-comment-textnodes
            <div data-cy="Todo" className="todo">
              // eslint-disable-next-line jsx-a11y/label-has-associated-control
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                />
              </label>

              <span data-cy="TodoTitle" className="todo__title">
                {newTitle}
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
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {/* show only one message at a time */}
        {errorMessage}
      </div>
    </div>
  );
};
