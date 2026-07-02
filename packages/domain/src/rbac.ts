import type { RoleCode } from './entities.js';
export type Permission = 'stations.read' | 'transactions.read' | 'tanks.read' | 'alerts.read' | 'alerts.manage' | 'cards.read' | 'cards.manage' | 'users.manage' | 'controllers.manage' | 'analytics.read' | 'ai.read';
export const rolePermissions: Record<RoleCode, Permission[]> = {
  owner: ['stations.read', 'transactions.read', 'tanks.read', 'alerts.read', 'alerts.manage', 'cards.read', 'cards.manage', 'users.manage', 'controllers.manage', 'analytics.read', 'ai.read'],
  admin: ['stations.read', 'transactions.read', 'tanks.read', 'alerts.read', 'alerts.manage', 'cards.read', 'cards.manage', 'users.manage', 'controllers.manage', 'analytics.read'],
  manager: ['stations.read', 'transactions.read', 'tanks.read', 'alerts.read', 'cards.read', 'analytics.read', 'ai.read'],
  operator: ['stations.read', 'transactions.read', 'tanks.read', 'alerts.read', 'cards.read'],
  service: ['stations.read', 'tanks.read', 'alerts.read', 'controllers.manage'],
  auditor: ['stations.read', 'transactions.read', 'tanks.read', 'alerts.read', 'analytics.read'],
  'card-manager': ['cards.read', 'cards.manage', 'transactions.read'],
};
export function roleCan(role: RoleCode, permission: Permission) { return rolePermissions[role].includes(permission); }