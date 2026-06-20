 const { ROLES, ROLE_HIERARCHY, ROLE_PERMISSIONS } = require('../config/roles');

  // Check if RBAC is enabled
  const isRBACEnabled = () => {
    return process.env.ENABLE_ROLE_BASED_ACCESS === 'true';
  };

  // Get user's role (with fallback for legacy systems)
  const getUserRole = (user) => {
    if (!user) return null;

    // Map old roles to new structure if needed
    if (user.role === 'admin') return ROLES.GENERAL_MANAGER;
    if (user.role === 'manager') return ROLES.SALES_MANAGER;
    if (user.role === 'sales') return ROLES.SALES_REP;

    return user.role || ROLES.SALES_REP;
  };

  // Check if user has specific permission
  const hasPermission = (user, permission) => {
    if (!isRBACEnabled()) return true; // All permissions granted if RBAC disabled

    const userRole = getUserRole(user);
    const permissions = ROLE_PERMISSIONS[userRole];

    if (!permissions) return false;

    // Dealer Principal and GM can override
    if (permissions.fullAccess || permissions.overridePermissions) return true;

    return permissions[permission] === true;
  };

  // Check if user can view specific deal
  const canViewDeal = (user, deal) => {
    if (!isRBACEnabled()) return true;

    const userRole = getUserRole(user);
    const permissions = ROLE_PERMISSIONS[userRole];

    if (!permissions) return false;

    // Full access roles
    if (permissions.fullAccess || permissions.viewAllDeals) return true;

    // Own deals
    if (permissions.viewOwnDeals && deal.salesPerson === user.name) return true;

    // Team deals
    if (permissions.viewTeamDeals && user.team && deal.team === user.team) return true;

    // Department specific
    if (permissions.viewFinanceDeals && deal.department === 'finance') return true;
    if (permissions.viewServiceDeals && deal.department === 'service') return true;

    return false;
  };

  // Check if user role is higher or equal to required role
  const hasRoleLevel = (user, requiredRole) => {
    if (!isRBACEnabled()) return true;

    const userRole = getUserRole(user);
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 999;

    return userLevel >= requiredLevel;
  };

  // Mask PII data based on user permissions
  const maskPII = (data, user) => {
    if (!isRBACEnabled()) return data;

    if (hasPermission(user, 'viewPII')) return data;

    // Mask sensitive fields
    const masked = { ...data };

    if (masked.customerPhone) {
      masked.customerPhone = masked.customerPhone.replace(/(\d{3})\d{3}(\d{4})/, '$1-XXX-$2');
    }

    if (masked.customerEmail) {
      const [local, domain] = masked.customerEmail.split('@');
      masked.customerEmail = `${local.substring(0, 2)}***@${domain}`;
    }

    if (masked.driversLicense) {
      masked.driversLicense = `***${masked.driversLicense.slice(-4)}`;
    }

    if (masked.ssn) {
      masked.ssn = `***-**-${masked.ssn.slice(-4)}`;
    }

    return masked;
  };

  // Middleware to check permissions
  const requirePermission = (permission) => {
    return (req, res, next) => {
      if (!isRBACEnabled()) return next();

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!hasPermission(req.user, permission)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    };
  };

  // Filter deals based on user permissions
  const filterDealsForUser = (deals, user) => {
    if (!isRBACEnabled()) return deals;

    return deals.filter(deal => canViewDeal(user, deal));
  };

  module.exports = {
    isRBACEnabled,
    getUserRole,
    hasPermission,
    canViewDeal,
    hasRoleLevel,
    maskPII,
    requirePermission,
    filterDealsForUser,
    ROLES
  };
