/* CSS Modules — typings for `import styles from "./X.module.css"` */
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
