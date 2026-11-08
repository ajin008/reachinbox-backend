import { esClient } from "../../infra/elasticsearch.client.ts";
import type {
  EmailDocument,
  EmailFilterParams,
  StoredEmail,
} from "./email.types.ts";

const EMAILS_INDEX = "emails";

export async function ensureEmailIndex(): Promise<void> {
  const exists = await esClient.indices.exists({ index: EMAILS_INDEX });

  if (exists === true) {
    console.log(`Elasticsearch index "${EMAILS_INDEX}" already exists`);
    return;
  }

  await esClient.indices.create({
    index: EMAILS_INDEX,
    mappings: {
      properties: {
        subject: { type: "text" },
        from: { type: "text", fields: { keyword: { type: "keyword" } } },
        to: { type: "text", fields: { keyword: { type: "keyword" } } },
        date: { type: "date" },
        body: { type: "text" },
        account: { type: "keyword" },
        folder: { type: "keyword" },
        category: { type: "keyword" },
      },
    },
  });

  console.log("Created Elasticsearch index:", EMAILS_INDEX);
}

export async function emailExistsById(id: string): Promise<boolean> {
  try {
    return await esClient.exists({
      index: EMAILS_INDEX,
      id,
    });
  } catch {
    return false;
  }
}

export async function saveEmailDocument(
  id: string,
  document: EmailDocument
): Promise<StoredEmail> {
  const res = await esClient.index({
    index: EMAILS_INDEX,
    id,
    document,
  });

  return {
    id: res._id,
    ...document,
  };
}

export async function findEmailsPaginated(
  page = 1,
  limit = 10
): Promise<{
  emails: StoredEmail[];
  page: number;
  limit: number;
  total: number;
}> {
  const from = (page - 1) * limit;

  const result = await esClient.search({
    index: EMAILS_INDEX,
    from,
    size: limit,
    query: {
      match_all: {},
    },
    sort: [{ date: { order: "desc" } }, { _id: { order: "asc" } }],
  });

  const emails: StoredEmail[] = result.hits.hits.map((hit) => ({
    id: hit._id!,
    ...(hit._source as EmailDocument),
  }));

  const total = (result.hits.total as any)?.value ?? emails.length;

  return { emails, page, limit, total };
}

export async function findEmailById(id: string): Promise<StoredEmail | null> {
  try {
    const response = await esClient.get({
      index: EMAILS_INDEX,
      id,
    });

    if (!response.found) return null;

    return {
      id: response._id,
      ...(response._source as EmailDocument),
    };
  } catch {
    return null;
  }
}

export async function findEmailsByFilter(
  filters: EmailFilterParams
): Promise<StoredEmail[]> {
  const mustFilters: any[] = [];

  if (filters.account) mustFilters.push({ term: { account: filters.account } });
  if (filters.folder) mustFilters.push({ term: { folder: filters.folder } });
  if (filters.category) {
    mustFilters.push({ term: { category: filters.category } });
  }

  const result = await esClient.search({
    index: EMAILS_INDEX,
    query: {
      bool: {
        must: mustFilters,
      },
    },
    sort: [{ date: { order: "desc" } }, { _id: { order: "asc" } }],
  });

  return result.hits.hits.map((hit) => ({
    id: hit._id!,
    ...(hit._source as EmailDocument),
  }));
}

export async function searchEmailsFullText(
  query: string
): Promise<StoredEmail[]> {
  const result = await esClient.search({
    index: EMAILS_INDEX,
    query: {
      multi_match: {
        query,
        fields: ["subject", "from", "to", "body"],
        fuzziness: "AUTO",
      },
    },
  });

  return result.hits.hits.map((hit: any) => ({
    id: hit._id,
    score: hit._score,
    ...(hit._source as EmailDocument),
  }));
}
