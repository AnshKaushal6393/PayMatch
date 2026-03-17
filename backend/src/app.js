import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import {
  authRoutes,
  healthRoutes,
  invoiceRoutes,
  paymentRoutes,
  tenantRoutes,
  vendorRoutes
} from "./modules/index.js";
import { errorHandler, notFound } from "./middleware/error.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ name: "PayMatch API", docs: "/api/health" });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
