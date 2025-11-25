import { AccessPolicyInterface } from '../types';
import { BaseModel } from './base';

/**
 * AccessPolicy class for managing IAM access control policies
 * 
 * This class represents an access control policy in the Mosaia platform, which
 * defines fine-grained permissions for resources and actions. Access policies
 * are used to implement role-based access control (RBAC) and can have either
 * 'allow' or 'deny' effects.
 * 
 * Features:
 * - Policy effect management (allow/deny)
 * - Action and resource definitions
 * - Organization-scoped policies
 * - Conditional access control
 * - Policy lifecycle management
 * 
 * @remarks
 * Access policies are crucial for:
 * - Fine-grained access control
 * - Security policy enforcement
 * - Resource protection
 * - Compliance and auditing
 * - Multi-tenant access management
 * 
 * @example
 * Basic policy creation:
 * ```typescript
 * import { AccessPolicy } from 'mosaia-node-sdk';
 * 
 * // Create an allow policy
 * const policy = new AccessPolicy({
 *   name: 'Admin Access',
 *   effect: 'allow',
 *   actions: ['users:read', 'users:write', 'organizations:read'],
 *   resources: ['users', 'organizations']
 * });
 * 
 * await policy.save();
 * ```
 * 
 * @example
 * Deny policy:
 * ```typescript
 * // Create a deny policy
 * const denyPolicy = new AccessPolicy({
 *   name: 'Restricted Access',
 *   effect: 'deny',
 *   actions: ['users:delete'],
 *   resources: ['users:*']
 * });
 * 
 * await denyPolicy.save();
 * ```
 * 
 * @extends BaseModel<AccessPolicyInterface>
 * @category Models
 */
export default class AccessPolicy extends BaseModel<AccessPolicyInterface> {
    /**
     * Creates a new AccessPolicy instance
     * 
     * Initializes an access control policy with the provided configuration data.
     * Policies define what actions can be performed on which resources, with
     * either an 'allow' or 'deny' effect.
     * 
     * @param data - Configuration data including:
     *               - name: Policy name
     *               - effect: 'allow' or 'deny'
     *               - actions: Array of action strings (e.g., ['users:read', 'users:write'])
     *               - resources: Array of resource strings (e.g., ['users', 'organizations'])
     *               - conditions: Optional conditional access rules
     * @param uri - Optional custom URI path for the policy endpoint
     * 
     * @example
     * Basic policy:
     * ```typescript
     * const policy = new AccessPolicy({
     *   name: 'Read Only Access',
     *   effect: 'allow',
     *   actions: ['users:read', 'organizations:read'],
     *   resources: ['users', 'organizations']
     * });
     * ```
     * 
     * @example
     * Advanced policy with conditions:
     * ```typescript
     * const policy = new AccessPolicy({
     *   name: 'Time-based Access',
     *   effect: 'allow',
     *   actions: ['users:read'],
     *   resources: ['users'],
     *   conditions: {
     *     time: {
     *       between: ['09:00', '17:00']
     *     }
     *   }
     * }, '/org/iam/policy');
     * ```
     */
    constructor(data: Partial<AccessPolicyInterface>, uri?: string) {
        super(data, uri || '/iam/policy');
    }
}

