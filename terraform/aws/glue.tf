resource "aws_glue_catalog_database" "default" {
  name = "${terraform.workspace}-46ki75-web-glue-database-default"
}
resource "aws_glue_catalog_table" "cloudfront" {
  name          = "${terraform.workspace}-46ki75-web-glue-table-cloudfront"
  database_name = aws_glue_catalog_database.default.name

  partition_keys {
    name = "partition_date"
    type = "string"
  }

  // @see <https://docs.aws.amazon.com/ja_jp/athena/latest/ug/partition-projection-supported-types.html>
  parameters = {
    "projection.enabled" = "true",

    "projection.partition_date.format"        = "yyyy/MM/dd/HH",
    "projection.partition_date.interval"      = "1",
    "projection.partition_date.interval.unit" = "HOURS",
    "projection.partition_date.range"         = "2025/04/03/00,NOW",
    "projection.partition_date.type"          = "date",

    "storage.location.template" = "s3://${aws_s3_bucket.cloudfront.bucket}/$${partition_date}",
  }

  storage_descriptor {
    location      = "s3://${aws_s3_bucket.cloudfront.bucket}/"
    input_format  = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat"
    output_format = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat"

    ser_de_info {
      serialization_library = "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe"
    }

    columns {
      name = "date"
      type = "string"
    }

    columns {
      name = "time"
      type = "string"
    }

    columns {
      name = "c_ip"
      type = "string"
    }

    columns {
      name = "cs_method"
      type = "string"
    }

    columns {
      name = "cs_uri_stem"
      type = "string"
    }

    columns {
      name = "sc_status"
      type = "string"
    }

    columns {
      name = "cs_referer"
      type = "string"
    }

    columns {
      name = "cs_uri_query"
      type = "string"
    }

    columns {
      name = "x_edge_result_type"
      type = "string"
    }

    columns {
      name = "time_taken"
      type = "string"
    }

    columns {
      name = "cs_protocol_version"
      type = "string"
    }

    columns {
      name = "sc_content_type"
      type = "string"
    }
  }
}
