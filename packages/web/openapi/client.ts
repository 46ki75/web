import createClient from "openapi-fetch";
import type { paths } from "./schema";
import { ENDPOINT } from "../scripts/config";

export const client = createClient<paths>({
  baseUrl: ENDPOINT,
});
