export interface ResponseBase<T> {
    code: string;
    data?: T;
    message: string;
}