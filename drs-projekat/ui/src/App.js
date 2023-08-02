import './App.css';
import { Routes, Route } from 'react-router-dom';
import Registration from './components/users/Registration';
import Login from './components/users/Login';
import darkTheme from './styles/theme';
import { ThemeProvider } from '@mui/material/styles';

function App() {
  return (
    <>
    <ThemeProvider theme={darkTheme}>
      <Routes>
          <Route path='/signup' element={<Registration/>}/>
          <Route path='/' element={<Login/>}/>
      </Routes>
    </ThemeProvider>
    </>
  );
}

export default App;
