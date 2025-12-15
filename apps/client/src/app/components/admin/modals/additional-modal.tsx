import React, { useState, useMemo } from 'react';
import { IoClose, IoChevronDown, IoChevronUp } from 'react-icons/io5';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import styles from './additional.module.scss';
import { useUpdateGroupsMutation } from '../../../hooks/useAdditionalQueries';
import { useFindAllCurriculumsQuery } from '../../../hooks/useCurriculumQueries';
import { UpdateGroupAction } from '../../../api/types/enums/UpdateGroupAction.enum';

interface AdditionalModalProps {
  handleClose: () => void;
}

const AdditionalModal: React.FC<AdditionalModalProps> = ({ handleClose }) => {
  const [isInstructionCollapsed, setIsInstructionCollapsed] = useState<boolean>(true);

  const { mutateAsync: updateGroups, isPending: isUpdating } = useUpdateGroupsMutation();
  const { data: curriculumsResponse } = useFindAllCurriculumsQuery();

  const curriculums = useMemo(() => curriculumsResponse?.curriculums || [], [curriculumsResponse]);

  const mismatchedCurriculumsString = useMemo(() => {
    const mismatched = curriculums.filter(c => c.correspondence === false);
    if (mismatched.length === 0) return '';
    return mismatched.map(c => c.subjectName).join(', ');
  }, [curriculums]);

  const handleUpdateGroups = async (action: UpdateGroupAction) => {
    const actionName = action === UpdateGroupAction.MOVE_TO_NEXT_YEAR
        ? 'Перехід на наступний рік'
        : 'Скидання груп';

    if (!window.confirm(`Ви впевнені, що хочете виконати дію: "${actionName}"?`)) return;

    try {
      await updateGroups({ action });
      toast.success('Операцію виконано успішно');
    } catch (error: unknown) {
      let message = 'Невідома помилка';

      if (error instanceof AxiosError) {
        message = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast.error(`Помилка: ${message}`);
    }
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.header}>
        <h2>Додатково</h2>
        <div className={styles.headerActions}>
          <IoClose className={styles.closeIcon} onClick={handleClose} />
        </div>
      </div>

      <div className={styles.formArea}>

        <div className={styles.instructionBlock}>
          <button
            className={styles.instructionHeader}
            onClick={() => setIsInstructionCollapsed(!isInstructionCollapsed)}
          >
            <span>Інструкція користування</span>
            {isInstructionCollapsed ? <IoChevronDown /> : <IoChevronUp />}
          </button>

          {!isInstructionCollapsed && (
            <div className={styles.instructionContent}>
              <p><strong>1. Налаштування даних</strong></p>
              <ul>
                <li>Додайте <b>Групи</b> та <b>Вчителів</b> у відповідних меню.</li>
                <li>Створіть <b>Предмети</b>: прив&apos;яжіть до них групи й вчителів, вкажіть кількість запланованих пар.</li>
              </ul>

              <p><strong>2. Робота з розкладом</strong></p>
              <ul>
                <li>Оберіть групу або вчителя для відображення сітки.</li>
                <li><b>Подвійний клік</b> по клітинці — створити або редагувати пару.</li>
                <li><b>Drag & Drop</b> — перетягніть пару, щоб змінити час або поміняти місцями.</li>
              </ul>

              <p><strong>3. Гарячі клавіші (при наведенні курсора)</strong></p>
              <ul>
                <li><b>Ctrl + C</b> — Копіювати пару</li>
                <li><b>Ctrl + X</b> — Вирізати пару</li>
                <li><b>Ctrl + V</b> — Вставити пару</li>
                <li><b>Ctrl + S</b> — Поміняти місцями (Swap)</li>
                <li><b>Delete</b> — Видалити пару</li>
              </ul>

              <p><strong>4. Інше</strong></p>
              <ul>
                <li>Кнопки знизу дозволяють автоматично перенести назви груп на наступний рік.</li>
              </ul>
            </div>
          )}
        </div>

        <div className={styles.warningBlock}>
            {mismatchedCurriculumsString && (
                <h3>
                    Розклад не відповідає навчальному плану для предметів: {mismatchedCurriculumsString}
                </h3>
            )}
        </div>

        <div className={styles.actionBlock}>
            <button
                className={styles.actionButton}
                onClick={() => handleUpdateGroups(UpdateGroupAction.MOVE_TO_NEXT_YEAR)}
                disabled={isUpdating}
            >
                {isUpdating ? <ScaleLoader height={15} color="#fff" /> : 'Перенести розклад на наступний рік'}
            </button>

            <button
                className={styles.dangerButton}
                onClick={() => handleUpdateGroups(UpdateGroupAction.RESET)}
                disabled={isUpdating}
            >
                {isUpdating ? <ScaleLoader height={15} color="#fff" /> : 'Скинути групи (Рік назад / Reset)'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default AdditionalModal;
