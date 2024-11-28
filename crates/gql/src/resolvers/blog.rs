pub struct Blog {
    pub slug: String,
}

impl Blog {
    pub fn new(ctx: &async_graphql::Context, slug: String) -> Result<Self, async_graphql::Error> {
        Ok(Blog {
            slug: slug.to_string(),
        })
    }

    pub fn list(ctx: &async_graphql::Context) -> Result<Vec<Self>, async_graphql::Error> {
        Ok(vec![
            Blog {
                slug: "001".to_string(),
            },
            Blog {
                slug: "002".to_string(),
            },
            Blog {
                slug: "003".to_string(),
            },
        ])
    }
}

#[async_graphql::Object]
impl Blog {
    pub async fn slug(&self) -> String {
        self.slug.to_string()
    }
}
