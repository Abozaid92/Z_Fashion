import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsArrayOf,
} from "nuqs/server";

export const searchParamsCache = createSearchParamsCache({
  q: parseAsString.withDefault(""),
  cat: parseAsString.withDefault(""),
  min: parseAsInteger.withDefault(0),
  max: parseAsInteger.withDefault(0),
  page: parseAsInteger.withDefault(1),
  sort: parseAsString.withDefault("newest"),
  sizes: parseAsArrayOf(parseAsString).withDefault([]),
});
