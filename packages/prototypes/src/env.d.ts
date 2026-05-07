/* CSS Modules — typings for `import styles from "./X.module.css"` */
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

/* Image imports resolve to a hashed asset URL string at build time
 * (handled by Vite). Typed as `string` so the cover image references
 * inside each prototype's `meta.ts` typecheck cleanly. */
declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.jpg" {
  const src: string;
  export default src;
}
declare module "*.jpeg" {
  const src: string;
  export default src;
}
declare module "*.svg" {
  const src: string;
  export default src;
}
