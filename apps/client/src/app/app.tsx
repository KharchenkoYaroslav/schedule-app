import { Route, Routes, Link, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navigation from './components/navigation';
import styles from './app.module.scss';
import Schedules from './components/schedules';
import Auth from './components/auth';
import { ProtectedRoute } from './components/protected-route';
import { AuthProvider } from './context/auth';
import Admin from './components/admin/admin';

export function App() {
  const GroupScheduleRoute = () => {
    const { groupId } = useParams<{ groupId: string }>();
    return <Schedules type="group" id={groupId ?? ''} />;
  };

  const TeacherScheduleRoute = () => {
    const { teacherId } = useParams<{ teacherId: string }>();
    return <Schedules type="teacher" id={teacherId ?? ''} />;
  };

  return (
    <AuthProvider>
      <div className={styles.appContainer}>
        <Routes>
          <Route
            path="/"
            element={
              <Navigation />
            }
          />

          <Route
            path="/schedule/group/:groupId"
            element={<GroupScheduleRoute />}
          />
          <Route
            path="/schedule/teacher/:teacherId"
            element={<TeacherScheduleRoute />}
          />

          {/* Адмінка - вхід */}
          <Route path="admin/auth" element={<Auth />} />

          {/* Адмінка - функціонал */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Admin/>}></Route>
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div>
                <h1>Сторінку не знайдено</h1>
                <Link to="/">На головну</Link>
              </div>
            }
          />
        </Routes>
      </div>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
