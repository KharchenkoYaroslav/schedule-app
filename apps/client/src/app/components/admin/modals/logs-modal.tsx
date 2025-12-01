import React, { useState } from 'react';
import { IoClose} from 'react-icons/io5';
import styles from './logs.module.scss';
import { useGetLogsQuery } from '../../../hooks/useControlQueries';
import { GetLogsDto } from '../../../api/types/control/get-logs.dto';
import { LogDto } from '../../../api/types/control/log.dto';

interface LogsModalProps {
  handleClose: () => void;
}

const LogsModal: React.FC<LogsModalProps> = ({ handleClose }) => {
  const [filters, setFilters] = useState<GetLogsDto>({
    count: 50,
    order: 'last',
    adminId: '',
  });

  const { data: logs, isLoading, isError } = useGetLogsQuery({
    ...filters,
    adminId: filters.adminId === '' ? undefined : filters.adminId,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name === 'count' ? Number(value) : value,
    }));
  };

  const formatLogDate = (date: Date) => {
    return new Date(date).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.header}>
        <h2>Журнал дій</h2>
        <div className={styles.headerActions}>
          <IoClose className={styles.closeIcon} onClick={handleClose} />
        </div>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.inputGroup}>
          <label htmlFor="adminId">ID Адміна</label>
          <input
            type="text"
            id="adminId"
            name="adminId"
            placeholder="Пошук за UUID..."
            value={filters.adminId || ''}
            onChange={handleInputChange}
            autoComplete="off"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="count">Кількість</label>
          <input
            type="number"
            id="count"
            name="count"
            min="1"
            max="1000"
            value={filters.count}
            onChange={handleInputChange}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="order">Порядок</label>
          <select
            id="order"
            name="order"
            value={filters.order}
            onChange={handleInputChange}
          >
            <option value="last">Нові спочатку</option>
            <option value="first">Старі спочатку</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {isLoading && <div className={styles.statusMessage}>Завантаження логів...</div>}
        {isError && <div className={styles.errorMessage}>Помилка завантаження даних.</div>}

        {!isLoading && !isError && logs && (
          <table className={styles.logTable}>
            <colgroup>
                <col className={styles.colDate} />
                <col className={styles.colId} />
                <col className={styles.colDetails} />
            </colgroup>
            <thead>
              <tr>
                <th>Дата</th>
                <th>ID Адміна</th>
                <th>Деталі</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log: LogDto) => (
                  <tr key={log.id}>
                    <td>{formatLogDate(log.createdAt)}</td>
                    <td className={styles.uuidCell} title={log.adminId}>
                      {log.adminId}
                    </td>
                    <td className={styles.detailsCell}>{log.details}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '40px' }}>
                     Записів не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LogsModal;
