/**
 * Action Registry
 *
 * Singleton that manages action registration and execution.
 * This replaces the old make() + ActionsProvider pattern.
 *
 * Usage:
 * ```ts
 * import { action, registry } from '@ariob/ripple/nodes/_shared';
 *
 * // Register an action
 * action({
 *   verb: 'edit',
 *   label: 'Edit',
 *   icon: 'pencil',
 *   category: 'primary',
 *   ownerOnly: true,
 * }, async (ctx) => {
 *   // execute edit
 *   return success();
 * });
 *
 * // Execute an action
 * const result = await registry.execute('edit', context);
 * ```
 */

import { Result } from '@ariob/core';
import type { ActionMeta, RegistryContext, ActionResult } from './types';

/**
 * Handler function type
 */
export type ActionHandler = (ctx: RegistryContext) => Promise<ActionResult>;

/**
 * Registered action with meta + handler
 */
export interface RegisteredAction {
  meta: ActionMeta;
  handler: ActionHandler;
}

/**
 * ActionRegistry - singleton for managing actions
 */
class ActionRegistry {
  private actions = new Map<string, RegisteredAction>();

  /**
   * Register an action
   */
  register(meta: ActionMeta, handler: ActionHandler): void {
    if (this.actions.has(meta.verb)) {
      console.warn(`[ActionRegistry] Overwriting action: ${meta.verb}`);
    }
    this.actions.set(meta.verb, { meta, handler });
  }

  /**
   * Get a registered action by verb
   */
  get(verb: string): RegisteredAction | undefined {
    return this.actions.get(verb);
  }

  /**
   * Check if an action is available in the given context
   */
  available(verb: string, ctx: RegistryContext): boolean {
    const action = this.actions.get(verb);
    if (!action) return false;

    const { meta } = action;

    // Owner-only check
    if (meta.ownerOnly && !ctx.isOwner) {
      return false;
    }

    // Degree check
    if (meta.degrees && !meta.degrees.includes(ctx.degree)) {
      return false;
    }

    // Variant check
    if (meta.variants && !meta.variants.includes(ctx.variant)) {
      return false;
    }

    return true;
  }

  /**
   * Get available actions for a node
   *
   * Takes the node's declared actions array and filters
   * based on context availability.
   */
  forNode(nodeActions: string[], ctx: RegistryContext): RegisteredAction[] {
    return nodeActions
      .map((verb) => this.get(verb))
      .filter((a): a is RegisteredAction => a !== undefined && this.available(a.meta.verb, ctx));
  }

  /**
   * Execute an action
   */
  async execute(verb: string, ctx: RegistryContext): Promise<Result<ActionResult, string>> {
    const action = this.actions.get(verb);

    if (!action) {
      return Result.error(`Unknown action: ${verb}`);
    }

    if (!this.available(verb, ctx)) {
      return Result.error(`Action not available: ${verb}`);
    }

    try {
      const result = await action.handler(ctx);
      return Result.ok(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return Result.error(message);
    }
  }

  /**
   * Get all registered actions
   */
  all(): RegisteredAction[] {
    return Array.from(this.actions.values());
  }

  /**
   * Get action verbs by category
   */
  byCategory(category: ActionMeta['category']): RegisteredAction[] {
    return this.all().filter((a) => a.meta.category === category);
  }

  /**
   * Clear all registrations (for testing)
   */
  clear(): void {
    this.actions.clear();
  }
}

/**
 * Singleton registry instance
 */
export const registry = new ActionRegistry();

/**
 * Input type for action() with optional fields that have defaults
 */
export type ActionMetaInput = Omit<ActionMeta, 'variant' | 'confirm' | 'ownerOnly'> & {
  variant?: ActionMeta['variant'];
  confirm?: boolean;
  ownerOnly?: boolean;
};

/**
 * Helper to register an action
 *
 * Usage:
 * ```ts
 * export const editProfile = action({
 *   verb: 'edit',
 *   label: 'Edit',
 *   icon: 'pencil',
 *   category: 'primary',
 *   ownerOnly: true,
 * }, async (ctx) => success());
 * ```
 */
export function action(input: ActionMetaInput, handler: ActionHandler): RegisteredAction {
  // Apply defaults
  const meta: ActionMeta = {
    variant: 'ghost',
    confirm: false,
    ownerOnly: false,
    ...input,
  };
  registry.register(meta, handler);
  return { meta, handler };
}

/**
 * Helper to define action meta without registering
 * Useful for building configs
 */
export function define(meta: Omit<ActionMeta, 'variant'> & { variant?: ActionMeta['variant'] }): ActionMeta {
  return {
    variant: 'ghost',
    ...meta,
  } as ActionMeta;
}
