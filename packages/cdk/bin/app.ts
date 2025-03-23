#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api";

const app = new cdk.App();

new ApiStack(app, "Api");
