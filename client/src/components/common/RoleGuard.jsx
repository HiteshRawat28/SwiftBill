import React from 'react';
import useAuthStore from '../../store/authStore';

const RoleGuard = ({ allowedRoles, children, fallback = null }) => {
  const { user } = useAuthStore();

  if (!user || !user.role) {
    return fallback;
  }

  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return fallback;
};

export default RoleGuard;
