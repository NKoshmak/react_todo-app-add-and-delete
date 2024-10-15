import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import * as todoService from './api/todos';
import { USER_ID } from './api/todos';
import { UserWarning } from './UserWarning';
import { Todo } from './types/Todo';
import { FilterType } from './types/FilterTypes';
import Footer from './components/Footer';
import TodoList from './components/TodoList';
import Header from './components/Header';

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
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterType, setFilterType] = useState<FilterType>(FilterType.all);
  const [errorMessage, setErrorMessage] = useState<string | null>('');

  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmiting] = useState(false);
  const [deletingTodoIds, setDeletingTodoIds] = useState<number[]>([]);

  const visibleTodos = getFilteredTodos(todos, filterType);
  const unCompletedTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  useEffect(() => {
    setLoading(true);

    todoService
      .getTodos()
      .then(setTodos)
      .catch(() => setErrorMessage('Unable to load todos'))
      .finally(() => setLoading(false));
  }, []);

  const deleteTodo = (todoId: number) => {
    setDeletingTodoIds(prevIds => [...prevIds, todoId]);

    return todoService
      .deleteTodo(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        setTodos(todos);
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
        setTodos(prevTodos => [...prevTodos, newTodoData]);
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

    setTodos(todos.filter(todo => !todo.completed));
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
        <Header
          newTodo={newTodo}
          setNewTodo={setNewTodo}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          loading={loading}
        />
        <TodoList
          todos={visibleTodos}
          deleteTodo={deleteTodo}
          deletingTodoIds={deletingTodoIds}
        />
        {todos.length > 0 && (
          <Footer
            unCompletedCount={unCompletedTodos.length}
            filterType={filterType}
            setFilterType={setFilterType}
            completedTodosCount={completedTodos.length}
            deleteAllCompleted={deleteAllCompleted}
          />
        )}
      </div>
      {/* Error notification */}
      <div
        data-cy="ErrorNotification"
        className={cn(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !errorMessage },
        )}
      >
        <button data-cy="HideErrorButton" type="button" className="delete" />
        {errorMessage}
      </div>
    </div>
  );
};
