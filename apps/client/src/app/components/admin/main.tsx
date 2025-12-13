import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { toast } from 'react-toastify';
import styles from './main.module.scss';
import { PairModalData } from './modals/pair-modal';
import { SemesterNumber } from '../../api/types/enums/SemesterNumber.enum';
import { WeekNumber } from '../../api/types/enums/WeekNumber.enum';
import { DayNumber } from '../../api/types/enums/DayNumber.enum';
import { PairNumber } from '../../api/types/enums/PairNumber.enum';
import { LessonType } from '../../api/types/enums/LessonType.enum';
import { VisitFormat } from '../../api/types/enums/VisitFormat.enum';
import { OpenWindow } from './modal';
import {
  useGetPairsByCriteriaQuery,
  useSwapGroupPairsMutation,
  useSwapTeacherPairsMutation,
  useAddPairMutation,
  useDeletePairMutation,
  useLazyGetPairInfoQuery,
  useEditPairMutation,
} from '../../hooks/useScheduleQueries';
import { PairMinimalInfo } from '../../api/types/schedule/pair-minimal-info.type';
import { GetPairInfoResponse } from '../../api/types/schedule/get-pair-info.response';
import { formatSubject, formatTypeAndFormat } from '../../utils/format-utils';
import { AddPairDto } from '../../api/types/schedule/add-pair.dto';
import { EditPairDto } from '../../api/types/schedule/edit-pair.dto';

interface ExtendedPairInfo extends PairMinimalInfo {
  lessonType?: LessonType;
  visitFormat?: VisitFormat;
  audience?: string;
}

const WEEK_DAYS = [
  { val: DayNumber.MONDAY, label: 'Понеділок' },
  { val: DayNumber.TUESDAY, label: 'Вівторок' },
  { val: DayNumber.WEDNESDAY, label: 'Середа' },
  { val: DayNumber.THURSDAY, label: 'Четвер' },
  { val: DayNumber.FRIDAY, label: "П'ятниця" },
  { val: DayNumber.SATURDAY, label: 'Субота' },
];

const PAIR_NUMBERS = [
  PairNumber.FIRST,
  PairNumber.SECOND,
  PairNumber.THIRD,
  PairNumber.FOURTH,
  PairNumber.FIFTH,
  PairNumber.SIXTH,
  PairNumber.SEVENTH,
];

const PAIR_TIME: Record<string, string> = {
  [PairNumber.FIRST]: '08:30',
  [PairNumber.SECOND]: '10:25',
  [PairNumber.THIRD]: '12:20',
  [PairNumber.FOURTH]: '14:15',
  [PairNumber.FIFTH]: '16:10',
  [PairNumber.SIXTH]: '18:30',
  [PairNumber.SEVENTH]: '20:20',
};

const DRAG_TYPE = 'SCHEDULE_ITEM';

interface DragItem {
  pairId?: string;
  week: WeekNumber;
  day: DayNumber;
  pairNum: PairNumber;
}

interface DraggablePairItemProps {
  pair: ExtendedPairInfo;
  week: WeekNumber;
  day: DayNumber;
  pairNum: PairNumber;
  onClick: (pair: ExtendedPairInfo) => void;
  onHover: (
    week: WeekNumber,
    day: DayNumber,
    pairNum: PairNumber,
    pairId?: string
  ) => void;
}

const DraggablePairItem: React.FC<DraggablePairItemProps> = ({
  pair,
  week,
  day,
  pairNum,
  onClick,
  onHover,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { pairId: pair.id, week, day, pairNum } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const dragRef = (node: HTMLDivElement | null) => {
    drag(node);
  };

  return (
    <div
      ref={dragRef}
      className={styles.pairItem}
      onClick={(e) => {
        e.stopPropagation();
        onClick(pair);
      }}
      onMouseEnter={() => onHover(week, day, pairNum, pair.id)}
      onMouseLeave={() => onHover(week, day, pairNum, undefined)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      title="Клікніть для редагування, потягніть для переміщення. Ctrl+C/V/X/S/Delete доступні."
    >
      <div className={styles.pairSubject}>
        {formatSubject(pair.subjectName)}
      </div>
      <div className={styles.pairDetails}>
        {formatTypeAndFormat(
          String(pair.lessonType || ''),
          String(pair.visitFormat || '')
        )}
      </div>
      {pair.audience && (
        <div className={styles.pairDetails} style={{ fontStyle: 'italic' }}>
          Ауд: {pair.audience}
        </div>
      )}
    </div>
  );
};

interface ScheduleCellProps {
  week: WeekNumber;
  day: DayNumber;
  pairNum: PairNumber;
  cellData: ExtendedPairInfo[];
  isGroupMode: boolean;
  onCellClick: (
    week: WeekNumber,
    day: DayNumber,
    pairNum: PairNumber,
    existingPair?: ExtendedPairInfo
  ) => void;
  onMovePair: (source: DragItem, destination: DragItem) => void;
  onHover: (
    week: WeekNumber,
    day: DayNumber,
    pairNum: PairNumber,
    pairId?: string
  ) => void;
  onLeave: () => void;
}

const ScheduleCell: React.FC<ScheduleCellProps> = ({
  week,
  day,
  pairNum,
  cellData,
  isGroupMode,
  onCellClick,
  onMovePair,
  onHover,
  onLeave,
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_TYPE,
    drop: (item: DragItem) => {
      if (item.week !== week || item.day !== day || item.pairNum !== pairNum) {
        onMovePair(item, { week, day, pairNum });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const dropRef = (node: HTMLTableCellElement | null) => {
    drop(node);
  };

  const showAddButton = cellData.length === 0 || isGroupMode;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCellClick(week, day, pairNum, undefined);
  };

  const backgroundColor = isOver
    ? '#dbeafe'
    : cellData.length > 0
    ? '#f0f9ff'
    : 'white';

  return (
    <td
      ref={dropRef}
      onMouseEnter={() => onHover(week, day, pairNum, undefined)}
      onMouseLeave={onLeave}
      style={{
        padding: 0,
        backgroundColor,
        transition: 'background-color 0.2s',
      }}
    >
      <div className={styles.cellContent}>
        {cellData.map((pair, idx) => (
          <DraggablePairItem
            key={pair.id || idx}
            pair={pair}
            week={week}
            day={day}
            pairNum={pairNum}
            onClick={(p) => onCellClick(week, day, pairNum, p)}
            onHover={onHover}
          />
        ))}

        {showAddButton && (
          <div
            className={styles.addPairButton}
            onClick={handleAddClick}
            title={
              cellData.length > 0 ? 'Додати ще один предмет' : 'Додати пару'
            }
          >
            +
          </div>
        )}
      </div>
    </td>
  );
};

interface AdminMainProps {
  selectedTeacher?: { id: string; name: string } | null;
  selectedGroup?: { id: string; name: string } | null;
  setPairModalData: (data: PairModalData | null) => void;
  setWindow: (window: OpenWindow) => void;
}

interface HoveredInfo {
  week: WeekNumber;
  day: DayNumber;
  pairNum: PairNumber;
  pairId?: string;
}

interface ClipboardData {
  info: GetPairInfoResponse;
  source: {
    week: WeekNumber;
    day: DayNumber;
    pairNum: PairNumber;
  };
  isCut: boolean;
}

export default function Main({
  selectedTeacher,
  selectedGroup,
  setPairModalData,
  setWindow,
}: AdminMainProps) {
  const [semester, setSemester] = useState<SemesterNumber>(
    SemesterNumber.FIRST
  );

  const isGroup = !!selectedGroup;
  const isEnabled = !!(selectedGroup?.id || selectedTeacher?.id);

  const queryInput = useMemo(
    () => ({
      semester,
      groupId: selectedGroup?.id,
      teacherId: selectedTeacher?.id,
    }),
    [semester, selectedGroup, selectedTeacher]
  );

  const { data, isLoading, isError, refetch } =
    useGetPairsByCriteriaQuery(queryInput);
  const pairs = useMemo(
    () => (data?.pairs || []) as ExtendedPairInfo[],
    [data]
  );

  const swapGroupMutation = useSwapGroupPairsMutation();
  const swapTeacherMutation = useSwapTeacherPairsMutation();
  const addPairMutation = useAddPairMutation();
  const deletePairMutation = useDeletePairMutation();
  const editPairMutation = useEditPairMutation();

  const getPairInfo = useLazyGetPairInfoQuery();

  const hoveredInfoRef = useRef<HoveredInfo | null>(null);
  const clipboardRef = useRef<ClipboardData | null>(null);

  const handleHover = useCallback(
    (
      week: WeekNumber,
      day: DayNumber,
      pairNum: PairNumber,
      pairId?: string
    ) => {
      hoveredInfoRef.current = { week, day, pairNum, pairId };
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    hoveredInfoRef.current = null;
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!hoveredInfoRef.current) return;
      const hovered = hoveredInfoRef.current;
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.code === 'KeyC') {
        if (!hovered.pairId) return;
        try {
          const data = await getPairInfo(hovered.pairId);
          clipboardRef.current = {
            info: data,
            source: {
              week: hovered.week,
              day: hovered.day,
              pairNum: hovered.pairNum,
            },
            isCut: false,
          };
          toast.success('Пару скопійовано');
        } catch (error) {
          console.error(error);
          toast.error('Помилка при копіюванні');
        }
      }

      if (isCtrl && e.code === 'KeyX') {
        if (!hovered.pairId) return;
        try {
          const data = await getPairInfo(hovered.pairId);
          clipboardRef.current = {
            info: data,
            source: {
              week: hovered.week,
              day: hovered.day,
              pairNum: hovered.pairNum,
            },
            isCut: true,
          };
          toast.success('Пару вирізано');
        } catch (error) {
          console.error(error);
          toast.error('Помилка при вирізанні');
        }
      }

      if (isCtrl && e.code === 'KeyV') {
        if (!clipboardRef.current) return;
        const clip = clipboardRef.current;

        if (selectedGroup?.id) {
          const hasGroup = clip.info.groupsList?.some(
            (g) => g.id === selectedGroup.id
          );
          if (!hasGroup) {
            toast.warn('Неможливо вставити: пара не містить поточну групу');
            return;
          }
        }

        if (selectedTeacher?.id) {
          const hasTeacher = clip.info.teachersList?.some(
            (t) => t.id === selectedTeacher.id
          );
          if (!hasTeacher) {
            toast.warn('Неможливо вставити: пара не містить поточного вчителя');
            return;
          }
        }

        const input: AddPairDto = {
          semesterNumber: semester,
          weekNumber: hovered.week,
          dayNumber: hovered.day,
          pairNumber: hovered.pairNum,
          subjectId: clip.info.subjectId,
          lessonType: clip.info.lessonType,
          visitFormat: clip.info.visitFormat,
          audience: clip.info.audience,
          groupsList:
            clip.info.groupsList
              ?.map((g) => g.id)
              .filter((id): id is string => !!id) || [],
          teachersList:
            clip.info.teachersList
              ?.map((t) => t.id)
              .filter((id): id is string => !!id) || [],
        };

        try {
          await addPairMutation.mutateAsync(input);
          toast.success('Пару додано');

          if (clip.isCut && clip.info.id) {
            await deletePairMutation.mutateAsync(clip.info.id);

            clipboardRef.current.isCut = false;
            clipboardRef.current.info.id = undefined;
          }
        } catch (err) {
          console.error(err);
          toast.error('Помилка при вставці');
        }
      }

      if (isCtrl && e.code === 'KeyS') {
        e.preventDefault();
        if (!clipboardRef.current) {
          toast.warn('Спочатку скопіюйте пару для обміну');
          return;
        }
        const clip = clipboardRef.current;

        try {
          if (isGroup && selectedGroup?.id) {
            await swapGroupMutation.mutateAsync({
              semester,
              source: {
                groupId: selectedGroup.id,
                weekNumber: clip.source.week,
                dayNumber: clip.source.day,
                pairNumber: clip.source.pairNum,
              },
              destination: {
                groupId: selectedGroup.id,
                weekNumber: hovered.week,
                dayNumber: hovered.day,
                pairNumber: hovered.pairNum,
              },
            });
          } else if (!isGroup && selectedTeacher?.id) {
            await swapTeacherMutation.mutateAsync({
              semester,
              source: {
                teacherId: selectedTeacher.id,
                weekNumber: clip.source.week,
                dayNumber: clip.source.day,
                pairNumber: clip.source.pairNum,
              },
              destination: {
                teacherId: selectedTeacher.id,
                weekNumber: hovered.week,
                dayNumber: hovered.day,
                pairNumber: hovered.pairNum,
              },
            });
          }
          toast.success('Пари поміняно місцями');
        } catch (error) {
          console.error(error);
          toast.error('Помилка при обміні пар');
        }
      }

      if (e.code === 'Delete') {
        if (!hovered.pairId) return;

        try {
            const info = await getPairInfo(hovered.pairId);

            const isMultiTeacher = selectedTeacher && (info.teachersList?.length ?? 0) > 1;
            const isMultiGroup = selectedGroup && (info.groupsList?.length ?? 0) > 1;

            if (isMultiTeacher || isMultiGroup) {
                const contextName = selectedTeacher ? 'цього вчителя' : 'цю групу';

                if (window.confirm(`У цій парі є інші учасники. Видалити тільки ${contextName}?`)) {
                    let newTeachers = info.teachersList?.map(t => t.id).filter((id): id is string => !!id) || [];
                    let newGroups = info.groupsList?.map(g => g.id).filter((id): id is string => !!id) || [];

                    if (selectedTeacher?.id) {
                        newTeachers = newTeachers.filter(id => id !== selectedTeacher.id);
                    }
                    if (selectedGroup?.id) {
                        newGroups = newGroups.filter(id => id !== selectedGroup.id);
                    }

                    const dto: EditPairDto = {
                        id: info.id,
                        semesterNumber: semester,
                        weekNumber: hovered.week,
                        dayNumber: hovered.day,
                        pairNumber: hovered.pairNum,
                        subjectId: info.subjectId,
                        lessonType: info.lessonType,
                        visitFormat: info.visitFormat,
                        audience: info.audience,
                        teachersList: newTeachers,
                        groupsList: newGroups
                    };

                    await editPairMutation.mutateAsync(dto);
                    toast.success('Успішно видалено з пари');
                } else {
                    if (window.confirm('Видалити всю пару?')) {
                        await deletePairMutation.mutateAsync(hovered.pairId);
                        toast.success('Пару видалено');
                    }
                }
            } else {
                if (!window.confirm('Ви впевнені, що хочете видалити цю пару?')) return;
                await deletePairMutation.mutateAsync(hovered.pairId);
                toast.success('Пару видалено');
            }
        } catch (error) {
            console.error(error);
            toast.error('Помилка при видаленні');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    semester,
    isGroup,
    selectedGroup,
    selectedTeacher,
    addPairMutation,
    deletePairMutation,
    editPairMutation,
    swapGroupMutation,
    swapTeacherMutation,
    getPairInfo,
    pairs
  ]);

  const handleMovePair = useCallback(
    async (source: DragItem, destination: DragItem) => {
      try {
        if (isGroup && selectedGroup?.id) {
          await swapGroupMutation.mutateAsync({
            semester,
            source: {
              groupId: selectedGroup.id,
              weekNumber: source.week,
              dayNumber: source.day,
              pairNumber: source.pairNum,
            },
            destination: {
              groupId: selectedGroup.id,
              weekNumber: destination.week,
              dayNumber: destination.day,
              pairNumber: destination.pairNum,
            },
          });
        } else if (!isGroup && selectedTeacher?.id) {
          await swapTeacherMutation.mutateAsync({
            semester,
            source: {
              teacherId: selectedTeacher.id,
              weekNumber: source.week,
              dayNumber: source.day,
              pairNumber: source.pairNum,
            },
            destination: {
              teacherId: selectedTeacher.id,
              weekNumber: destination.week,
              dayNumber: destination.day,
              pairNumber: destination.pairNum,
            },
          });
        }
        toast.success('Пари переміщено');
        refetch();
      } catch (error) {
        console.error(error);
        toast.error('Помилка при переміщенні пари');
      }
    },
    [
      isGroup,
      selectedGroup,
      selectedTeacher,
      semester,
      swapGroupMutation,
      swapTeacherMutation,
      refetch,
    ]
  );

  const handleCellClick = (
    week: WeekNumber,
    day: DayNumber,
    pairNum: PairNumber,
    existingPair?: ExtendedPairInfo
  ) => {
    setPairModalData({
      pairId: existingPair?.id || null,
      semester,
      week,
      day,
      pair: pairNum,
      subjectName: existingPair?.subjectName,
      contextGroupId: selectedGroup?.id,
      contextTeacherId: selectedTeacher?.id,
    });
    setWindow('Pair');
  };

  const getPairsForCell = (
    week: WeekNumber,
    day: DayNumber,
    pairNum: PairNumber
  ) => {
    return pairs.filter(
      (p) =>
        String(p.weekNumber) === String(week) &&
        String(p.dayNumber) === String(day) &&
        String(p.pairNumber) === String(pairNum)
    );
  };

  const renderWeekTable = (week: WeekNumber, title: string) => (
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '15px', color: 'white', paddingLeft: '5px' }}>
        {title}
      </h3>
      <table className={styles.scheduleTable}>
        <thead>
          <tr>
            <th>Пара</th>
            {WEEK_DAYS.map((d) => (
              <th key={d.val}>{d.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PAIR_NUMBERS.map((pairNum) => (
            <tr key={pairNum}>
              <td>
                <div className={styles.pairNum}>{pairNum}</div>
                <div className={styles.pairTime}>{PAIR_TIME[pairNum]}</div>
              </td>
              {WEEK_DAYS.map((day) => (
                <ScheduleCell
                  key={`${week}-${day.val}-${pairNum}`}
                  week={week}
                  day={day.val}
                  pairNum={pairNum}
                  cellData={getPairsForCell(week, day.val, pairNum)}
                  isGroupMode={isGroup}
                  onCellClick={handleCellClick}
                  onMovePair={handleMovePair}
                  onHover={handleHover}
                  onLeave={handleMouseLeave}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.main}>
        {isEnabled && (
          <div className={styles.headerControl}>
            <div>
              <h2>
                Розклад:{' '}
                <span style={{ color: 'DodgerBlue' }}>
                  {selectedGroup?.name || selectedTeacher?.name}
                </span>
              </h2>
              <div className={styles.subHeader}>
                {selectedGroup
                  ? 'Режим групи (мультипари дозволено)'
                  : 'Режим вчителя'}
              </div>
            </div>

            <div className={styles.controlsRight}>
              <label
                style={{
                  fontWeight: 600,
                  color: '#374151',
                  marginRight: '8px',
                }}
              >
                Семестр:
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as SemesterNumber)}
              >
                <option value={SemesterNumber.FIRST}>1-й семестр</option>
                <option value={SemesterNumber.SECOND}>2-й семестр</option>
              </select>
            </div>
          </div>
        )}

        <div className={styles.scrollArea}>
          {!isEnabled ? (
            <div className={styles.emptyState}>
              <h2>
                Будь ласка, оберіть групу або вчителя з меню зліва для
                редагування розкладу.
              </h2>
            </div>
          ) : isLoading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <ScaleLoader color="white" />
            </div>
          ) : isError ? (
            <div
              style={{
                color: 'white',
                textAlign: 'center',
                marginTop: '40px',
                fontSize: '18px',
              }}
            >
              Помилка завантаження даних. Спробуйте оновити сторінку.
            </div>
          ) : (
            <>
              {renderWeekTable(WeekNumber.FIRST, '1-й Тиждень')}
              {renderWeekTable(WeekNumber.SECOND, '2-й Тиждень')}
            </>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
