import React, { useState, useEffect, useMemo } from 'react';
import { IoClose } from 'react-icons/io5';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import styles from './groups.module.scss';
import {
  useFindAllGroupsQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
} from '../../../hooks/useGroupsQueries';

interface GroupsModalProps {
  handleClose: () => void;
  onSelect?: (id: string, name: string) => void;
}

const GroupsModal: React.FC<GroupsModalProps> = ({ handleClose, onSelect }) => {
  const { data: groupsResponse, isLoading: isGroupsLoading, refetch } = useFindAllGroupsQuery();
  const createMutation = useCreateGroupMutation();
  const updateMutation = useUpdateGroupMutation();
  const deleteMutation = useDeleteGroupMutation();

  const groups = useMemo(() => groupsResponse?.groups || [], [groupsResponse]);

  const [selectedGroupId, setSelectedGroupId] = useState<string>('new');
  const [filterGroupName, setFilterGroupName] = useState<string>('');

  const [groupCode, setGroupCode] = useState<string>('');
  const [faculty, setFaculty] = useState<string>('');

  const isLoading =
    isGroupsLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  useEffect(() => {
    if (selectedGroupId === 'new') {
      setGroupCode('');
      setFaculty('');
    } else {
      const group = groups.find((g) => g.id === selectedGroupId);
      if (group) {
        setGroupCode(group.groupCode || '');
        setFaculty(group.faculty || '');
      }
    }
  }, [selectedGroupId, groups]);

  const handleGroupSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroupId(e.target.value);
  };

  const filteredGroups = groups.filter((group) =>
    group.groupCode?.toLowerCase().includes(filterGroupName.toLowerCase())
  );

  const handleError = (error: unknown, action: string) => {
    let message = 'Невідома помилка';
    if (error instanceof AxiosError) {
        message = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
        message = error.message;
    }
    toast.error(`${action}: ${message}`);
  };

  const handleAddGroup = async () => {
    if (!groupCode || !faculty) {
      toast.warn('Будь ласка, заповніть всі поля.');
      return;
    }

    try {
      await createMutation.mutateAsync({ groupCode, faculty });
      toast.success('Група додана успішно');
      setGroupCode('');
      setFaculty('');
      refetch();
    } catch (error) {
      handleError(error, 'Помилка додавання групи');
    }
  };

  const handleUpdateGroup = async () => {
    if (selectedGroupId === 'new') return;

    try {
      await updateMutation.mutateAsync({
        id: selectedGroupId,
        input: { groupCode, faculty },
      });
      toast.success('Група оновлена успішно');
      refetch();
    } catch (error) {
      handleError(error, 'Помилка оновлення групи');
    }
  };

  const handleDeleteGroup = async () => {
    if (selectedGroupId === 'new') return;
    if (!window.confirm(`Ви впевнені, що хочете видалити групу ${groupCode}?`)) return;

    try {
      await deleteMutation.mutateAsync(selectedGroupId);
      toast.success('Група видалена успішно');
      setSelectedGroupId('new');
      setGroupCode('');
      setFaculty('');
      refetch();
    } catch (error) {
      handleError(error, 'Помилка видалення групи');
    }
  };

  const handleSelectGroupForSchedule = () => {
    if (onSelect && selectedGroupId !== 'new') {
        const group = groups.find(g => g.id === selectedGroupId);
        if (group && group.id && group.groupCode) {
            onSelect(group.id, group.groupCode);
            handleClose();
        }
    }
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.header}>
        <h2>Групи</h2>
        <div className={styles.headerActions}>
          <IoClose className={styles.closeIcon} onClick={handleClose} />
        </div>
      </div>

      <div className={styles.formArea}>
        <select
            value={selectedGroupId}
            onChange={handleGroupSelect}
            className={styles.selectInput}
        >
            <option value="new">Додати групу</option>
            {filteredGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.groupCode}
              </option>
            ))}
        </select>

        <input
            type="text"
            placeholder="Фільтр за назвою групи"
            value={filterGroupName}
            onChange={(e) => setFilterGroupName(e.target.value)}
            className={styles.filterInput}
        />

        <label className={styles.groupLabel}>Ім'я групи:</label>
        <input
            type="text"
            placeholder="Введіть ім'я групи"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
            disabled={isLoading}
            className={styles.groupInput}
        />

        <label className={styles.groupLabel}>Факультет:</label>
        <input
            type="text"
            placeholder="Введіть факультет"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            disabled={isLoading}
            className={styles.groupInput}
        />

        <div className={styles.buttonContainer}>
            {selectedGroupId === 'new' ? (
                <button
                    onClick={handleAddGroup}
                    disabled={isLoading}
                    className={styles.primaryButton}
                >
                     {createMutation.isPending ? <ScaleLoader height={15} color="#fff" /> : 'Додати групу'}
                </button>
            ) : (
                <>
                    <button
                        onClick={handleUpdateGroup}
                        disabled={isLoading}
                        className={styles.primaryButton}
                    >
                        {updateMutation.isPending ? <ScaleLoader height={15} color="#fff" /> : 'Редагувати групу'}
                    </button>

                    {onSelect && (
                         <button
                            onClick={handleSelectGroupForSchedule}
                            className={styles.selectButton}
                         >
                            Вибрати цю групу
                         </button>
                    )}

                    <button
                        onClick={handleDeleteGroup}
                        disabled={isLoading}
                        className={styles.deleteButton}
                    >
                        {deleteMutation.isPending ? <ScaleLoader height={15} color="#fff" /> : 'Видалити групу'}
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default GroupsModal;
