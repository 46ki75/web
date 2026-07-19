import {
  createComponent,
  createContext,
  createSignal,
  useContext,
  type Accessor,
  type ParentProps,
  type Setter,
} from "solid-js";

import type { BlogResponse, BlogTagResponse } from "../../openapi/blog";

export interface BlogProviderProps {
  blogMeta: BlogResponse[];
  tags: BlogTagResponse[];
}

export interface BlogContextValue {
  readonly blogMeta: BlogResponse[];
  readonly tags: BlogTagResponse[];
  selectedTagIds: Accessor<string[]>;
  setSelectedTagIds: Setter<string[]>;
}

const BlogContext = createContext<BlogContextValue>();

export function BlogProvider(props: ParentProps<BlogProviderProps>) {
  const [selectedTagIds, setSelectedTagIds] = createSignal<string[]>([]);
  const value: BlogContextValue = {
    get blogMeta() {
      return props.blogMeta;
    },
    get tags() {
      return props.tags;
    },
    selectedTagIds,
    setSelectedTagIds,
  };

  return createComponent(BlogContext.Provider, {
    value,
    get children() {
      return props.children;
    },
  });
}

export function useBlog(): BlogContextValue {
  const context = useContext(BlogContext);
  if (!context) throw new Error("useBlog must be used inside BlogProvider");
  return context;
}
