interface MyResponse<T> {
  Message: string;
  Data: T;
}

interface PageInfo<T> {
  Total: number;
  CurrentTotal: number;
  CurrentPage: number;
  Data: T;
}

interface PagingResponse<T> {
  Message: string;
  Data: PageInfo<T>;
}

function returnPagingResponse<T>(
  Message: string,
  Total: number,
  CurrentTotal: number,
  CurrentPage: number,
  Data: T
): PagingResponse<T> {
  return {
    Message,
    Data: {
      Total,
      CurrentTotal,
      CurrentPage,
      Data,
    },
  };
}

function returnResponse<T>(
  Message: string,
  Data: T
): MyResponse<T> {
  return { Message, Data };
}

export { returnResponse, returnPagingResponse };
