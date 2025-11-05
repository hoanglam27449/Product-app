import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

// 🧩 Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🧱 Schema & Model
const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  color: { type: String, required: true },
});

const Product = mongoose.model("Product", productSchema);

// 1️⃣ Thêm sản phẩm mới
app.post("/add", async (req, res) => {
  try {
    const { productName, price, color } = req.body;

    if (!productName || !price || !color) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đủ thông tin sản phẩm." });
    }

    const newProduct = new Product({ productName, price, color });
    const savedProduct = await newProduct.save();

    console.log("✅ Đã thêm sản phẩm:", savedProduct);
    res.status(201).json({
      message: "✅ Thêm sản phẩm thành công!",
      product: savedProduct,
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server khi thêm sản phẩm." });
  }
});

// 2️⃣ Tìm kiếm sản phẩm theo tên
app.get("/search", async (req, res) => {
  try {
    const { name } = req.query;
    const products = await Product.find({
      productName: { $regex: name || "", $options: "i" },
    });
    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi khi tìm kiếm:", err);
    res.status(500).json({ message: "Lỗi server khi tìm kiếm sản phẩm." });
  }
});

// 3️⃣ Lấy toàn bộ sản phẩm
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server khi tải danh sách sản phẩm." });
  }
});

// 4️⃣ Xoá sản phẩm theo ID
app.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ message: "❌ Không tìm thấy sản phẩm cần xoá." });
    }

    // Xoá sản phẩm trong MongoDB
    await Product.findByIdAndDelete(id);

    console.log("🗑️ Đã xoá sản phẩm:", id);

    // Trả về danh sách mới sau khi xoá
    const updatedProducts = await Product.find();
    res.json({
      message: "🗑️ Xoá sản phẩm thành công!",
      updatedList: updatedProducts,
    });
  } catch (err) {
    console.error("❌ Lỗi khi xoá sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server khi xoá sản phẩm." });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Phục vụ file index.html khi truy cập "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🚀 Khởi động server
export default app;
