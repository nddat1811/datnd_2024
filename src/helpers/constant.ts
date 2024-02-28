//success
export const CODE_SUCCESS = 200;
export const CODE_CREATED_SUCCESS = 201;
export const CODE_LOGOUT_SUCCESS = 204; //no content
//Error
export const ERROR_BAD_REQUEST = 400;
export const ERROR_UNAUTHORIZED = 401;
export const ERROR_PAYMENT_REQUIRED = 402;
export const ERROR_FORBIDDEN = 403;
export const ERROR_NOT_FOUND = 404;
export const ERROR_UNSUPPORT_MEDIA_TYPE = 415;
export const ERROR_CONFLICT = 409;
export const ERROR_INTERNAL_SERVER = 500;

// Page
export const PAGE_SIZE_DEFAULT = 10;

//role
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}


//indexProductName
export const INDEX_PRODUCT_NAME = "products"

//role
export enum UserGender {
  MALE = "NAM",
  FEMALE = "NỮ",
  DIFF = ""
}
//status
export enum OrderStatus {
  WAIT_PAYMENT = "Chờ thanh toán",
  WAIT_DELIVER = "Chờ vận chuyển",
  DELIVER = "Vận chuyển",
  FINISHED = "Hoàn thành",
  CANCELED = "Đã hủy",
  REFUND = "Trả hàng/hoàn tiền"
}
