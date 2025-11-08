import { Client } from "@elastic/elasticsearch";
import { ENV } from "../config/env.ts";

export const esClient = new Client({
  node: ENV.Es_url || "http://localhost:9200",
});
