import React, { useState, useEffect, useMemo } from 'react';
import { IoClose, IoAdd, IoTrash } from 'react-icons/io5';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import styles from './plan.module.scss';
import {
  useFindAllCurriculumsQuery,
  useCreateCurriculumMutation,
  useUpdateCurriculumMutation,
  useDeleteCurriculumMutation,
} from '../../../hooks/useCurriculumQueries';
import { useFindAllTeachersQuery } from '../../../hooks/useTeacherQueries';
import { useFindAllGroupsQuery } from '../../../hooks/useGroupsQueries';
import { RelatedTeacherInput } from '../../../api/types/curriculum/related-teacher.input';
import { RelatedGroupInput } from '../../../api/types/curriculum/related-group.input';

interface PlanModalProps {
  handleClose: () => void;
}

const PlanModal: React.FC<PlanModalProps> = ({ handleClose }) => {
  const { data: curriculumsResponse, isLoading: isCurriculumsLoading, refetch } = useFindAllCurriculumsQuery();
  const { data: teachersResponse } = useFindAllTeachersQuery();
  const { data: groupsResponse } = useFindAllGroupsQuery();

  const createMutation = useCreateCurriculumMutation();
  const updateMutation = useUpdateCurriculumMutation();
  const deleteMutation = useDeleteCurriculumMutation();

  const curriculums = useMemo(() => curriculumsResponse?.curriculums || [], [curriculumsResponse]);
  const teachers = useMemo(() => teachersResponse?.teachers || [], [teachersResponse]);
  const groups = useMemo(() => groupsResponse?.groups || [], [groupsResponse]);

  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('new');
  const [filterName, setFilterName] = useState<string>('');

  const [subjectName, setSubjectName] = useState<string>('');
  const [relatedTeachers, setRelatedTeachers] = useState<RelatedTeacherInput[]>([]);
  const [relatedGroups, setRelatedGroups] = useState<RelatedGroupInput[]>([]);

  const [teacherToAdd, setTeacherToAdd] = useState<string>('');
  const [groupToAdd, setGroupToAdd] = useState<string>('');

  const [teacherListFilter, setTeacherListFilter] = useState<string>('');
  const [groupListFilter, setGroupListFilter] = useState<string>('');

  const isLoading =
    isCurriculumsLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  useEffect(() => {
    setTeacherListFilter('');
    setGroupListFilter('');

    if (selectedCurriculumId === 'new') {
      setSubjectName('');
      setRelatedTeachers([]);
      setRelatedGroups([]);
    } else {
      const curriculum = curriculums.find((c) => c.id === selectedCurriculumId);
      if (curriculum) {
        setSubjectName(curriculum.subjectName || '');

        setRelatedTeachers(
          curriculum.relatedTeachers?.map(t => ({
            id: t.id,
            plannedLectures: t.plannedLectures || 0,
            plannedPracticals: t.plannedPracticals || 0,
            plannedLabs: t.plannedLabs || 0,
          })) || []
        );

        setRelatedGroups(
          curriculum.relatedGroups?.map(g => ({
            id: g.id,
            plannedLectures: g.plannedLectures || 0,
            plannedPracticals: g.plannedPracticals || 0,
            plannedLabs: g.plannedLabs || 0,
          })) || []
        );
      }
    }
  }, [selectedCurriculumId, curriculums]);

  const handleCurriculumSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCurriculumId(e.target.value);
  };

  const filteredCurriculums = curriculums.filter((c) =>
    c.subjectName?.toLowerCase().includes(filterName.toLowerCase())
  );

  const filteredTeacherOptions = useMemo(() => {
    return teachers.filter(t => (t.fullName ?? '').toLowerCase().includes(teacherListFilter.toLowerCase()));
  }, [teachers, teacherListFilter]);

  const filteredGroupOptions = useMemo(() => {
    return groups.filter(g => (g.groupCode ?? '').toLowerCase().includes(groupListFilter.toLowerCase()));
  }, [groups, groupListFilter]);

  const handleError = (error: unknown, action: string) => {
    let message = 'Невідома помилка';
    if (error instanceof AxiosError) {
      message = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    toast.error(`${action}: ${message}`);
  };

  const addTeacher = () => {
    if (!teacherToAdd) return;
    if (relatedTeachers.some(t => t.id === teacherToAdd)) {
        toast.warn('Цей вчитель вже доданий');
        return;
    }
    setRelatedTeachers([...relatedTeachers, { id: teacherToAdd, plannedLectures: 0, plannedPracticals: 0, plannedLabs: 0 }]);
    setTeacherToAdd('');
  };

  const removeTeacher = (id: string) => {
    setRelatedTeachers(relatedTeachers.filter(t => t.id !== id));
  };

  const updateTeacherHours = (id: string, field: keyof RelatedTeacherInput, value: number) => {
    setRelatedTeachers(relatedTeachers.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addGroup = () => {
    if (!groupToAdd) return;
    if (relatedGroups.some(g => g.id === groupToAdd)) {
        toast.warn('Ця група вже додана');
        return;
    }
    setRelatedGroups([...relatedGroups, { id: groupToAdd, plannedLectures: 0, plannedPracticals: 0, plannedLabs: 0 }]);
    setGroupToAdd('');
  };

  const removeGroup = (id: string) => {
    setRelatedGroups(relatedGroups.filter(g => g.id !== id));
  };

  const updateGroupHours = (id: string, field: keyof RelatedGroupInput, value: number) => {
    setRelatedGroups(relatedGroups.map(g => g.id === id ? { ...g, [field]: value } : g));
  };


  const handleCreate = async () => {
    if (!subjectName) {
      toast.warn('Введіть назву предмету');
      return;
    }
    try {
      await createMutation.mutateAsync({
        subjectName,
        relatedTeachers,
        relatedGroups
      });
      toast.success('Предмет створено');
      setSubjectName('');
      setRelatedTeachers([]);
      setRelatedGroups([]);
      setTeacherListFilter('');
      setGroupListFilter('');
      refetch();
    } catch (error) {
      handleError(error, 'Помилка створення');
    }
  };

  const handleUpdate = async () => {
    if (selectedCurriculumId === 'new') return;
    try {
      await updateMutation.mutateAsync({
        id: selectedCurriculumId,
        input: {
            subjectName,
            relatedTeachers,
            relatedGroups
        },
      });
      toast.success('Предмет оновлено');
      setTeacherListFilter('');
      setGroupListFilter('');
      refetch();
    } catch (error) {
      handleError(error, 'Помилка оновлення');
    }
  };

  const handleDelete = async () => {
    if (selectedCurriculumId === 'new') return;
    if (!window.confirm(`Видалити предмет ${subjectName}?`)) return;
    try {
      await deleteMutation.mutateAsync(selectedCurriculumId);
      toast.success('Предмет видалено');
      setSelectedCurriculumId('new');
      setTeacherListFilter('');
      setGroupListFilter('');
      refetch();
    } catch (error) {
      handleError(error, 'Помилка видалення');
    }
  };

  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.fullName || id;
  const getGroupName = (id: string) => groups.find(g => g.id === id)?.groupCode || id;

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.header}>
        <h2>Навчальний план</h2>
        <div className={styles.headerActions}>
          <IoClose className={styles.closeIcon} onClick={handleClose} />
        </div>
      </div>

      <div className={styles.formArea}>
        <div>
            <label className={styles.inputLabel}>Оберіть предмет для редагування:</label>
            <select
            value={selectedCurriculumId}
            onChange={handleCurriculumSelect}
            className={styles.selectInput}
            >
            <option value="new">Додати предмет</option>
            {filteredCurriculums.map((c) => (
                <option key={c.id} value={c.id}>
                {c.subjectName}
                </option>
            ))}
            </select>
        </div>

        <input
          type="text"
          placeholder="Фільтр за назвою"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className={styles.filterInput}
        />

        <div>
            <label className={styles.inputLabel}>Назва предмету:</label>
            <input
            type="text"
            placeholder="Введіть назву"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className={styles.mainInput}
            />
        </div>

        <div>
            <label className={styles.inputLabel}>Пов'язані вчителі:</label>
            <div className={styles.relatedListContainer}>
                <input
                    type="text"
                    placeholder="Пошук вчителя..."
                    value={teacherListFilter}
                    onChange={(e) => setTeacherListFilter(e.target.value)}
                    className={styles.filterInput}
                />

                <div className={styles.addRelationRow}>
                    <select
                        value={teacherToAdd}
                        onChange={(e) => setTeacherToAdd(e.target.value)}
                        className={styles.selectInput}
                    >
                        <option value="">Оберіть вчителя</option>
                        {filteredTeacherOptions.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                    </select>
                    <button onClick={addTeacher} className={styles.addButton} title="Додати вчителя"><IoAdd /></button>
                </div>

                {relatedTeachers.map((rt, idx) => {
                    const teacherId = rt.id || '';
                    return (
                        <div key={idx} className={styles.relatedItemRow}>
                            <span className={styles.itemName} title={getTeacherName(teacherId)}>{getTeacherName(teacherId)}</span>
                            <input type="number" className={styles.hourInput} placeholder="Лек" title="Лекції" value={rt.plannedLectures} onChange={e => updateTeacherHours(teacherId, 'plannedLectures', +e.target.value)} />
                            <input type="number" className={styles.hourInput} placeholder="Прак" title="Практики" value={rt.plannedPracticals} onChange={e => updateTeacherHours(teacherId, 'plannedPracticals', +e.target.value)} />
                            <input type="number" className={styles.hourInput} placeholder="Лаб" title="Лабораторні" value={rt.plannedLabs} onChange={e => updateTeacherHours(teacherId, 'plannedLabs', +e.target.value)} />
                            <IoTrash className={styles.deleteIcon} onClick={() => removeTeacher(teacherId)} title="Видалити зі списку" />
                        </div>
                    );
                })}
            </div>
        </div>

        <div>
            <label className={styles.inputLabel}>Пов'язані групи:</label>
            <div className={styles.relatedListContainer}>
                <input
                    type="text"
                    placeholder="Пошук групи..."
                    value={groupListFilter}
                    onChange={(e) => setGroupListFilter(e.target.value)}
                    className={styles.filterInput}
                />

                <div className={styles.addRelationRow}>
                    <select
                        value={groupToAdd}
                        onChange={(e) => setGroupToAdd(e.target.value)}
                        className={styles.selectInput}
                    >
                        <option value="">Оберіть групу</option>
                        {filteredGroupOptions.map(g => <option key={g.id} value={g.id}>{g.groupCode}</option>)}
                    </select>
                    <button onClick={addGroup} className={styles.addButton} title="Додати групу"><IoAdd /></button>
                </div>

                {relatedGroups.map((rg, idx) => {
                    const groupId = rg.id || '';
                    return (
                        <div key={idx} className={styles.relatedItemRow}>
                            <span className={styles.itemName} title={getGroupName(groupId)}>{getGroupName(groupId)}</span>
                            <input type="number" className={styles.hourInput} placeholder="Лек" title="Лекції" value={rg.plannedLectures} onChange={e => updateGroupHours(groupId, 'plannedLectures', +e.target.value)} />
                            <input type="number" className={styles.hourInput} placeholder="Прак" title="Практики" value={rg.plannedPracticals} onChange={e => updateGroupHours(groupId, 'plannedPracticals', +e.target.value)} />
                            <input type="number" className={styles.hourInput} placeholder="Лаб" title="Лабораторні" value={rg.plannedLabs} onChange={e => updateGroupHours(groupId, 'plannedLabs', +e.target.value)} />
                            <IoTrash className={styles.deleteIcon} onClick={() => removeGroup(groupId)} title="Видалити зі списку" />
                        </div>
                    );
                })}
            </div>
        </div>

        <div className={styles.buttonContainer}>
          {selectedCurriculumId === 'new' ? (
            <button
              onClick={handleCreate}
              disabled={isLoading}
              className={styles.primaryButton}
            >
              {createMutation.isPending ? <ScaleLoader height={15} color="#fff" /> : 'Створити предмет'}
            </button>
          ) : (
            <>
              <button
                onClick={handleUpdate}
                disabled={isLoading}
                className={styles.primaryButton}
              >
                {updateMutation.isPending ? <ScaleLoader height={15} color="#fff" /> : 'Оновити предмет'}
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className={styles.deleteButton}
              >
                {deleteMutation.isPending ? <ScaleLoader height={15} color="#fff" /> : 'Видалити предмет'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanModal;
