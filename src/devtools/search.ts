/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */

import type { ComponentNode, ComponentTreeManager } from "./component-tree.js";

export class SearchManager {
  constructor(private tree: ComponentTreeManager) {}

  search(query: string): ComponentNode[] {
    if (!query || query.length === 0) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const allComponents = this.tree.getAllComponents();

    return allComponents.filter((component) => {
      // Search by component name
      if (component.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search by component type
      if (component.type.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search by props
      for (const [key, value] of Object.entries(component.props)) {
        if (
          key.toLowerCase().includes(lowerQuery) ||
          this.valueMatches(value, lowerQuery)
        ) {
          return true;
        }
      }

      // Search by state
      for (const [key, value] of Object.entries(component.state)) {
        if (
          key.toLowerCase().includes(lowerQuery) ||
          this.valueMatches(value, lowerQuery)
        ) {
          return true;
        }
      }

      return false;
    });
  }

  private valueMatches(value: any, query: string): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === "string") {
      return value.toLowerCase().includes(query);
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value).toLowerCase().includes(query);
    }

    if (typeof value === "object") {
      try {
        const json = JSON.stringify(value).toLowerCase();
        return json.includes(query);
      } catch {
        return false;
      }
    }

    return false;
  }

  searchByName(name: string): ComponentNode[] {
    const lowerName = name.toLowerCase();
    return this.tree.getAllComponents().filter((c) =>
      c.name.toLowerCase().includes(lowerName)
    );
  }

  searchByType(type: string): ComponentNode[] {
    const lowerType = type.toLowerCase();
    return this.tree.getAllComponents().filter((c) =>
      c.type.toLowerCase().includes(lowerType)
    );
  }

  searchByProp(propName: string, propValue?: any): ComponentNode[] {
    return this.tree.getAllComponents().filter((c) => {
      if (!(propName in c.props)) {
        return false;
      }
      if (propValue === undefined) {
        return true;
      }
      return c.props[propName] === propValue;
    });
  }
}
