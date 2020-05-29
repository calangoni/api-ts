export {};

(Error.prototype as any).HttpStatus = function (status: number) { this.Status = status; return this };
(Error.prototype as any).DebugInfo = function (info: any) { this.debugInfo = info; return this };

declare global {
  interface Error {
    HttpStatus? (code: number): Error
    DebugInfo? (debugInfo: any): Error
  }
  // namespace Express {
  //   export interface Request {
  //     session?: { userId: string }
  //   }
  // }
}
