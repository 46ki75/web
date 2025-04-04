resource "aws_glue_catalog_database" "default" {
  name = "${terraform.workspace}-46ki75-web-glue-database-default"
}
resource "aws_glue_catalog_table" "cloudfront" {
  name          = "${terraform.workspace}-46ki75-web-glue-table-cloudfront"
  database_name = aws_glue_catalog_database.default.name

  storage_descriptor {
    location      = "s3://${aws_s3_bucket.cloudfront.bucket}/"
    input_format  = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat"
    output_format = "org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat"
    compressed    = false

    ser_de_info {
      serialization_library = "org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe"
    }

    columns {
      name = "date"
      type = "string"
    }

    columns {
      name = "x_edge_location"
      type = "string"
    }

    columns {
      name = "sc_bytes"
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
      name = "cs_host"
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
      name = "cs_user_agent"
      type = "string"
    }

    columns {
      name = "cs_uri_query"
      type = "string"
    }

    columns {
      name = "cs_cookie"
      type = "string"
    }

    columns {
      name = "x_edge_result_type"
      type = "string"
    }

    columns {
      name = "x_edge_request_id"
      type = "string"
    }

    columns {
      name = "x_host_header"
      type = "string"
    }

    columns {
      name = "cs_protocol"
      type = "string"
    }

    columns {
      name = "cs_bytes"
      type = "string"
    }

    columns {
      name = "time_taken"
      type = "string"
    }

    columns {
      name = "x_forwarded_for"
      type = "string"
    }

    columns {
      name = "ssl_protocol"
      type = "string"
    }

    columns {
      name = "ssl_cipher"
      type = "string"
    }

    columns {
      name = "x_edge_response_result_type"
      type = "string"
    }

    columns {
      name = "cs_protocol_version"
      type = "string"
    }

    columns {
      name = "fle_status"
      type = "string"
    }

    columns {
      name = "fle_encrypted_fields"
      type = "string"
    }

    columns {
      name = "c_port"
      type = "string"
    }

    columns {
      name = "time_to_first_byte"
      type = "string"
    }

    columns {
      name = "x_edge_detailed_result_type"
      type = "string"
    }

    columns {
      name = "sc_content_type"
      type = "string"
    }

    columns {
      name = "sc_content_len"
      type = "string"
    }

    columns {
      name = "sc_range_start"
      type = "string"
    }

    columns {
      name = "sc_range_end"
      type = "string"
    }
  }
}
