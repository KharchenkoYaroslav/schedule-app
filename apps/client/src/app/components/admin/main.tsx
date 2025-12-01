import React, { useState, useMemo, useCallback } from 'react';
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
    useSwapTeacherPairsMutation
} from '../../hooks/useScheduleQueries';
import { PairMinimalInfo } from '../../api/types/schedule/pair-minimal-info.type';
import { formatSubject, formatTypeAndFormat } from '../../utils/format-utils';

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
}

const DraggablePairItem: React.FC<DraggablePairItemProps> = ({ pair, week, day, pairNum, onClick }) => {
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
            onClick={(e) => { e.stopPropagation(); onClick(pair); }}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            title="Клікніть для редагування, потягніть для переміщення"
        >
            <div className={styles.pairSubject}>
                {formatSubject(pair.subjectName)}
            </div>
            <div className={styles.pairDetails}>
                {formatTypeAndFormat(String(pair.lessonType || ''), String(pair.visitFormat || ''))}
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
  onCellClick: (week: WeekNumber, day: DayNumber, pairNum: PairNumber, existingPair?: ExtendedPairInfo) => void;
  onMovePair: (source: DragItem, destination: DragItem) => void;
}

const ScheduleCell: React.FC<ScheduleCellProps> = ({
  week,
  day,
  pairNum,
  cellData,
  isGroupMode,
  onCellClick,
  onMovePair
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

  const dropRef = (node: HTMLTableDataCellElement | null) => {
      drop(node);
  };

  const showAddButton = cellData.length === 0 || isGroupMode;

  const handleAddClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onCellClick(week, day, pairNum, undefined);
  };

  const backgroundColor = isOver ? '#dbeafe' : (cellData.length > 0 ? '#f0f9ff' : 'white');

  return (
    <td
      ref={dropRef}
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
            />
        ))}

        {showAddButton && (
            <div
                className={styles.addPairButton}
                onClick={handleAddClick}
                title={cellData.length > 0 ? "Додати ще один предмет" : "Додати пару"}
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

export default function Main({
  selectedTeacher,
  selectedGroup,
  setPairModalData,
  setWindow
}: AdminMainProps) {

  const [semester, setSemester] = useState<SemesterNumber>(SemesterNumber.FIRST);

  const isGroup = !!selectedGroup;
  const isEnabled = !!(selectedGroup?.id || selectedTeacher?.id);

  const queryInput = useMemo(() => ({
    semester,
    groupId: selectedGroup?.id,
    teacherId: selectedTeacher?.id,
  }), [semester, selectedGroup, selectedTeacher]);

  const { data, isLoading, isError, refetch } = useGetPairsByCriteriaQuery(queryInput);

  const pairs = useMemo(() => (data?.pairs || []) as ExtendedPairInfo[], [data]);

  const swapGroupMutation = useSwapGroupPairsMutation();
  const swapTeacherMutation = useSwapTeacherPairsMutation();

  const handleMovePair = useCallback(async (source: DragItem, destination: DragItem) => {
    try {
        if (isGroup && selectedGroup?.id) {
            await swapGroupMutation.mutateAsync({
                semester,
                source: {
                    groupId: selectedGroup.id,
                    weekNumber: source.week,
                    dayNumber: source.day,
                    pairNumber: source.pairNum
                },
                destination: {
                    groupId: selectedGroup.id,
                    weekNumber: destination.week,
                    dayNumber: destination.day,
                    pairNumber: destination.pairNum
                }
            });
        } else if (!isGroup && selectedTeacher?.id) {
             await swapTeacherMutation.mutateAsync({
                semester,
                source: {
                    teacherId: selectedTeacher.id,
                    weekNumber: source.week,
                    dayNumber: source.day,
                    pairNumber: source.pairNum
                },
                destination: {
                    teacherId: selectedTeacher.id,
                    weekNumber: destination.week,
                    dayNumber: destination.day,
                    pairNumber: destination.pairNum
                }
            });
        }
        toast.success('Пари переміщено');
        refetch();
    } catch (error) {
        console.error(error);
        toast.error('Помилка при переміщенні пари');
    }
  }, [isGroup, selectedGroup, selectedTeacher, semester, swapGroupMutation, swapTeacherMutation, refetch]);


  const handleCellClick = (week: WeekNumber, day: DayNumber, pairNum: PairNumber, existingPair?: ExtendedPairInfo) => {
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

  const getPairsForCell = (week: WeekNumber, day: DayNumber, pairNum: PairNumber) => {
      return pairs.filter(p =>
          String(p.weekNumber) === String(week) &&
          String(p.dayNumber) === String(day) &&
          String(p.pairNumber) === String(pairNum)
      );
  };

  const renderWeekTable = (week: WeekNumber, title: string) => (
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '15px', color: 'white', paddingLeft: '5px' }}>{title}</h3>
      <table className={styles.scheduleTable}>
        <thead>
          <tr>
            <th>Пара</th>
            {WEEK_DAYS.map(d => <th key={d.val}>{d.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {PAIR_NUMBERS.map(pairNum => (
            <tr key={pairNum}>
              <td>
                  <div className={styles.pairNum}>{pairNum}</div>
                  <div className={styles.pairTime}>{PAIR_TIME[pairNum]}</div>
              </td>
              {WEEK_DAYS.map(day => (
                <ScheduleCell
                    key={`${week}-${day.val}-${pairNum}`}
                    week={week}
                    day={day.val}
                    pairNum={pairNum}
                    cellData={getPairsForCell(week, day.val, pairNum)}
                    isGroupMode={isGroup}
                    onCellClick={handleCellClick}
                    onMovePair={handleMovePair}
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
                    Розклад: <span style={{color: 'DodgerBlue'}}>{selectedGroup?.name || selectedTeacher?.name}</span>
                </h2>
                <div className={styles.subHeader}>
                    {selectedGroup ? 'Режим групи (мультипари дозволено)' : 'Режим вчителя'}
                </div>
              </div>

              <div className={styles.controlsRight}>
                  <label style={{ fontWeight: 600, color: '#374151', marginRight: '8px' }}>Семестр:</label>
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
                <h2>Будь ласка, оберіть групу або вчителя з меню зліва для редагування розкладу.</h2>
              </div>
          ) : isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <ScaleLoader color="white" />
              </div>
          ) : isError ? (
              <div style={{ color: 'white', textAlign: 'center', marginTop: '40px', fontSize: '18px' }}>
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
