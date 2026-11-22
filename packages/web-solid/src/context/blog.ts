import {
  createComponent,
  createContext,
  createSignal,
  useContext,
  type Accessor,
  type ParentProps,
  type Setter,
} from "solid-js";

import type { BlogSnapshotEntry, BlogTagSnapshot } from "../data/blog-snapshot";

export interface BlogProviderProps {
  blogMeta: BlogSnapshotEntry[];
  tags: BlogTagSnapshot[];
}

export interface BlogContextValue {
  readonly blogMeta: BlogSnapshotEntry[];
  readonly tags: BlogTagSnapshot[];
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

  return createComponent(BlogContext, {
    value,
    get children() {
      return props.children;
    },
  });
}

export function useBlog(): BlogContextValue {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error("useBlog must be used inside BlogProvider");
  }
  return context;
}
