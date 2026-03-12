/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 */
export class ComponentTreeManager {
    components = new Map();
    tree = [];
    eventBus;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    addComponent(component) {
        this.components.set(component.id, component);
        // Add to root tree if no parent
        if (!component.parent) {
            this.tree.push(component);
        }
        this.eventBus.emit("component:added", component);
    }
    getComponentById(id) {
        return this.components.get(id);
    }
    getTree() {
        return this.tree;
    }
    getNextComponent(current) {
        if (current.children && current.children.length > 0) {
            return current.children[0];
        }
        let node = current;
        while (node) {
            if (node.parent) {
                const siblings = node.parent.children;
                const index = siblings.indexOf(node);
                if (index < siblings.length - 1) {
                    return siblings[index + 1];
                }
            }
            else {
                // Check root level siblings
                const index = this.tree.indexOf(node);
                if (index < this.tree.length - 1) {
                    return this.tree[index + 1];
                }
            }
            node = node.parent;
        }
        return null;
    }
    getPreviousComponent(current) {
        if (current.parent) {
            const siblings = current.parent.children;
            const index = siblings.indexOf(current);
            if (index > 0) {
                const prev = siblings[index - 1];
                return prev.children && prev.children.length > 0
                    ? this.getLastDescendant(prev)
                    : prev;
            }
            return current.parent;
        }
        const index = this.tree.indexOf(current);
        if (index > 0) {
            const prev = this.tree[index - 1];
            return prev.children && prev.children.length > 0
                ? this.getLastDescendant(prev)
                : prev;
        }
        return null;
    }
    getLastDescendant(node) {
        if (!node.children || node.children.length === 0) {
            return node;
        }
        return this.getLastDescendant(node.children[node.children.length - 1]);
    }
    removeComponent(id) {
        const component = this.components.get(id);
        if (!component)
            return;
        if (component.parent) {
            const index = component.parent.children.indexOf(component);
            if (index > -1) {
                component.parent.children.splice(index, 1);
            }
        }
        else {
            const index = this.tree.indexOf(component);
            if (index > -1) {
                this.tree.splice(index, 1);
            }
        }
        this.components.delete(id);
        this.eventBus.emit("component:removed", id);
    }
    updateComponent(id, updates) {
        const component = this.components.get(id);
        if (!component)
            return;
        Object.assign(component, updates);
        this.eventBus.emit("component:updated", component);
    }
    clear() {
        this.components.clear();
        this.tree = [];
    }
    getAllComponents() {
        return Array.from(this.components.values());
    }
}
