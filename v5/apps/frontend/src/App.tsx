import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignupPage from './components/SignupComponent';
import SigninPage from './components/SigninComponent';

function App() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/signin" element={<SigninPage />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
