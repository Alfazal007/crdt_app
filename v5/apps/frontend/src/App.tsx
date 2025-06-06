import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignupPage from './components/SignupComponent';
import SigninPage from './components/SigninComponent';
import { Toaster } from 'sonner';
import LandingPage from './components/Landing';
import UserProvider from './context/UserContext';
import Dashboard from './components/dashboard';
import Document from './components/document';
import EditDocument from './components/editDocument';

function App() {
    return (
        <>
            <BrowserRouter>
                <UserProvider>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/signin" element={<SigninPage />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/document" element={<Document />} />
                        <Route path="/edit-document" element={<EditDocument />} />
                    </Routes>
                </UserProvider>
                <Toaster />
            </BrowserRouter >
        </>
    )
}

export default App
