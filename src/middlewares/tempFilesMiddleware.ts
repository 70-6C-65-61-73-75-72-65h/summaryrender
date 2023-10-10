import { Logger } from "winston";
import { TYPES } from "../constants/index";
import { Response, NextFunction, RequestHandler } from "express";
import { RequestWithSettledTempFiles } from "./types";
import fs from "fs";

import { BaseMiddleware } from "inversify-express-utils";
import { inject, injectable } from "inversify";

@injectable()
export class TempFilesMiddleware extends BaseMiddleware {
  constructor(@inject(TYPES.WinstonLogger) public readonly logger: Logger) {
    super();
  }

  public handler(
    req: RequestWithSettledTempFiles,
    res: Response,
    next: NextFunction
  ) {
    const deleteTempFiles = () => {
      res.removeListener("finish", deleteTempFiles);
      res.removeListener("close", deleteTempFiles);

      if (req.tempFilesPaths) {
        return req.tempFilesPaths.forEach((path) => {
          fs.unlink(path, (error) => this.logger.error(JSON.stringify(error)));
        });
      } else {
        this.logger.info("no tempFilesPaths found in request");
      }
    };

    res.on("finish", deleteTempFiles);
    res.on("close", deleteTempFiles);

    next();
  }
}
