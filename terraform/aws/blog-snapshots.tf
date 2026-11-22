resource "aws_cloudfront_key_value_store" "blog_snapshots" {
  name    = "${terraform.workspace}-46ki75-web-cloudfront-kvs-blog-snapshots"
  comment = "Activation pointer and readiness markers for the public blog snapshots"
}

resource "aws_cloudfront_function" "blog_snapshots" {
  name                         = "${terraform.workspace}-46ki75-web-cloudfront-function-blog-snapshots"
  runtime                      = "cloudfront-js-2.0"
  comment                      = "Select a prepared blog release behind the public cache URLs"
  publish                      = true
  code                         = file("${path.module}/assets/blogSnapshots.js")
  key_value_store_associations = [aws_cloudfront_key_value_store.blog_snapshots.arn]
}
