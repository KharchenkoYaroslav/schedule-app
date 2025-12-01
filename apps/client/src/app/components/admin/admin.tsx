import React, { useState } from 'react';
import Main from "./main";
import Sidebar from "./sidebar";
import styles from './admin.module.scss';
import Modal, { OpenWindow } from "./modal";
import { PairModalData } from './modals/pair-modal';

export default function Admin() {
  const [currentWindow, setWindow] = useState<OpenWindow>('None');

  const [selectedTeacher, setSelectedTeacher] = useState<{ id: string; name: string } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);

  const [pairModalData, setPairModalData] = useState<PairModalData | null>(null);

  return (
    <div className={styles.admin}>
      <Sidebar
        setWindow={setWindow}
      />

      <Main
        selectedTeacher={selectedTeacher}
        selectedGroup={selectedGroup}
        setPairModalData={setPairModalData}
        setWindow={setWindow}
      />

      <Modal
        currentWindow={currentWindow}
        setWindow={setWindow}
        onSelectTeacher={(id, name) => {
          setSelectedTeacher({ id, name });
          setSelectedGroup(null);
        }}
        onSelectGroup={(id, name) => {
          setSelectedGroup({ id, name });
          setSelectedTeacher(null); 
        }}
        pairModalData={pairModalData}
      />
    </div>
  );
}
