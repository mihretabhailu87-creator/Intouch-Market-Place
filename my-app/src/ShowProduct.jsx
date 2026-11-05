import AllProduct from './AllProduct';
import Post from './postinput'
import Header from './Header';
import Register from './register';
import Login from './login'
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function ShowAllProducts() {
    return (
        <BrowserRouter>
            <Header />
            <Routes>
                <Route path="/" element={<AllProduct />} />
                <Route path="/Form" element={<Post />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </BrowserRouter>
    );
}

export default ShowAllProducts;