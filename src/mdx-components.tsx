import type { MDXComponents } from 'mdx/types'
import React from 'react'
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  InlineText,
  Paragraph
} from 'relmethis'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: ({ children }) =>
      children != null ? <Heading1>{children.toString()}</Heading1> : null,
    h2: ({ children }) =>
      children != null ? <Heading2>{children.toString()}</Heading2> : null,
    h3: ({ children }) =>
      children != null ? <Heading3>{children.toString()}</Heading3> : null,
    h4: ({ children }) =>
      children != null ? <Heading4>{children.toString()}</Heading4> : null,
    h5: ({ children }) =>
      children != null ? <Heading5>{children.toString()}</Heading5> : null,
    h6: ({ children }) =>
      children != null ? <Heading6>{children.toString()}</Heading6> : null,
    p: ({ children }) => <Paragraph>{children}</Paragraph>,
    span: ({ children }) =>
      children != null ? <InlineText>{children.toString()}</InlineText> : null,
    code: ({ children }) =>
      children != null ? (
        <InlineText code>{children.toString()}</InlineText>
      ) : null
  }
}
