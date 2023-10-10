import { Request } from "express";

export interface RequestWithSettledTempFiles extends Request {
  tempFilesPaths: string[];
}
