
resource "aws_glue_catalog_table" "access" {
  name          = "${terraform.workspace}-46ki75-web-glue-table-access"
  database_name = aws_glue_catalog_database.default.name

  partition_keys {
    name = "partition_date"
    type = "string"
  }

  parameters = {
    "projection.enabled" = "true",

    "projection.partition_date.format"        = "yyyy/MM/dd",
    "projection.partition_date.interval"      = "1",
    "projection.partition_date.interval.unit" = "DAYS",
    "projection.partition_date.range"         = "2025/04/03,NOW",
    "projection.partition_date.type"          = "date",

    "storage.location.template" = "s3://${aws_s3_bucket.analyze.bucket}/exports/cloudfront/access/$${partition_date}",
  }

  storage_descriptor {
    location      = "s3://${aws_s3_bucket.analyze.bucket}/exports/cloudfront/access/"
    input_format  = "org.apache.hadoop.mapred.TextInputFormat"
    output_format = "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat"

    ser_de_info {
      serialization_library = "com.amazon.ionhiveserde.IonHiveSerDe"
    }

    columns {
      name = "cs_uri_stem"
      type = "string"
    }

    columns {
      name = "access_count"
      type = "int"
    }
  }
}
