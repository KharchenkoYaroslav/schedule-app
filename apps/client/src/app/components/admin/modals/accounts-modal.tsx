import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IoClose, IoAddCircleOutline, IoTrash } from 'react-icons/io5';
import ScaleLoader from 'react-spinners/ScaleLoader';
import styles from './accounts.module.scss';
import { UserRole } from '../../../api/types/enums/user-role.enum';
import { UserDto } from '../../../api/types/control/user.dto';
import {
  useGetUsersQuery,
  useGetAllowedUsersQuery,
  useChangeUserRoleMutation,
  useDeleteUserMutation,
  useAddAllowedUserMutation,
  useDeleteAllowedUserMutation,
} from '../../../hooks/useControlQueries';
import { AddAllowedUserInput } from '../../../api/types/control/add-allowed-user.input';
import { ChangeUserRoleInput } from '../../../api/types/control/change-user-role.input';
import { toast } from 'react-toastify';
import { useAuth } from '../../../context/auth';

interface AccountsModalProps {
  handleClose: () => void;
}

const userRoleOptions = Object.values(UserRole);

interface UserRowProps {
  user: UserDto;
  refetchUsers: () => void;
  checkRoleAndClose: () => Promise<void>;
}

const UserRow: React.FC<UserRowProps> = React.memo(({ user, refetchUsers, checkRoleAndClose }) => {
  const [selectedRole, setSelectedRole] = useState(user.role || '');
  const changeRoleMutation = useChangeUserRoleMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (user.role) setSelectedRole(user.role);
  }, [user.role]);

  const handleRoleChange = async () => {
    if (!user.id || !selectedRole) return;
    setIsChanging(true);
    const input: ChangeUserRoleInput = {
      userId: user.id,
      newRole: selectedRole as UserRole,
    };

    try {
      await changeRoleMutation.mutateAsync(input);
      toast.success(`Роль користувача ${user.login} успішно змінено на ${selectedRole}`);
      refetchUsers();
      checkRoleAndClose();
    } catch (error) {
      toast.error(`Не вдалося змінити роль користувача: ${error}`);
      setSelectedRole(user.role || '');
    } finally {
      setIsChanging(false);
    }
  };

  const handleDelete = async () => {
    if (!user.id) return;
    if (!window.confirm(`Ви впевнені, що хочете видалити користувача ${user.login}?`)) return;

    try {
      await deleteUserMutation.mutateAsync(user.id);
      toast.success(`Користувача ${user.login} успішно видалено.`);
      refetchUsers();
    } catch (error) {
      toast.error(`Не вдалося видалити користувача: ${error}`);
    }
  };

  const isRoleDifferent = user.role !== selectedRole;

  return (
    <div className={styles.userRow}>
      <div className={styles.userInfo}>
        <div className={styles.userLogin} title={user.login}>{user.login}</div>
        <div className={styles.userId} title={user.id}>ID: {user.id}</div>
      </div>

      <div className={styles.userControls}>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          disabled={isChanging}
        >
          {userRoleOptions.map((role) => (
            <option key={role} value={role}>
              {role.toUpperCase()}
            </option>
          ))}
        </select>
        <button
          className={styles.changeRoleButton}
          onClick={handleRoleChange}
          disabled={!isRoleDifferent || isChanging}
        >
          {isChanging ? (
            <ScaleLoader color="#fff" height={15} width={3} radius={2} margin={2} />
          ) : (
            'Змінити'
          )}
        </button>
        <IoTrash
          className={styles.deleteIcon}
          onClick={handleDelete}
          title="Видалити користувача"
        />
      </div>
    </div>
  );
});

const AddAllowedUserForm: React.FC<{ refetchAllowedUsers: () => void }> = ({
  refetchAllowedUsers,
}) => {
  const [login, setLogin] = useState('');
  const [role, setRole] = useState(UserRole.ADMIN);
  const addAllowedUserMutation = useAddAllowedUserMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login) {
      toast.error('Введіть логін.');
      return;
    }

    const input: AddAllowedUserInput = {
      login,
      role,
    };

    try {
      await addAllowedUserMutation.mutateAsync(input);
      toast.success(`Користувач ${login} успішно доданий до дозволених.`);
      setLogin('');
      refetchAllowedUsers();
    } catch (error) {
      toast.error(`Не вдалося додати (можливо вже існує): ${error}`);
    }
  };

  return (
    <form className={styles.addAllowedUserForm} onSubmit={handleSubmit}>
      <h3>Додати дозволеного користувача</h3>
      <div className={styles.formFields}>
        <input
          type="text"
          placeholder="Логін користувача"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          disabled={addAllowedUserMutation.isPending}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          disabled={addAllowedUserMutation.isPending}
        >
          {userRoleOptions.map((role) => (
            <option key={role} value={role}>
              {role.toUpperCase()}
            </option>
          ))}
        </select>
        <button type="submit" disabled={addAllowedUserMutation.isPending || !login}>
          {addAllowedUserMutation.isPending ? (
            <ScaleLoader color="#fff" height={18} width={3} radius={2} margin={2} />
          ) : (
            <><IoAddCircleOutline /> Додати</>
          )}
        </button>
      </div>
    </form>
  );
};


interface AllowedUserRowProps {
  user: UserDto;
  refetchAllowedUsers: () => void;
}

const AllowedUserRow: React.FC<AllowedUserRowProps> = ({ user, refetchAllowedUsers }) => {
  const deleteAllowedUserMutation = useDeleteAllowedUserMutation();

  const handleDelete = async () => {
    if (!user.id) return;
    if (!window.confirm(`Ви впевнені, що хочете видалити дозволеного користувача ${user.login}?`)) return;

    try {
      await deleteAllowedUserMutation.mutateAsync(user.id);
      toast.success(`Дозволеного користувача ${user.login} успішно видалено.`);
      refetchAllowedUsers();
    } catch (error) {
      toast.error(`Не вдалося видалити дозволеного користувача: ${error}`);
    }
  };

  return (
    <div className={styles.allowedUserRow}>
      <span className={styles.allowedUserLogin}>{user.login}</span>
      <span className={styles.allowedUserRole}>{user.role?.toUpperCase() || 'N/A'}</span>
      <IoTrash
        className={styles.deleteIcon}
        onClick={handleDelete}
        title="Видалити дозволеного користувача"
      />
    </div>
  );
};


const AccountsModal: React.FC<AccountsModalProps> = ({ handleClose }) => {
  const { refetchSession } = useAuth();
  const { data: registeredUsers, isLoading: isLoadingUsers, refetch: refetchUsers } = useGetUsersQuery();
  const { data: allowedUsers, isLoading: isLoadingAllowed, refetch: refetchAllowedUsers } = useGetAllowedUsersQuery();

  const [activeSlide, setActiveSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkRoleAndClose = useCallback(async () => {

    const result = await refetchSession();

    if (result.data?.role !== UserRole.SUPER_ADMIN) {
      toast.warn('Ваша роль змінилася, і ви більше не є суперадміном. Модальне вікно закрито.');
      handleClose();
    }
  }, [refetchSession, handleClose]);


  const handleRefetch = useCallback(() => {
    refetchUsers();
    refetchAllowedUsers();
  }, [refetchUsers, refetchAllowedUsers]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const newActiveSlide = Math.round(scrollLeft / clientWidth);
      if (newActiveSlide !== activeSlide) {
        setActiveSlide(newActiveSlide);
      }
    }
  };

  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const width = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.header}>
        <h2>Адміністрування користувачів</h2>
        <div className={styles.headerActions}>
          <IoClose className={styles.closeIcon} onClick={handleClose} />
        </div>
      </div>

      <div className={styles.sliderContainer}>
        <div
            className={styles.accountsScrollArea}
            ref={scrollContainerRef}
            onScroll={handleScroll}
        >
          <div className={styles.registeredUsersSection}>
            <h3 className={styles.sectionHeader}>Зареєстровані ({registeredUsers?.length || 0})</h3>
            <p className={styles.sectionDescription}>
              Користувачі, які пройшли реєстрацію. Зміна ролей та видалення.
            </p>
            <div className={styles.userList}>
              {isLoadingUsers ? (
                <div className={styles.loaderCenter}>
                   <ScaleLoader color="#10b981" height={40} width={5} radius={4} margin={3} />
                </div>
              ) : registeredUsers && registeredUsers.length > 0 ? (
                registeredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    refetchUsers={handleRefetch}
                    checkRoleAndClose={checkRoleAndClose}
                  />
                ))
              ) : (
                <p className={styles.emptyMessage}>Список порожній.</p>
              )}
            </div>
          </div>

          <div className={styles.allowedUsersSection}>
            <h3 className={styles.sectionHeader}>Реєстр дозволених ({allowedUsers?.length || 0})</h3>
            <p className={styles.sectionDescription}>
              Список логінів (whitelist).
            </p>

            <AddAllowedUserForm refetchAllowedUsers={handleRefetch} />

            <div className={styles.allowedUserList}>
               {isLoadingAllowed ? (
                 <div className={styles.loaderCenter}>
                   <ScaleLoader color="#10b981" height={40} width={5} radius={4} margin={3} />
                 </div>
              ) : allowedUsers && allowedUsers.length > 0 ? (
                allowedUsers.map((user) => (
                  <AllowedUserRow
                    key={user.id}
                    user={user}
                    refetchAllowedUsers={handleRefetch}
                  />
                ))
              ) : (
                <p className={styles.emptyMessage}>Реєстр порожній.</p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.indicators}>
            <div
                className={`${styles.dot} ${activeSlide === 0 ? styles.active : ''}`}
                onClick={() => scrollToSlide(0)}
            />
            <div
                className={`${styles.dot} ${activeSlide === 1 ? styles.active : ''}`}
                onClick={() => scrollToSlide(1)}
            />
        </div>
      </div>
    </div>
  );
};

export default AccountsModal;
