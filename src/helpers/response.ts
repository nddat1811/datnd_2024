interface MyResponse<T> {
  Message: string;
  data: T;
}

interface PageInfo<T> {
  Total: number;
  CurrentTotal: number;
  CurrentPage: number;
  data: T;
}

interface PagingResponse<T> {
  Message: string;
  data: PageInfo<T>;
}

function returnPagingResponse<T>(
  Message: string,
  Total: number,
  CurrentTotal: number,
  CurrentPage: number,
  data: T
): PagingResponse<T> {
  return {
    Message,
    data: {
      Total,
      CurrentTotal,
      CurrentPage,
      data,
    },
  };
}

function returnResponse<T>(
  Message: string,
  data: T
): MyResponse<T> {
  return { Message, data };
}

export { returnResponse, returnPagingResponse };
