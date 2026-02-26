
export interface Category {
    id: string;
    name: string;
    slug: string;
    color: string;
    blog_id?: string;
    parent_id?: string | null;
    escopo?: string[];
    children?: Category[];
}

export interface FlatCategory extends Category {
    depth: number;
}

/**
 * Transforms a flat list of categories into a tree structure.
 */
export function buildCategoryTree(rawCategories: Category[]): Category[] {
    const catMap: Record<string, Category> = {};
    const tree: Category[] = [];

    // Initialize map
    rawCategories.forEach(cat => {
        catMap[cat.id] = { ...cat, children: [] };
    });

    // Build hierarchy
    rawCategories.forEach(cat => {
        if (cat.parent_id && catMap[cat.parent_id]) {
            catMap[cat.parent_id].children?.push(catMap[cat.id]);
        } else {
            tree.push(catMap[cat.id]);
        }
    });

    // Sort children recursively
    const sortCats = (cats: Category[]) => {
        cats.sort((a, b) => a.name.localeCompare(b.name));
        cats.forEach(c => {
            if (c.children?.length) sortCats(c.children);
        });
    };
    sortCats(tree);

    return tree;
}

/**
 * Flattens a category tree into a list with depth information for selects.
 */
export function flattenCategoryTree(
    cats: Category[],
    depth = 0,
    excludeId?: string
): FlatCategory[] {
    let flat: FlatCategory[] = [];
    for (const cat of cats) {
        if (cat.id === excludeId) continue; // Prevent circular reference
        flat.push({ ...cat, depth });
        if (cat.children && cat.children.length > 0) {
            flat = [...flat, ...flattenCategoryTree(cat.children, depth + 1, excludeId)];
        }
    }
    return flat;
}
