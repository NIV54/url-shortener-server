export class CodedError extends Error {
  status: number;
  code: number;
  constructor(message: string, status: number, code = 1) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
