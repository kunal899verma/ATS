declare module "*.mdx" {
  import type { ComponentType } from "react";

  const component: ComponentType;
  export const metadata: {
    title: string;
    description: string;
    publishedAt: string;
    readingTime: string;
    category: string;
  };
  export default component;
}
