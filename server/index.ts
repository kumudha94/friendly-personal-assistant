import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

const app = express();
const isDev = process.env.NODE_ENV === "development";

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isDev) return callback(null, true);
      callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`Milo backend serving on port ${port}`);
  });
})();
