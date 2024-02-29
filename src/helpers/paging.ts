import { PAGE_SIZE_DEFAULT } from "./constant";

// utils.ts
function getPageSize(pageSize: number): number {
  if (pageSize < 1 || pageSize > 100) {
    return PAGE_SIZE_DEFAULT;
  }
  return pageSize;
}

export function calcPagination(
  page: number,
  pageSize: number
): { limit: number; offset: number } {
  const limit = getPageSize(pageSize);
  const offset = (page - 1) * limit;

  return { limit, offset };
}
