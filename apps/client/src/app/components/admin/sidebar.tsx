import React, { useState } from 'react';
import { IoChevronBack, IoChevronForward, IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './sidebar.module.scss';
import { useAuth } from '../../context/auth';
import { UserRole } from '../../api/types/enums/user-role.enum';
import {
    useChangeLoginMutation,
    useChangePasswordMutation,
    useDeleteAccountMutation,
} from '../../hooks/useProfileQueries';
import { OpenWindow } from './modal';

interface SidebarProps {
    setWindow: (window: OpenWindow) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setWindow }) => {
    const [isMenuCollapsed, setIsMenuCollapsed] = useState<boolean>(false);
    const [isAccountMenuCollapsed, setIsAccountMenuCollapsed] = useState<boolean>(false);
    const [isManagementMenuCollapsed, setIsManagementMenuCollapsed] = useState<boolean>(false);
    const [isControlMenuCollapsed, setIsControlMenuCollapsed] = useState<boolean>(false);
    const { session, logout } = useAuth();
    const navigate = useNavigate();

    const { mutate: changeLoginMutate } = useChangeLoginMutation();
    const { mutate: changePasswordMutate } = useChangePasswordMutation();
    const { mutate: deleteAccountMutate } = useDeleteAccountMutation();

    const adminName = session?.role === UserRole.SUPER_ADMIN ? "Супер Адмін" : "Адмін";

    const handleHomeClick = () => {
    navigate('/');
    };

    const handleLogout = () => {
        logout();
    };

    const handleChangeLogin = () => {
        const newLogin = prompt('Введіть новий логін:');
        if (!newLogin || newLogin.trim() === '') {
            return;
        }

        changeLoginMutate(
            { newLogin },
            {
                onSuccess: () => {
                    toast.success('Логін успішно змінено.');
                },
                onError: (error) => {
                    toast.error(error.message || 'Не вдалося змінити логін.');
                },
            },
        );
    };

    const handleChangePassword = () => {
        const currentPassword = prompt('Введіть поточний пароль:');
        if (!currentPassword || currentPassword.trim() === '') {
            return;
        }
        const newPassword = prompt('Введіть новий пароль:');
        if (!newPassword || newPassword.trim() === '') {
            return;
        }
        const confirmPassword = prompt('Підтвердіть новий пароль:');
        if (newPassword !== confirmPassword) {
            toast.error('Паролі не співпадають.');
            return;
        }

        changePasswordMutate(
            { currentPassword, newPassword },
            {
                onSuccess: () => {
                    toast.success('Пароль успішно змінено.');
                },
                onError: (error) => {
                    toast.error(error.message || 'Не вдалося змінити пароль.');
                },
            },
        );
    };

    const handleDeleteAccount = () => {
        const confirmation = window.confirm('Ви впевнені, що хочете видалити свій обліковий запис? Ця дія є незворотною.');

        if (confirmation) {
            deleteAccountMutate(undefined, {
                onSuccess: () => {
                    toast.success('Обліковий запис успішно видалено.');
                    logout();
                },
                onError: (error) => {
                    toast.error(error.message || 'Не вдалося видалити обліковий запис.');
                },
            });
        }
    };

    return (
        <div className={`${styles.sidebar} ${isMenuCollapsed ? styles.collapsed : ''}`}>
            <button
                className={styles['collapse-button']}
                onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
            >
                {!isMenuCollapsed && (
                    <span className={styles['admin-name']} title={adminName}>
                        {adminName}
                    </span>
                )}
                {isMenuCollapsed ? <IoChevronForward /> : <IoChevronBack />}
            </button>

            {!isMenuCollapsed && (
                <div className={styles['menu-container']}>
                    <div className={styles['account-menu']}>
                        <h3 onClick={() => setIsAccountMenuCollapsed(!isAccountMenuCollapsed)}>
                            Меню акаунту
                            {isAccountMenuCollapsed ? <IoChevronDown /> : <IoChevronUp />}
                        </h3>
                        <div className={`${styles['menu-content']} ${isAccountMenuCollapsed ? styles.collapsed : ''}`}>

                            <button onClick={handleHomeClick}>На головну</button>
                            <button onClick={handleLogout}>Вийти з акаунта</button>
                            <button onClick={handleChangeLogin} className={styles['change-info-button']}>Змінити логін</button>
                            <button onClick={handleChangePassword} className={styles['change-info-button']}>Змінити пароль</button>
                            <button
                                onClick={handleDeleteAccount}
                                className={styles['delete-account-button']}
                            >
                                Видалити акаунт
                            </button>
                        </div>
                    </div>

                    <div className={styles['management-menu']}>
                        <h3 onClick={() => setIsManagementMenuCollapsed(!isManagementMenuCollapsed)}>
                            Меню керування
                            {isManagementMenuCollapsed ? <IoChevronDown /> : <IoChevronUp />}
                        </h3>
                        <div className={`${styles['menu-content']} ${isManagementMenuCollapsed ? styles.collapsed : ''}`}>
                            <button onClick={() => setWindow('Plan')}>Предмети</button>
                            <button onClick={() => setWindow('Groups')}>Групи</button>
                            <button onClick={() => setWindow('Teachers')}>Вчителі</button>
                            <button onClick={() => setWindow('Additional')}>Додатково</button>
                        </div>
                    </div>

                    {session?.role === UserRole.SUPER_ADMIN && (
                        <div className={styles['control-menu']}>
                            <h3 onClick={() => setIsControlMenuCollapsed(!isControlMenuCollapsed)}>
                                Меню контролю
                                {isControlMenuCollapsed ? <IoChevronDown /> : <IoChevronUp />}
                            </h3>
                            <div className={`${styles['menu-content']} ${isControlMenuCollapsed ? styles.collapsed : ''}`}>
                                <button onClick={() => setWindow('Accounts')}>Акаунти</button>
                                <button onClick={() => setWindow('Logs')}>Логи</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Sidebar;
