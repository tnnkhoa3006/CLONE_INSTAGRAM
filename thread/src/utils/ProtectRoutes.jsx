import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProtectRoutes = ({children}) => {
    const {user} = useSelector(store => store.auth);
    const navigate = useNavigate();
    useEffect(() => {
        if(!user){
            navigate('/login')
        }
    })
  return (
    <div>{children}</div>
  )
}

export default ProtectRoutes
