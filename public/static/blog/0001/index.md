# Markdown Components Showcase

This text features ~~strikethrough~~, **bold**, _italic_, and **underline** formatting. There's also `inline code`. [Here is a link](https://example.com).

## Blockquote

> This is a blockquote, used for quoting external content or highlighting important sections in your document.

---

## Formatting in Paragraphs

This section demonstrates different text formatting options. You can use **bold** text to emphasize important information, _italic_ text for highlighting terms, **underline** for underlined sections, and even ~~strikethrough~~ to indicate deletions.

Additionally, here's an example of `inline code`. [You can also include links](https://example.com) within your paragraphs for navigation purposes.

---

## Code Example

Below is a code snippet demonstrating simple Rust code:

```rust [src/main.rs] {2, 5-11, 20}
use reqwest::Error;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct Post {
    #[serde(rename = "userId")]
    user_id: u32,
    id: u32,
    title: String,
    body: String,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    let url = "https://jsonplaceholder.typicode.com/posts";
    let response = reqwest::get(url).await?;
    let posts: Vec<Post> = response.json().await?;

    for post in posts.iter().take(5) {
        println!("ID: {}, Title: {}", post.id, post.title);
    }

    Ok(())
}
```

---

## Footnotes

Sometimes, you may want to add extra details without cluttering the main text. This is where footnotes come in handy.

This is part of the main text[^1].

This is another part of the main text[^2].

[^1]: Footnote one with additional details goes here.

[^2]: Footnote two with more explanation is included here.

---

## Headings

You can create hierarchical structures in your document using headings of different levels:

# Heading1

## Heading2

### Heading3

#### Heading4

##### Heading5

###### Heading6

---

## Image Example

![A beautiful nature image from Unsplash](https://images.unsplash.com/photo-1556983703-27576e5afa24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb)

---

## Lists

Here are some bulleted and numbered lists for organizing information:

- Bulleted 1
- Bulleted 2

1. Numbered 1
2. Numbered 2
   1. Numbered 12a
   2. Numbered 2-b

- Bulleted 1
- Bulleted 2
- - Bulleted 2-a
- - Bulleted 2-b

---

## Table Example

Tables can be used to represent structured data:

| Name          | Department  | Position          |
| ------------- | ----------- | ----------------- |
| John Doe      | Engineering | Software Engineer |
| Jane Smith    | Marketing   | Marketing Manager |
| Emily Johnson | Finance     | Financial Analyst |

|     Name      | Department  |          Position |
| :-----------: | :---------- | ----------------: |
|   John Doe    | Engineering | Software Engineer |
|  Jane Smith   | Marketing   | Marketing Manager |
| Emily Johnson | Finance     | Financial Analyst |

---

## Definition Links

You can use reference-style links for cleaner markdown syntax:

Here is a link to [GitHub][GitHub Home Page].

Here is another link to [Google][Google Home Page].

![Unsplash image][Unsplash Image]

[GitHub Home Page]: https://github.com 'GitHub'
[Google Home Page]: https://www.google.com 'Google'
[Unsplash Image]: https://images.unsplash.com/photo-1556983703-27576e5afa24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb 'Nature'

---

## GFM Alerts

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
