import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineSettingsBackupRestore } from 'react-icons/md';
import { ScheduleResponse } from '../api/types/public/schedule.response';
import { ScheduleItem } from '../api/types/public/schedule-item.type';
import { PairTime, AbbrPair, WeekdayDisplay, ScheduleType, mapScheduleToWeekStructure, WeekSchedule, curentSemester, getCurrentWeek } from '../utils/schedule-build';
import {
    useGetGroupScheduleQuery,
    useGetTeacherScheduleQuery,
} from '../hooks/usePublicQueries';
import { GetGroupScheduleInput } from '../api/types/public/get-group-schedule.input';
import { GetTeacherScheduleInput } from '../api/types/public/get-teacher-schedule.input';
import { DayNumber } from '../api/types/enums/DayNumber.enum';
import { WeekNumber } from '../api/types/enums/WeekNumber.enum';
import { PairNumber } from '../api/types/enums/PairNumber.enum';
import styles from './Schedules.module.scss';
import { formatSubject, formatTypeAndFormat, transformName } from '../utils/format-utils';
import { ScaleLoader } from 'react-spinners';

interface Props {
    type: ScheduleType;
    id: string;
}

const Schedules: React.FC<Props> = ({ type, id }) => {
    const navigate = useNavigate();

    const resetSchedule = () => {
        navigate('/');
    };

    const isGroup = type === 'group';

    const queryInput = {
        semesterNumber: curentSemester(),
    };

    const groupInput: GetGroupScheduleInput = {
        ...queryInput,
        groupId: isGroup ? id : undefined,
    };

    const teacherInput: GetTeacherScheduleInput = {
        ...queryInput,
        teacherId: !isGroup ? id : undefined,
    };

    const {
        data: groupData,
        isLoading: isGroupLoading,
        isError: isGroupError,
    } = useGetGroupScheduleQuery(groupInput);

    const {
        data: teacherData,
        isLoading: isTeacherLoading,
        isError: isTeacherError,
    } = useGetTeacherScheduleQuery(teacherInput);

    const scheduleResponse: ScheduleResponse | undefined = isGroup
        ? groupData
        : teacherData;

    const isLoading = isGroupLoading || isTeacherLoading;
    const isError = isGroupError || isTeacherError;

    const scheduleMap = useMemo(() => {
        if (scheduleResponse?.schedule) {
            const schedule = mapScheduleToWeekStructure(scheduleResponse.schedule);
            return schedule;
        }
        return {};
    }, [scheduleResponse]);

    const firstWeekSchedule = scheduleMap[WeekNumber.FIRST];
    const secondWeekSchedule = scheduleMap[WeekNumber.SECOND];

    const renderRelatedTeachers = (teachersList: ScheduleItem['teachersList']) => {
        if (!teachersList || teachersList.length === 0) return null;

        const links = teachersList.map((teacher, index) => {
            const postAbbr = teacher.post ? AbbrPair[teacher.post as keyof typeof AbbrPair] : '';
            const displayName = `${postAbbr ? postAbbr + '. ' : ''}${transformName(teacher.name ?? '')}`;

            return (
                <Link
                    key={index}
                    to={`/schedule/teacher/${teacher.id}`}
                    className={styles.nowrap}
                >
                    {displayName}
                </Link>
            );
        });

        return (
            <div className={styles.relatedInfo}>
                {links.map((link, i) => (
                    <span key={i}>
                        {link}
                        {i < links.length - 1 ? ', ' : ''}
                    </span>
                ))}
            </div>
        );
    };

    const renderRelatedGroups = (groupsList: ScheduleItem['groupsList']) => {
        if (!groupsList || groupsList.length === 0) return null;

        const links = groupsList.map((group, index) => (
            <Link key={index} to={`/schedule/group/${group.id}`}>
                {group.groupCode}
            </Link>
        ));

        return (
            <div className={styles.relatedInfo}>
                {links.map((link, i) => (
                    <span key={i}>
                        {link}
                        {i < links.length - 1 ? ', ' : ''}
                    </span>
                ))}
            </div>
        );
    };

    const renderTable = (weekSchedule: WeekSchedule | undefined, weekName: string) => {
        const dayNumbers = Object.keys(WeekdayDisplay) as DayNumber[];

        const pairNumbers = Object.values(PairNumber)
            .map((v) => Number(v))
            .filter((v) => !isNaN(v))
            .sort((a, b) => a - b) as number[];

        return (
            <div className={styles.tableContainer} key={weekName}>
                <h3>{weekName}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Пара</th>
                            {dayNumbers.map(day => <th key={day}>{WeekdayDisplay[day]}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {pairNumbers.map(pairNumber => (
                            <tr key={pairNumber}>
                                <td>
                                    {pairNumber} <br /> {PairTime[pairNumber]}
                                </td>
                                {dayNumbers.map(dayNumber => {
                                    const pairsInDay = weekSchedule ? weekSchedule[dayNumber as DayNumber] : [];

                                    const matchingPairs = pairsInDay?.filter(p => p.pairNumber === (pairNumber as unknown as PairNumber));

                                    return (
                                        <td key={dayNumber}>
                                            {matchingPairs && matchingPairs.length > 0 && matchingPairs.map((pair, index) => (
                                                <div key={index} className={styles.cellContent}>
                                                    {index > 0 && <hr className={styles.pairSeparator} />}

                                                    <div className={styles.subject}>
                                                        {formatSubject(pair.subjectName)}
                                                    </div>

                                                    {type === 'group' ? (
                                                        renderRelatedTeachers(pair.teachersList)
                                                    ) : (
                                                        renderRelatedGroups(pair.groupsList)
                                                    )}

                                                    <div className={styles.typeFormat}>
                                                        {formatTypeAndFormat(pair.lessonType, pair.visitFormat)}
                                                    </div>

                                                    {pair.audience && (
                                                        <div className={styles.place}>
                                                            <span className={styles.nowrap}>
                                                                {`Аудиторія: ${pair.audience}`}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const currentWeek = getCurrentWeek();
    const nextWeek = currentWeek === WeekNumber.FIRST ? WeekNumber.SECOND : WeekNumber.FIRST;

    if (isError) {
        return <h3 className={styles.message}>Помилка при отриманні розкладу. Спробуйте пізніше.</h3>;
    }

    if (isLoading || (id && !scheduleResponse)) {
        return <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          height: '100vh',
          alignItems: 'center',
        }}
      >
        <ScaleLoader
          color="#fff"
          height={80}
          width={10}
          radius={8}
          margin={5}
        />
      </div>;
    }

    if (!firstWeekSchedule && !secondWeekSchedule) {
        return (
            <div className={styles.container}>
                <h2>{scheduleResponse?.identifier}</h2>
                <h3 className={styles.message}>Розклад для {scheduleResponse?.identifier} не знайдено.</h3>
                <button className={styles.restartButton} type="button" onClick={resetSchedule}>
                    Вибрати інший розклад
                    <span className={styles.icon}><MdOutlineSettingsBackupRestore /></span>
                </button>
            </div>
        );
    }

    const currentWeekScheduleData = scheduleMap[currentWeek];
    const nextWeekScheduleData = scheduleMap[nextWeek];

    const currentWeekName = "Цей тиждень";
    const nextWeekName = "Наступний тиждень";

    return (
        <div className={styles.container}>
            <h2>{scheduleResponse?.identifier}</h2>
            <button className={styles.restartButton} type="button" onClick={resetSchedule}>
                Вибрати інший розклад
                <span className={styles.icon}><MdOutlineSettingsBackupRestore /></span>
            </button>
            <div className={styles.tablesContainer} >
                {renderTable(currentWeekScheduleData, currentWeekName)}
                {renderTable(nextWeekScheduleData, nextWeekName)}
            </div>
        </div>
    );
};

export default Schedules;
