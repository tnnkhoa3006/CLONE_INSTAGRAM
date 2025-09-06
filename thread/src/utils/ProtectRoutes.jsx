import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProtectRoutes = ({children}) => {
    const {user} = useSelector(store => store.auth);
    const navigate = useNavigate();
    
    useEffect(() => {
        if(!user || Object.keys(user).length === 0){
            // Chuyển hướng về login nếu không có user hoặc user rỗng
            navigate('/login', { replace: true });
        }
    }, [user, navigate]);

    // Chỉ render children khi đã có user
    if (!user || Object.keys(user).length === 0) {
        return null;
    }

    return <div>{children}</div>;
}

export default ProtectRoutes
