import { iconMeta, type IconName } from "./iconData";
import type { IconCategory } from "./Icon";

export interface IconEntry {
  name: IconName;
  description: string;
  category: IconCategory;
}

const allIcons: IconEntry[] = Object.entries(iconMeta).map(([name, meta]) => ({
  name: name as IconName,
  description: meta.description,
  category: meta.category as IconCategory,
}));

export function getAllIcons(): IconEntry[] {
  return allIcons;
}

export function getIconsByCategory(category: IconCategory): IconEntry[] {
  return allIcons.filter((icon) => icon.category === category);
}

export function searchIcons(query: string, category?: IconCategory): IconEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return category ? getIconsByCategory(category) : allIcons;

  const terms = q.split(/\s+/);

  return allIcons.filter((icon) => {
    if (category && icon.category !== category) return false;

    const haystack = `${icon.name} ${icon.description}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function getIconMeta(name: IconName): IconEntry | undefined {
  const meta = iconMeta[name];
  if (!meta) return undefined;
  return {
    name,
    description: meta.description,
    category: meta.category as IconCategory,
  };
}

export function getCategories(): IconCategory[] {
  return ["originals", "custom", "logo", "logo-color", "flag"];
}
