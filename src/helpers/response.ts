interface MyResponse<T> {
  message: string;
  data: T;
}

interface PageInfo<T> {
  total: number;
  currenttotal: number;
  currentPage: number;
  data: T;
}

interface PagingResponse<T> {
  message: string;
  data: PageInfo<T>;
}

function returnPagingResponse<T>(
  message: string,
  total: number,
  currenttotal: number,
  currentPage: number,
  data: T
): PagingResponse<T> {
  return {
    message,
    data: {
      total,
      currenttotal,
      currentPage,
      data,
    },
  };
}

function returnResponse<T>(
  message: string,
  data: T
): MyResponse<T> {
  return { message, data };
}

export { returnResponse, returnPagingResponse };
