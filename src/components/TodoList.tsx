import React from 'react';
import { Todo } from '../types/Todo';
import TodoItem from './TodoItem';

type Props = {
  todos: Todo[];
  deleteTodo: (id: number) => void;
  deletingTodoIds: number[];
  tempTodo?: Todo | null;
};

const TodoList: React.FC<Props> = ({
  todos,
  deleteTodo,
  deletingTodoIds,
  tempTodo,
}) => (
  <section className="todoapp__main" data-cy="TodoList">
    {todos.map(todo => (
      <TodoItem
        key={todo.id}
        todo={todo}
        deleteTodo={deleteTodo}
        deletingTodoIds={deletingTodoIds}
      />
    ))}

    {tempTodo && (
      <TodoItem
        tempTodo={tempTodo}
        key={tempTodo.id}
        todo={tempTodo}
        deleteTodo={deleteTodo}
        deletingTodoIds={deletingTodoIds}
      />
    )}
  </section>
);

export default TodoList;
