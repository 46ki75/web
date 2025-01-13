# Manual Managed Resources

## Amazon S3

- `shared-46ki75-web-s3-bucket-terraform-tfstate`: bucket of storing `terraform.tfstate`

## SSM Parameter Store

- `/shared/46ki75/web/ssm/parameter/notion/database/id`
- `/{ENV}/46ki75/web/ssm/parameter/notion/secret`

## Route53 (Parent Zone)

You need to add following records after creating child zones.

- dev-www.46ki75.com. IN NS {CHILD_NS_DOMAIN}`
- stg-www.46ki75.com. IN NS {CHILD_NS_DOMAIN}`
- www.46ki75.com. IN NS {CHILD_NS_DOMAIN}`

e.g.: 

```
dev-www.46ki75.com. IN NS ns-123.awsdns-45.org.
dev-www.46ki75.com. IN NS ns-456.awsdns-78.com.
dev-www.46ki75.com. IN NS ns-789.awsdns-12.net.
dev-www.46ki75.com. IN NS ns-012.awsdns-34.co.uk.

stg-www.46ki75.com. IN NS ns-321.awsdns-54.org.
stg-www.46ki75.com. IN NS ns-654.awsdns-87.com.
stg-www.46ki75.com. IN NS ns-987.awsdns-21.net.
stg-www.46ki75.com. IN NS ns-210.awsdns-43.co.uk.

www.46ki75.com. IN NS ns-231.awsdns-65.org.
www.46ki75.com. IN NS ns-432.awsdns-76.com.
www.46ki75.com. IN NS ns-543.awsdns-87.net.
www.46ki75.com. IN NS ns-654.awsdns-98.co.uk.
```