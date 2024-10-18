import cn from 'classnames';
import { useEffect, useRef } from 'react';

type Props = {
  newTodo: string;
  setNewTodo: (value: string) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  isLoading: boolean;
  isTodoDeleted: boolean;
};

const Header: React.FC<Props> = ({
  newTodo,
  setNewTodo,
  handleSubmit,
  isSubmitting,
  isLoading,
  isTodoDeleted,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current && !isSubmitting && !isLoading) {
      inputRef.current.focus();
    }
  }, [newTodo, isSubmitting, isLoading, isTodoDeleted]);

  return (
    <header className="todoapp__header">
      <button
        type="button"
        className={cn('todoapp__toggle-all', {
          active: false,
        })}
        data-cy="ToggleAllButton"
      />
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          disabled={isSubmitting}
          autoFocus
        />
      </form>
    </header>
  );
};

export default Header;
