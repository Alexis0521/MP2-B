import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./config/firebase";
import { setupSwagger } from "./config/swagger";
import userRoutes from "./routes/user.routes";
import roomRoutes from "./routes/room.routes";


db.listCollections()
  .then(() => console.log("✅ Firestore conectado"))
  .catch((e) => console.error("❌ Error Firestore:", e));

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);

app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});