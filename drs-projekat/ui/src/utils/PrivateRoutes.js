import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const PrivateRoutes = () => {
    const user = useSelector((state) => state.user.user);

    return (
        user.token ? <Outlet/> : <Navigate to="/login"/>
    )
}

export const Redirect = () => {
    const user = useSelector((state) => state.user.user);

    return (
        user.token ? <Navigate to="/"/> : <Outlet/>
    )
}