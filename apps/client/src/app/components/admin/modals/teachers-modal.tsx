import React, { useState, useEffect, useMemo } from 'react';
import { IoClose } from 'react-icons/io5';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import styles from './teachers.module.scss';
import {
  useFindAllTeachersQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
} from '../../../hooks/useTeacherQueries';
import { TeacherPost } from '../../../api/types/enums/TeacherPost.enum';

interface TeachersModalProps {
  handleClose: () => void;
  onSelect?: (id: string, name: string) => void;
}


const postOptions = [
  { value: TeacherPost.ASSISTANT, label: 'Асистент' },
  { value: TeacherPost.TEACHER, label: 'Викладач' },
  { value: TeacherPost.SENIOR_TEACHER, label: 'Старший викладач' },
  { value: TeacherPost.DOCENT, label: 'Доцент' },
  { value: TeacherPost.PROFESSOR, label: 'Професор' },
];

const TeachersModal: React.FC<TeachersModalProps> = ({ handleClose, onSelect }) => {
  const { data: teachersResponse, isLoading: isTeachersLoading, refetch } = useFindAllTeachersQuery();
  const createMutation = useCreateTeacherMutation();
  const updateMutation = useUpdateTeacherMutation();
  const deleteMutation = useDeleteTeacherMutation();

  const teachers = useMemo(() => teachersResponse?.teachers || [], [teachersResponse]);

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('new');
  const [filterName, setFilterName] = useState<string>('');

  const [fullName, setFullName] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [post, setPost] = useState<TeacherPost>(TeacherPost.ASSISTANT);

  const isLoading =
    isTeachersLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  useEffect(() => {
    if (selectedTeacherId === 'new') {
      setFullName('');
      setDepartment('');
      setPost(TeacherPost.ASSISTANT);
    } else {
      const teacher = teachers.find((t) => t.id === selectedTeacherId);
      if (teacher) {
        setFullName(teacher.fullName || '');
        setDepartment(teacher.department || '');
        setPost(teacher.post || TeacherPost.ASSISTANT);
      }
    }
  }, [selectedTeacherId, teachers]);

  const handleTeacherSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeacherId(e.target.value);
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.fullName?.toLowerCase().includes(filterName.toLowerCase())
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

  const handleAddTeacher = async () => {
    if (!fullName || !department) {
      toast.warn('Будь ласка, заповніть ім\'я та кафедру.');
      return;
    }

    try {
      await createMutation.mutateAsync({ fullName, department, post });
      toast.success('Вчителя додано успішно');
      setFullName('');
      setDepartment('');
      setPost(TeacherPost.ASSISTANT);
      refetch();
    } catch (error) {
      handleError(error, 'Помилка додавання вчителя');
    }
  };

  const handleUpdateTeacher = async () => {
    if (selectedTeacherId === 'new') return;

    try {
      await updateMutation.mutateAsync({
        id: selectedTeacherId,
        input: { fullName, department, post },
      });
      toast.success('Вчителя оновлено успішно');
      refetch();
    } catch (error) {
      handleError(error, 'Помилка оновлення вчителя');
    }
  };

  const handleDeleteTeacher = async () => {
    if (selectedTeacherId === 'new') return;
    if (!window.confirm(`Ви впевнені, що хочете видалити вчителя ${fullName}?`)) return;

    try {
      await deleteMutation.mutateAsync(selectedTeacherId);
      toast.success('Вчителя видалено успішно');
      setSelectedTeacherId('new');
      setFullName('');
      setDepartment('');
      setPost(TeacherPost.ASSISTANT);
      refetch();
    } catch (error) {
      handleError(error, 'Помилка видалення вчителя');
    }
  };

  const handleSelectTeacherForSchedule = () => {
    if (onSelect && selectedTeacherId !== 'new') {
      const teacher = teachers.find((t) => t.id === selectedTeacherId);
      if (teacher && teacher.id && teacher.fullName) {
        onSelect(teacher.id, teacher.fullName);
        handleClose();
      }
    }
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.header}>
        <h2>Вчителі</h2>
        <div className={styles.headerActions}>
          <IoClose className={styles.closeIcon} onClick={handleClose} />
        </div>
      </div>

      <div className={styles.formArea}>
        <select
          value={selectedTeacherId}
          onChange={handleTeacherSelect}
          className={styles.selectInput}
        >
          <option value="new">Додати вчителя</option>
          {filteredTeachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Фільтр за ім'ям"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className={styles.filterInput}
        />

        <label className={styles.teacherLabel}>ПІБ вчителя:</label>
        <input
          type="text"
          placeholder="Введіть ПІБ"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
          className={styles.teacherInput}
        />

        <label className={styles.teacherLabel}>Кафедра / Факультет:</label>
        <input
          type="text"
          placeholder="Введіть кафедру"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          disabled={isLoading}
          className={styles.teacherInput}
        />

        <label className={styles.teacherLabel}>Посада:</label>
        <select
          value={post}
          onChange={(e) => setPost(e.target.value as TeacherPost)}
          disabled={isLoading}
          className={styles.selectInput}
          style={{ marginBottom: '20px' }}
        >
          {postOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className={styles.buttonContainer}>
          {selectedTeacherId === 'new' ? (
            <button
              onClick={handleAddTeacher}
              disabled={isLoading}
              className={styles.primaryButton}
            >
              {createMutation.isPending ? <ScaleLoader height={15} color="#fff" /> : 'Додати вчителя'}
            </button>
          ) : (
            <>
              <button
                onClick={handleUpdateTeacher}
                disabled={isLoading}
                className={styles.primaryButton}
              >
                {updateMutation.isPending ? <ScaleLoader height={15} color="#fff" /> : 'Редагувати вчителя'}
              </button>

              {onSelect && (
                <button
                  onClick={handleSelectTeacherForSchedule}
                  className={styles.selectButton}
                >
                  Вибрати цього вчителя
                </button>
              )}

              <button
                onClick={handleDeleteTeacher}
                disabled={isLoading}
                className={styles.deleteButton}
              >
                {deleteMutation.isPending ? <ScaleLoader height={15} color="#fff" /> : 'Видалити вчителя'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachersModal;
