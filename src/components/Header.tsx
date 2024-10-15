import cn from 'classnames';
import { useEffect, useRef } from 'react';

type Props = {
  newTodo: string;
  setNewTodo: (value: string) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  loading: boolean;
};

const Header: React.FC<Props> = ({
  newTodo,
  setNewTodo,
  handleSubmit,
  isSubmitting,
  loading,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current && !isSubmitting && !loading) {
      inputRef.current.focus();
    }
  }, [isSubmitting, loading]);

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
          disabled={isSubmitting || loading}
          autoFocus
        />
      </form>
    </header>
  );
};

export default Header;
