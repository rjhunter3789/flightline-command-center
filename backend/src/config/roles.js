

  // Role hierarchy (higher number = more access)
  const ROLE_HIERARCHY = {
    [ROLES.SALES_REP]: 1,
    [ROLES.SALES_MANAGER]: 2,
    [ROLES.FINANCE_MANAGER]: 3,
    [ROLES.GENERAL_SALES_MANAGER]: 4,
    [ROLES.FIXED_OPS_DIRECTOR]: 4,
    [ROLES.GENERAL_MANAGER]: 5,
    [ROLES.DEALER_PRINCIPAL]: 6
  };

  // Role permissions
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

  module.exports = {
    ROLES,
    ROLE_HIERARCHY,
    ROLE_PERMISSIONS
  };
