export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  errorCode: string;
  message: string;
  fieldErrors?: FieldError[];
  timestamp: string;
}

export interface FieldError {
  field: string;
  message: string;
  rejectedValue: unknown;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
