use notionrs_types::prelude::*;

pub(crate) fn get_property<'a>(
    properties: &'a std::collections::HashMap<String, PageProperty>,
    property_name: &str,
) -> Result<&'a PageProperty, crate::error::Error> {
    let result =
        properties
            .get(property_name)
            .ok_or(crate::error::Error::NotionPagePropertyNotFound(
                property_name.to_owned(),
            ))?;

    Ok(result)
}
