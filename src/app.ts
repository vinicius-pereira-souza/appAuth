import "dotenv/config";
import express, { Express } from "express";
import routes from "./routes";
import config from "config";
import session from "express-session";
import cookieParser from "cookie-parser";
import FileStoreConstructor from "session-file-store";
import path from "path";

export const app: Express = express();
const port = config.get<string>("port");
const FileStore = FileStoreConstructor(session);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());
app.use(
  session({
    secret: config.get<string>("session_secret"),
    name: "session",
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      path: path.resolve(__dirname, "temp", "session"),
    }),
    cookie: {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  }),
);

app.use("/api/", routes);

app.listen(port, () => {
  console.log("API is Working!");
});
