import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { mdxComponents } from "./mdx-components";

/**
 * Renders an MDX string (frontmatter already stripped) as a server component.
 * Plugins: GitHub-flavored markdown + heading slugs for anchor links.
 */
export async function Mdx({ source }: { source: string }) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
  });
  return content;
}
