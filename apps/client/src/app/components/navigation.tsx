import React, { useRef, useEffect, useState } from 'react';
import { IoChevronBack } from 'react-icons/io5';
import { PiStudent } from 'react-icons/pi';
import { LiaChalkboardTeacherSolid } from 'react-icons/lia';
import { GrUserAdmin } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import {
  useSearchGroupQuery,
  useSearchTeacherQuery,
} from '../hooks/usePublicQueries';
import { SearchGroupInput } from '../api/types/public/search-group.input';
import { SearchTeacherInput } from '../api/types/public/search-teacher.input';
import styles from './navigation.module.scss';

const Navigation = () => {
  const navigate = useNavigate();

  const [find, setFind] = useState<string>('');
  const [isStudent, setIsStudent] = useState<boolean>(true);
  const [isInputVisible, setIsInputVisible] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  const suggestionRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchGroupInput: SearchGroupInput = { groupCode: find };
  const { data: groupsData, isLoading: groupsLoading } = useSearchGroupQuery(
    searchGroupInput,
    isInputVisible && isStudent && find.length > 0
  );

  const searchTeacherInput: SearchTeacherInput = { fullName: find };
  const { data: teachersData, isLoading: teachersLoading } =
    useSearchTeacherQuery(
      searchTeacherInput,
      isInputVisible && !isStudent && find.length > 0
    );

  const groups = groupsData?.groups || [];
  const teachers = teachersData?.teachers || [];

  const suggestions = isStudent
    ? groups
        .filter((g) => g.id && g.groupCode)
        .map((g) => ({ id: g.id as string, name: g.groupCode as string }))
        .slice(0, 10)
    : teachers
        .filter((t) => t.id && t.fullName)
        .map((t) => ({ id: t.id as string, name: t.fullName as string }))
        .slice(0, 10);

  const isLoading = isStudent ? groupsLoading : teachersLoading;

  useEffect(() => {
    const handleFocus = () => {
      document.body.style.backgroundColor = 'hsl(219, 59%, 30%)';
    };

    const handleBlur = () => {
      document.body.style.backgroundColor = '';
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);

      return () => {
        inputElement.removeEventListener('focus', handleFocus);
        inputElement.removeEventListener('blur', handleBlur);
      };
    }
  }, [inputRef, isInputVisible]);

  const toTrueInput = (isStudentMode: boolean) => {
    setIsStudent(isStudentMode);
    setIsInputVisible(true);
    setFind('');
  };

  const toFalseInput = () => {
    setIsInputVisible(false);
    setFind('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFind(value);
  };

  const handleSuggestionClick = (suggestion: { id: string; name: string }) => {
    setFind(suggestion.name);
    setIsInputFocused(false);
    setIsInputVisible(false);

    const path = isStudent
      ? `/schedule/group/${suggestion.id}`
      : `/schedule/teacher/${suggestion.id}`;
    navigate(path);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsInputFocused(false);
    }, 200);
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <>
      <span className={styles.heading}>Розклад занять у ВНЗ</span>
      <form className={styles.container} action="">
      {!isInputVisible && (
        <div className={styles.buttonsContainer}>
          <button
            className={styles.modeButton}
            type="button"
            onClick={() => toTrueInput(true)}
          >
            Я студент
            <span className={styles.icon}>
              <PiStudent />
            </span>
          </button>
          <button
            className={styles.modeButton}
            type="button"
            onClick={() => toTrueInput(false)}
          >
            Я вчитель
            <span className={styles.icon}>
              <LiaChalkboardTeacherSolid />
            </span>
          </button>
          <button
            className={styles.modeButton}
            type="button"
            onClick={handleAdminClick}
          >
            Адміністрація
            <span className={styles.icon}>
              <GrUserAdmin />
            </span>
          </button>
        </div>
      )}
      {isInputVisible && (
        <>
          <input
            ref={inputRef}
            type="text"
            placeholder={
              isStudent
                ? 'Введіть назву групи'
                : 'Введіть свої ініціали'
            }
            className={styles.inputBox}
            value={find}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <button
            className={styles.backButton}
            type="button"
            onClick={toFalseInput}
          >
            <span className={styles.backIcon}>
              <IoChevronBack />
            </span>{' '}
            назад
          </button>
          {isInputFocused && find.length > 0 && (
            <div className={styles.suggestions} ref={suggestionRef}>
              {isLoading ? (
                <div className={styles.suggestionItem}>Завантаження...</div>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={styles.suggestionItem}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.name}
                  </div>
                ))
              ) : (
                <div className={styles.suggestionItem}>
                  {find.length > 0 ? 'Не знайдено' : 'Почніть вводити...'}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </form>
    </>
  );
};

export default Navigation;
