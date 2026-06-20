 // Frontend role utilities

  const ROLES = {
    SALES_REP: 'sales_rep',
    SALES_MANAGER: 'sales_manager',
    FINANCE_MANAGER: 'finance_manager',
    GENERAL_SALES_MANAGER: 'general_sales_manager',
    FIXED_OPS_DIRECTOR: 'fixed_ops_director',
    GENERAL_MANAGER: 'general_manager',
    DEALER_PRINCIPAL: 'dealer_principal'
  };

  const ROLE_HIERARCHY = {
    [ROLES.SALES_REP]: 1,
    [ROLES.SALES_MANAGER]: 2,
    [ROLES.FINANCE_MANAGER]: 3,
    [ROLES.GENERAL_SALES_MANAGER]: 4,
    [ROLES.FIXED_OPS_DIRECTOR]: 4,
    [ROLES.GENERAL_MANAGER]: 5,
    [ROLES.DEALER_PRINCIPAL]: 6
  };

  const ROLE_PERMISSIONS = {
    [ROLES.SALES_REP]: {
      viewOwnDeals: true,
      viewPII: false,
      editDeals: false,
      createDeals: false,
      deleteDeals: false,
      viewAllDeals: false,
      viewTeamDeals: false,
      useChat: true,
      viewReports: false,
      manageUsers: false
    },
    [ROLES.SALES_MANAGER]: {
      viewOwnDeals: true,
      viewPII: true,
      editDeals: true,
      createDeals: true,
      deleteDeals: false,
      viewAllDeals: false,
      viewTeamDeals: true,
      useChat: true,
      viewReports: true,
      manageUsers: false
    },
    [ROLES.FINANCE_MANAGER]: {
      viewOwnDeals: true,
      viewPII: true,
      editDeals: true,
      createDeals: true,
      deleteDeals: false,
      viewAllDeals: false,
      viewTeamDeals: true,
      viewFinanceDeals: true,
      useChat: true,
      viewReports: true,
      manageUsers: false
    },
    [ROLES.GENERAL_SALES_MANAGER]: {
      viewOwnDeals: true,
      viewPII: true,
      editDeals: true,
      createDeals: true,
      deleteDeals: true,
      viewAllDeals: true,
      viewTeamDeals: true,
      useChat: true,
      viewReports: true,
      manageUsers: true
    },
    [ROLES.FIXED_OPS_DIRECTOR]: {
      viewOwnDeals: true,
      viewPII: true,
      editDeals: true,
      createDeals: true,
      deleteDeals: false,
      viewAllDeals: false,
      viewServiceDeals: true,
      useChat: true,
      viewReports: true,
      manageUsers: false
    },
    [ROLES.GENERAL_MANAGER]: {
      viewOwnDeals: true,
      viewPII: true,
      editDeals: true,
      createDeals: true,
      deleteDeals: true,
      viewAllDeals: true,
      viewTeamDeals: true,
      useChat: true,
      viewReports: true,
      manageUsers: true,
      overridePermissions: true
    },
    [ROLES.DEALER_PRINCIPAL]: {
      viewOwnDeals: true,
      viewPII: true,
      editDeals: true,
      createDeals: true,
      deleteDeals: true,
      viewAllDeals: true,
      viewTeamDeals: true,
      useChat: true,
      viewReports: true,
      manageUsers: true,
      overridePermissions: true,
      fullAccess: true
    }
  };

  // Check if RBAC is enabled
  export const isRBACEnabled = () => {
    return process.env.REACT_APP_ENABLE_ROLE_BASED_ACCESS === 'true';
  };

  // Get current user from localStorage
  export const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  };

  // Get user's role
  export const getUserRole = (user) => {
    if (!user) return null;

    // Map old roles to new structure
    if (user.role === 'admin') return ROLES.GENERAL_MANAGER;
    if (user.role === 'manager') return ROLES.SALES_MANAGER;
    if (user.role === 'sales') return ROLES.SALES_REP;

    return user.role || ROLES.SALES_REP;
  };

  // Check if user has permission
  export const hasPermission = (permission) => {
    if (!isRBACEnabled()) return true;

    const user = getCurrentUser();
    if (!user) return false;

    const userRole = getUserRole(user);
    const permissions = ROLE_PERMISSIONS[userRole];

    if (!permissions) return false;

    if (permissions.fullAccess || permissions.overridePermissions) return true;

    return permissions[permission] === true;
  };

  // Check if user can view PII
  export const canViewPII = () => {
    return hasPermission('viewPII');
  };

  // Check if user can edit deals
  export const canEditDeals = () => {
    return hasPermission('editDeals');
  };

  // Check if user can create deals
  export const canCreateDeals = () => {
    return hasPermission('createDeals');
  };

  // Check if user has minimum role level
  export const hasRoleLevel = (requiredRole) => {
    if (!isRBACEnabled()) return true;

    const user = getCurrentUser();
    if (!user) return false;

    const userRole = getUserRole(user);
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 999;

    return userLevel >= requiredLevel;
  };

  export { ROLES };
