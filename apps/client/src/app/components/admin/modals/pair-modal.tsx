import React, { useState, useEffect, useMemo } from 'react';
import { IoClose, IoAdd, IoTrash } from 'react-icons/io5';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import styles from './pair.module.scss';

import { SemesterNumber } from '../../../api/types/enums/SemesterNumber.enum';
import { LessonType } from '../../../api/types/enums/LessonType.enum';
import { VisitFormat } from '../../../api/types/enums/VisitFormat.enum';
import { WeekNumber } from '../../../api/types/enums/WeekNumber.enum';
import { DayNumber } from '../../../api/types/enums/DayNumber.enum';
import { PairNumber } from '../../../api/types/enums/PairNumber.enum';

import {
  useAddPairMutation,
  useEditPairMutation,
  useDeletePairMutation,
  useGetPairInfoQuery
} from '../../../hooks/useScheduleQueries';
import { useFindAllCurriculumsQuery } from '../../../hooks/useCurriculumQueries';
import { useFindAllTeachersQuery } from '../../../hooks/useTeacherQueries';
import { useFindAllGroupsQuery } from '../../../hooks/useGroupsQueries';
import { AddPairDto } from '../../../api/types/schedule/add-pair.dto';
import { EditPairDto } from '../../../api/types/schedule/edit-pair.dto';

export interface PairModalData {
    pairId?: string | null;
    semester: SemesterNumber;
    week: WeekNumber;
    day: DayNumber;
    pair: PairNumber;
    subjectName?: string;
    contextGroupId?: string;
    contextTeacherId?: string;
}

interface PairModalProps {
  handleClose: () => void;
  data?: PairModalData | null;
}

const PairModal: React.FC<PairModalProps> = ({ handleClose, data }) => {
  const {
    pairId,
    semester = SemesterNumber.FIRST,
    week,
    day,
    pair,
    contextGroupId,
    contextTeacherId
  } = data || {};

  const isEditing = !!pairId;

  const { data: curriculumsData } = useFindAllCurriculumsQuery();
  const { data: teachersData } = useFindAllTeachersQuery();
  const { data: groupsData } = useFindAllGroupsQuery();

  const curriculums = useMemo(() => curriculumsData?.curriculums || [], [curriculumsData]);
  const teachers = useMemo(() => teachersData?.teachers || [], [teachersData]);
  const groups = useMemo(() => groupsData?.groups || [], [groupsData]);

  const { data: pairInfo, isLoading: isLoadingInfo } = useGetPairInfoQuery(pairId || '');

  const [subjectId, setSubjectId] = useState<string>('');
  const [lessonType, setLessonType] = useState<LessonType>(LessonType.LECTURE);
  const [visitFormat, setVisitFormat] = useState<VisitFormat>(VisitFormat.OFFLINE);
  const [audience, setAudience] = useState<string>('');

  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  const [teacherToAdd, setTeacherToAdd] = useState<string>('');
  const [groupToAdd, setGroupToAdd] = useState<string>('');

  const availableCurriculums = useMemo(() => {
    if (contextGroupId) {
        return curriculums.filter(c => c.relatedGroups?.some(g => g.id === contextGroupId));
    }
    if (contextTeacherId) {
        return curriculums.filter(c => c.relatedTeachers?.some(t => t.id === contextTeacherId));
    }
    return curriculums;
  }, [curriculums, contextGroupId, contextTeacherId]);

  const selectedCurriculum = useMemo(() =>
    curriculums.find(c => c.id === subjectId),
  [curriculums, subjectId]);

  const availableGroupsForDropdown = useMemo(() => {
    if (!selectedCurriculum) return [];
    const relatedIds = selectedCurriculum.relatedGroups?.map(g => g.id) || [];
    return groups.filter(g => g.id && relatedIds.includes(g.id));
  }, [selectedCurriculum, groups]);

  const availableTeachersForDropdown = useMemo(() => {
    if (!selectedCurriculum) return [];
    const relatedIds = selectedCurriculum.relatedTeachers?.map(t => t.id) || [];
    return teachers.filter(t => t.id && relatedIds.includes(t.id));
  }, [selectedCurriculum, teachers]);

  const addPairMutation = useAddPairMutation();
  const editPairMutation = useEditPairMutation();
  const deletePairMutation = useDeletePairMutation();

  const isGlobalLoading =
    (isEditing && isLoadingInfo) ||
    addPairMutation.isPending ||
    editPairMutation.isPending ||
    deletePairMutation.isPending;

  useEffect(() => {
    if (!data) return;

    if (isEditing && pairInfo) {
        setSubjectId(pairInfo.subjectId || '');

        setLessonType(pairInfo.lessonType || LessonType.LECTURE);
        setVisitFormat(pairInfo.visitFormat || VisitFormat.OFFLINE);
        setAudience(pairInfo.audience || '');

        setSelectedTeachers(
            pairInfo.teachersList
              ?.map((t) => t.id)
              .filter((id): id is string => !!id) || []
          );
        setSelectedGroups(
            pairInfo.groupsList
              ?.map((g) => g.id)
              .filter((id): id is string => !!id) || []
        );

    } else if (!isEditing) {
        setSubjectId('');
        setLessonType(LessonType.LECTURE);
        setVisitFormat(VisitFormat.OFFLINE);
        setAudience('');

        if (contextGroupId) {
            setSelectedGroups([contextGroupId]);
            setSelectedTeachers([]);
        } else if (contextTeacherId) {
            setSelectedTeachers([contextTeacherId]);
            setSelectedGroups([]);
        } else {
            setSelectedGroups([]);
            setSelectedTeachers([]);
        }
    }
  }, [isEditing, pairInfo, contextGroupId, contextTeacherId, data]);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSubjectId = e.target.value;
      setSubjectId(newSubjectId);

      const newGroups = contextGroupId ? [contextGroupId] : [];
      const newTeachers = contextTeacherId ? [contextTeacherId] : [];

      setSelectedGroups(newGroups);
      setSelectedTeachers(newTeachers);

      setGroupToAdd('');
      setTeacherToAdd('');
  };

  const handleAddTeacher = () => {
    if (teacherToAdd && !selectedTeachers.includes(teacherToAdd)) {
        setSelectedTeachers([...selectedTeachers, teacherToAdd]);
        setTeacherToAdd('');
    }
  };

  const handleRemoveTeacher = (id: string) => {
    if (id === contextTeacherId) {
        toast.warn('Ви не можете прибрати головного вчителя з цієї пари.');
        return;
    }
    setSelectedTeachers(selectedTeachers.filter(t => t !== id));
  };

  const handleAddGroup = () => {
    if (groupToAdd && !selectedGroups.includes(groupToAdd)) {
        setSelectedGroups([...selectedGroups, groupToAdd]);
        setGroupToAdd('');
    }
  };

  const handleRemoveGroup = (id: string) => {
    if (id === contextGroupId) {
        toast.warn('Ви не можете прибрати головну групу з цієї пари.');
        return;
    }
    setSelectedGroups(selectedGroups.filter(g => g !== id));
  };

  const handleError = (error: unknown, action: string) => {
      let message = 'Невідома помилка';
      if (error instanceof AxiosError) {
        message = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(`${action}: ${message}`);
  };

  const handleSave = async () => {
      if (!subjectId) {
          toast.warn('Будь ласка, оберіть предмет.');
          return;
      }

      if (selectedGroups.length === 0 && selectedTeachers.length === 0) {
          toast.warn('Пара повинна мати хоча б одну групу або вчителя.');
          return;
      }

      if (!week || !day || !pair) return;

      const commonData: AddPairDto = {
          semesterNumber: semester,
          weekNumber: week,
          dayNumber: day,
          pairNumber: pair,
          subjectId: subjectId,
          lessonType,
          visitFormat,
          audience: visitFormat === VisitFormat.OFFLINE ? audience : undefined,
          groupsList: selectedGroups,
          teachersList: selectedTeachers,
      };

      try {
          if (isEditing && pairId) {
              const editData: EditPairDto = {
                  ...commonData,
                  id: pairId
              };
              await editPairMutation.mutateAsync(editData);
              toast.success('Пару оновлено успішно');
          } else {
              await addPairMutation.mutateAsync(commonData);
              toast.success('Пару створено успішно');
          }
          handleClose();
      } catch (error) {
          handleError(error, isEditing ? 'Помилка оновлення' : 'Помилка створення');
      }
  };

  const handleDelete = async () => {
      if (!isEditing || !pairId) return;
      if (!window.confirm('Ви впевнені, що хочете видалити цю пару?')) return;

      try {
          await deletePairMutation.mutateAsync(pairId);
          toast.success('Пару видалено успішно');
          handleClose();
      } catch (error) {
          handleError(error, 'Помилка видалення');
      }
  };

  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.fullName || id;
  const getGroupName = (id: string) => groups.find(g => g.id === id)?.groupCode || id;

  if (!data) return null;

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.header}>
        <h2>{isEditing ? 'Редагувати пару' : 'Створити пару'}</h2>
        <div className={styles.headerActions}>
          <IoClose className={styles.closeIcon} onClick={handleClose} />
        </div>
      </div>

      <div className={styles.formArea}>

        <div className={styles.infoBlock}>
             Час: <strong>Тиждень {week}</strong>, <strong>{day}</strong>, <strong>Пара {pair}</strong>
             <br/>
             Семестр: <strong>{semester}</strong>
        </div>

        <div>
            <label className={styles.inputLabel}>
                Предмет:
            </label>
            <select
                value={subjectId}
                onChange={handleSubjectChange}
                className={styles.selectInput}
            >
                <option value="">Оберіть предмет</option>
                {availableCurriculums.map(c => (
                    <option key={c.id} value={c.id}>{c.subjectName}</option>
                ))}
            </select>
        </div>

        <div className={styles.rowGroup}>
            <div>
                <label className={styles.inputLabel}>Тип:</label>
                <select
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value as LessonType)}
                    className={styles.selectInput}
                >
                    <option value={LessonType.LECTURE}>Лекція</option>
                    <option value={LessonType.PRACTICE}>Практика</option>
                    <option value={LessonType.LABORATORY}>Лабораторна</option>
                </select>
            </div>
            <div>
                <label className={styles.inputLabel}>Формат:</label>
                <select
                    value={visitFormat}
                    onChange={(e) => setVisitFormat(e.target.value as VisitFormat)}
                    className={styles.selectInput}
                >
                    <option value={VisitFormat.OFFLINE}>Офлайн</option>
                    <option value={VisitFormat.ONLINE}>Онлайн</option>
                </select>
            </div>
        </div>

        {visitFormat === VisitFormat.OFFLINE && (
            <div>
                <label className={styles.inputLabel}>Аудиторія:</label>
                <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className={styles.mainInput}
                    placeholder="Напр. 101, корп. 1"
                />
            </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />

        <div>
            <label className={styles.inputLabel}>Вчителі:</label>
            <div className={styles.addRelationRow}>
                <select
                    value={teacherToAdd}
                    onChange={(e) => setTeacherToAdd(e.target.value)}
                    className={styles.selectInput}
                    disabled={!subjectId}
                >
                    <option value="">
                        {!subjectId ? "Спочатку оберіть предмет" : "Додати вчителя"}
                    </option>
                    {availableTeachersForDropdown.map(t => (
                        <option key={t.id} value={t.id}>{t.fullName}</option>
                    ))}
                </select>
                <button
                    className={styles.addButton}
                    onClick={handleAddTeacher}
                    disabled={!subjectId}
                >
                    <IoAdd />
                </button>
            </div>

            <div className={`${styles.relatedListContainer} ${selectedTeachers.length > 0 ? styles.hasItems : ''}`}>
                {selectedTeachers.length === 0 && <span className={styles.emptyListMessage}>Список вчителів порожній</span>}
                {selectedTeachers.map(id => (
                    <div key={id} className={styles.relatedItemRow}>
                        <span className={styles.itemName} title={getTeacherName(id)}>{getTeacherName(id)}</span>
                        {id !== contextTeacherId && (
                            <IoTrash className={styles.deleteIcon} onClick={() => handleRemoveTeacher(id)} />
                        )}
                    </div>
                ))}
            </div>
        </div>

        <div>
            <label className={styles.inputLabel}>Групи:</label>
            <div className={styles.addRelationRow}>
                <select
                    value={groupToAdd}
                    onChange={(e) => setGroupToAdd(e.target.value)}
                    className={styles.selectInput}
                    disabled={!subjectId}
                >
                    <option value="">
                        {!subjectId ? "Спочатку оберіть предмет" : "Додати групу"}
                    </option>
                    {availableGroupsForDropdown.map(g => (
                        <option key={g.id} value={g.id}>{g.groupCode}</option>
                    ))}
                </select>
                <button
                    className={styles.addButton}
                    onClick={handleAddGroup}
                    disabled={!subjectId}
                >
                    <IoAdd />
                </button>
            </div>

            <div className={`${styles.relatedListContainer} ${selectedGroups.length > 0 ? styles.hasItems : ''}`}>
                {selectedGroups.length === 0 && <span className={styles.emptyListMessage}>Список груп порожній</span>}
                {selectedGroups.map(id => (
                    <div key={id} className={styles.relatedItemRow}>
                        <span className={styles.itemName} title={getGroupName(id)}>{getGroupName(id)}</span>
                        {id !== contextGroupId && (
                            <IoTrash className={styles.deleteIcon} onClick={() => handleRemoveGroup(id)} />
                        )}
                    </div>
                ))}
            </div>
        </div>

        <div className={styles.buttonContainer}>
            <button
                className={styles.primaryButton}
                onClick={handleSave}
                disabled={isGlobalLoading}
            >
                {isGlobalLoading ? <ScaleLoader height={15} color="#fff" /> : (isEditing ? 'Зберегти зміни' : 'Створити пару')}
            </button>

            {isEditing && (
                <button
                    className={styles.deleteButton}
                    onClick={handleDelete}
                    disabled={isGlobalLoading}
                >
                    Видалити пару
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default PairModal;
