import React from 'react';
import styles from './modal.module.scss';
import LogsModal from './modals/logs-modal';
import AccountsModal from './modals/accounts-modal';
import TeachersModal from './modals/teachers-modal';
import GroupsModal from './modals/groups-modal';
import PlanModal from './modals/plan-modal';
import AdditionalModal from './modals/additional-modal';
import PairModal, { PairModalData } from './modals/pair-modal';

export type OpenWindow = 'Logs' | 'Accounts' | 'Teachers' | 'Groups' | 'Plan' | 'Additional' | 'Pair' | 'None';

interface ModalProps {
  currentWindow: OpenWindow;
  setWindow: (window: OpenWindow) => void;
  onSelectTeacher?: (id: string, name: string) => void;
  onSelectGroup?: (id: string, name: string) => void;
  pairModalData?: PairModalData | null;
}

const Modal: React.FC<ModalProps> = ({
  currentWindow,
  setWindow,
  onSelectTeacher,
  onSelectGroup,
  pairModalData
}) => {
  if (currentWindow === 'None') return null;

  const handleClose = () => setWindow('None');

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        {currentWindow === 'Logs' && <LogsModal handleClose={handleClose} />}
        {currentWindow === 'Accounts' && <AccountsModal handleClose={handleClose} />}
        {currentWindow === 'Teachers' && <TeachersModal handleClose={handleClose} onSelect={onSelectTeacher} />}
        {currentWindow === 'Groups' && <GroupsModal handleClose={handleClose}  onSelect={onSelectGroup}/>}
        {currentWindow === 'Plan' && <PlanModal handleClose={handleClose} />}
        {currentWindow === 'Additional' && <AdditionalModal handleClose={handleClose} />}

        {currentWindow === 'Pair' && (
            <PairModal
                handleClose={handleClose}
                data={pairModalData}
            />
        )}
      </div>
    </div>
  );
};

export default Modal;
