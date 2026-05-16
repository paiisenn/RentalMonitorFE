import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "smartstay_secret_key_2026";
const MONGODB_URI = process.env.DATABASE_URL;

// MongoDB Connection
const connectDB = async () => {
  if (!MONGODB_URI) {
    console.warn("DATABASE_URL not found in .env. Initializing without database connection.");
    return false;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");
    return true;
  } catch (err: any) {
    console.error("MongoDB connection error:", err);
    return false;
  }
};

const transform = (_doc: any, ret: any) => {
  if (ret._id) {
    ret.id = ret._id.toString();
    // Keep _id if needed by some logic, but typically we want 'id' on the client
  }
  return ret;
};

mongoose.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform
});

mongoose.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform
});

// Schemas & Models
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'owner', 'tenant'], default: 'tenant' },
  roomNumber: String,
  room_id: mongoose.Schema.Types.Mixed,
  phone: String,
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const roomSchema = new mongoose.Schema({
  name: String,
  number: String,
  floor: Number,
  status: { type: String, enum: ['rented', 'empty', 'alert', 'maintenance'] },
  tenantName: String,
  current_tenant_id: mongoose.Schema.Types.Mixed,
  powerUsage: Number,
  price: Number,
  base_price: Number,
  electricity_index: { type: Number, default: 0 },
  water_index: { type: Number, default: 0 },
  tenant_phone_snapshot: String,
  utilities: String,
  issue: String,
  expectedFixDate: String,
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const deviceSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Robustly support string-based IDs
  name: String,
  type: String,
  status: String,
  state: mongoose.Schema.Types.Mixed,
  last_state: mongoose.Schema.Types.Mixed,
  ownerId: String,
  roomNumber: String,
  roomId: String,
  room_id: mongoose.Schema.Types.Mixed, // Compatibility with existing data
  lastUpdate: String,
  last_seen: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const billSchema = new mongoose.Schema({
  room_id: mongoose.Schema.Types.Mixed,
  tenant_id: mongoose.Schema.Types.Mixed,
  tenant_name_snapshot: String,
  tenant_phone_snapshot: String,
  month: Number,
  year: Number,
  amount: Number,
  total_amount: Number,
  electricity_index: Number,
  water_index: Number,
  due_date: String,
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  details: mongoose.Schema.Types.Mixed,
  paid_at: Date,
  roomNumber: String, // Fallback field
  tenantName: String, // Fallback field
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

const notificationSchema = new mongoose.Schema({
  title: String,
  content: String,
  time: String,
  type: String,
  severity: String,
  isRead: { type: Boolean, default: false },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const deviceLogSchema = new mongoose.Schema({
  device_id: String,
  event: String,
  value: String,
  ts: { type: Date, default: Date.now },
  user_id: mongoose.Schema.Types.Mixed,
}, { timestamps: false });

const User = mongoose.model("User", userSchema);
const Room = mongoose.model("Room", roomSchema);
const Device = mongoose.model("Device", deviceSchema);
const Bill = mongoose.model("Bill", billSchema);
const Notification = mongoose.model("Notification", notificationSchema);
const DeviceLog = mongoose.model("DeviceLog", deviceLogSchema, "device_logs");

// Initial Seed Function
async function seedData() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log("Seeding initial data...");

    // Seed Users
    const seededUsers = await User.insertMany([
      { name: 'Quản trị viên', email: 'admin@smartstay.io', role: 'admin', password: 'password123' },
      { name: 'Nguyễn Văn Chủ', email: 'owner@smartstay.io', role: 'owner', password: 'password123' },
      { name: 'Trần Thị B', email: 'tenant@smartstay.io', role: 'tenant', password: 'password123', roomNumber: 'A101' },
    ]);

    // Note: Since user says they have data, we won't force-seed Rooms/Bills if they exist
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      console.log("Seeding rooms...");
      await Room.insertMany([
        { number: 'A101', floor: 1, status: 'rented', tenantName: 'Trần Thị B', powerUsage: 125.4, price: 3500000, base_price: 3500000, electricity_index: 2450, water_index: 180, tenant_phone_snapshot: '0912345678', utilities: 'Điện, Nước, WiFi' },
        { number: 'B202', floor: 2, status: 'rented', tenantName: 'Lê Văn C', powerUsage: 89.2, price: 4000000, base_price: 4000000, electricity_index: 1120, water_index: 95, tenant_phone_snapshot: '0987654321', utilities: 'Điện, Nước, WiFi, Có ban công' },
        { number: 'C303', floor: 3, status: 'empty', powerUsage: 0, price: 3200000, base_price: 3200000, electricity_index: 0, water_index: 0, utilities: 'Điện, Nước, WiFi' },
      ]);
    }

    const meterExists = await Device.findOne({ _id: 'METER_101' });
    // Force re-seed if standard IDs are missing
    if (deviceCount === 0 || !meterExists) {
      console.log("Forcing re-seed to synchronize hardware IDs (METER_101, etc.)...");
      await Device.deleteMany({}); 
      const roomsInDb = await Room.find();
      const devicesToSeed = [];

      for (const room of roomsInDb) {
        const roomSuffix = room.number.includes('101') ? '101' : (room.number.includes('202') ? '102' : '103');
        devicesToSeed.push(
          { _id: `LIGHT_${roomSuffix}`, name: `Đèn trần - Phòng ${room.number}`, type: 'light', status: 'online', state: { on: false }, lastUpdate: '1 giờ trước', roomNumber: room.number, roomId: room._id.toString() },
          { _id: `LOCK_${roomSuffix}`, name: `Khóa cửa - Phòng ${room.number}`, type: 'lock', status: 'online', state: { locked: true }, lastUpdate: '30 phút trước', roomNumber: room.number, roomId: room._id.toString() },
          { _id: `FIRE_${roomSuffix}`, name: `Báo khói - Phòng ${room.number}`, type: 'fire_alarm', status: 'online', state: { alert: false }, lastUpdate: '2 giờ trước', roomNumber: room.number, roomId: room._id.toString() },
          { _id: `METER_${roomSuffix}`, name: `Đồng hồ tổng - Phòng ${room.number}`, type: 'meter', status: 'online', state: { electricity: room.electricity_index || 0, water: room.water_index || 0 }, lastUpdate: '10 giây trước', roomNumber: room.number, roomId: room._id.toString() }
        );
      }

      if (devicesToSeed.length > 0) {
        await Device.insertMany(devicesToSeed);
        console.log(`Seeded ${devicesToSeed.length} devices.`);
      }
    }

    console.log("Seeding complete.");
  }
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 5000;
  console.log("[SERVER] Starting server...");

  const isConnected = await connectDB();

  if (isConnected) {
    try {
      await seedData();

      // Debug log
      const allUsers = await User.find({}, 'email role roomNumber');
      console.log("[DEBUG] Current users in DB:", allUsers.map(u => ({ email: u.email, role: u.role, room: u.roomNumber })));
    } catch (err) {
      console.error("[SERVER] Error during DB initialization:", err);
    }
  } else {
    console.error("[SERVER] Server starting without MongoDB connection. Operations will fail.");
  }

  app.use(express.json());

  // Middleware to authenticate JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Health check endpoint
  app.get("/api/v1/health", (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.json({
      status: "ok",
      database: dbStatus,
      mongodb_uri_present: !!MONGODB_URI,
      timestamp: new Date().toISOString()
    });
  });

  // Auth Routes
  app.post("/api/v1/auth/login", async (req, res) => {
    const { email, password, role } = req.body;
    console.log(`[AUTH] Login attempt: ${email}, Role: ${role}`);

    try {
      // Check if user exists first
      const userExists = await User.findOne({ email });
      if (!userExists) {
        console.warn(`[AUTH] Login failed: User not found for email ${email}`);
        return res.status(401).json({ error: "Email không tồn tại trong hệ thống" });
      }

      if (userExists.role !== role) {
        console.warn(`[AUTH] Login failed: Role mismatch for ${email}. Expected ${userExists.role}, got ${role}`);
        return res.status(401).json({ error: "Vai trò không chính xác" });
      }

      // Check password using bcrypt
      const isPasswordMatch = await bcrypt.compare(password, userExists.password);

      // Fallback for plain text passwords (e.g. from seed)
      const isPlainTextMatch = userExists.password === password;

      if (!isPasswordMatch && !isPlainTextMatch) {
        console.warn(`[AUTH] Login failed: Password mismatch for ${email}`);
        return res.status(401).json({ error: "Mật khẩu không chính xác" });
      }

      const user = userExists;
      console.log(`[AUTH] User logged in successfully: ${user.email}, Role: ${user.role}, Room: ${user.roomNumber || user.room_id}`);
      const accessToken = jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        roomNumber: user.roomNumber,
        room_id: user.room_id
      }, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          roomNumber: user.roomNumber,
          room_id: user.room_id
        }
      });
    } catch (err) {
      console.error("[AUTH] Login error:", err);
      res.status(500).json({ error: "Lỗi Server" });
    }
  });

  app.get("/api/v1/auth/profile", authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  app.post("/api/v1/auth/invite-owner", authenticateToken, async (req: any, res) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    const { email, name, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: "Email already exists" });

      const hashedPassword = await bcrypt.hash(password || 'password123', 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 'owner'
      });
      await newUser.save();

      res.json({ message: `Đã tạo tài khoản chủ nhà ${name}`, user: { email, name } });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/v1/auth/register-tenant", authenticateToken, async (req: any, res) => {
    if (req.user?.role !== 'owner') return res.status(403).json({ error: "Forbidden" });
    const { email, name, roomNumber, password, phone } = req.body;

    try {
      // Find the room
      const room = await Room.findOne({ number: roomNumber });
      if (!room) return res.status(404).json({ error: "Không tìm thấy phòng số " + roomNumber });

      let user = await User.findOne({ email });

      if (user) {
        // Update existing user
        user.roomNumber = roomNumber;
        user.room_id = room._id;
        user.name = name || user.name;
        user.phone = phone || user.phone;
        if (password) {
          user.password = await bcrypt.hash(password, 10);
        }
        await user.save();
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash(password || 'password123', 10);
        user = new User({
          name,
          email,
          password: hashedPassword,
          role: 'tenant',
          roomNumber,
          room_id: room._id,
          phone
        });
        await user.save();
      }

      // Update room status
      await Room.findByIdAndUpdate(room._id, {
        status: 'rented',
        tenantName: name,
        current_tenant_id: user._id,
        tenant_phone_snapshot: phone
      });

      res.json({
        message: `Đã đăng ký/cập nhật người thuê ${name} cho phòng ${roomNumber}`,
        user: {
          id: user._id,
          email,
          name,
          roomNumber: room.number, // Use room number from DB to be safe
          room_id: room._id.toString()
        }
      });
    } catch (err) {
      console.error("Error registering tenant:", err);
      res.status(500).json({ error: "Lỗi Server" });
    }
  });

  // API Routes
  app.get("/api/v1/bills/my-bill", authenticateToken, async (req: any, res: any) => {
    const userId = req.user?.id;
    const roomNumber = req.user?.roomNumber;
    const userName = req.user?.name;
    const roomId = req.user?.room_id;
    console.log(`[DEBUG] Fetching bills. UserID: ${userId}, RoomNum: ${roomNumber}, RoomId: ${roomId}`);

    if (!userId) {
      return res.status(401).json({ error: "User ID not found in token" });
    }

    try {
      let userBills: any[] = [];

      // 1. Try by exact tenant_id if userId is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(userId)) {
        userBills = await Bill.find({ tenant_id: userId });
        console.log(`[DEBUG] Bills found by tenant_id (ObjectId): ${userBills.length}`);
      }

      // 2. If nothing, try by roomId (from user's room_id reference)
      if (userBills.length === 0 && roomId) {
        userBills = await Bill.find({ room_id: roomId });
        console.log(`[DEBUG] Bills found by room_id: ${userBills.length}`);
      }

      // 3. Fallback: Try by roomNumber if nothing found
      if (userBills.length === 0 && roomNumber) {
        userBills = await Bill.find({ roomNumber: roomNumber });
        console.log(`[DEBUG] Bills found after roomNumber fallback: ${userBills.length}`);
      }

      // 4. Last fallback: Try by tenant name snapshot if still nothing
      if (userBills.length === 0 && userName) {
        userBills = await Bill.find({ tenant_name_snapshot: userName });
        console.log(`[DEBUG] Bills found by name snapshot: ${userBills.length}`);
      }

      if (userBills.length === 0) {
        const totalBills = await Bill.countDocuments();
        console.log(`[DEBUG] No bills for this user. Total bills in DB: ${totalBills}`);
      }

      // 5. Return enriched bills
      const enrichedBills = await Promise.all(userBills.map(async (bill: any) => {
        const billData = bill.toJSON();
        if (billData.room_id) {
          try {
            const room = await Room.findById(billData.room_id);
            if (room) {
              billData.roomName = (room as any).name || "";
            }
          } catch (err) { }
        }
        return billData;
      }));

      res.json(enrichedBills);
    } catch (err) {
      console.error("[ERROR] Fetching bills:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/v1/rooms/my-room", authenticateToken, async (req: any, res) => {
    const roomId = req.user?.room_id;
    const roomNumber = req.user?.roomNumber;

    try {
      if (roomId && mongoose.Types.ObjectId.isValid(roomId)) {
        const room = await Room.findById(roomId);
        if (room) return res.json(room);
      }

      if (roomNumber) {
        const room = await Room.findOne({ number: roomNumber });
        if (room) return res.json(room);
      }

      return res.status(404).json({ error: "Room not found or not assigned" });
    } catch (err) {
      console.error("[ERROR] Fetching my-room:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/v1/rooms", authenticateToken, async (req: any, res) => {
    try {
      const allRooms = await Room.find({});

      // Enrich rooms with tenant information from User collection if missing
      const enrichedRooms = await Promise.all(allRooms.map(async (room: any) => {
        const roomData = room.toJSON();

        // Try to find the primary tenant for this room to ensure name/phone are current
        if (roomData.status === 'rented') {
          const tenant = await User.findOne({
            $or: [
              { room_id: room._id },
              { room_id: room._id.toString() },
              { roomNumber: room.number }
            ],
            role: 'tenant'
          });

          if (tenant) {
            roomData.tenantName = tenant.name;
            roomData.tenant_phone_snapshot = tenant.phone;
            roomData.current_tenant_id = tenant._id.toString();
          }
        }

        return roomData;
      }));

      res.json(enrichedRooms);
    } catch (err) {
      console.error("[ERROR] Fetching rooms:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/v1/rooms", authenticateToken, async (req: any, res) => {
    const newRoom = new Room(req.body);
    await newRoom.save();
    io.emit('newRoom', newRoom);
    res.status(201).json(newRoom);
  });

  app.patch("/api/v1/rooms/:id/status", authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const { status, issue, expectedFixDate } = req.body;
    const updatedRoom = await Room.findByIdAndUpdate(id, { status, issue, expectedFixDate }, { returnDocument: 'after' });
    if (updatedRoom) {
      io.emit('roomUpdate', updatedRoom);
      res.json(updatedRoom);
    } else {
      res.status(404).json({ error: "Room not found" });
    }
  });

  app.patch("/api/v1/rooms/:id/assign", authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const { tenantName, current_tenant_id, tenant_phone_snapshot } = req.body;
    const updatedRoom = await Room.findByIdAndUpdate(id, {
      status: 'rented',
      tenantName,
      current_tenant_id,
      tenant_phone_snapshot
    }, { returnDocument: 'after' });
    if (updatedRoom) {
      io.emit('roomUpdate', updatedRoom);
      res.json(updatedRoom);
    } else {
      res.status(404).json({ error: "Room not found" });
    }
  });

  app.get("/api/v1/devices", authenticateToken, async (req: any, res) => {
    try {
      const allDevices = await Device.find({});
      console.log(`[API] Latched ${allDevices.length} devices from DB`);

      const mappedDevices = await Promise.all(allDevices.map(async (d: any) => {
        const obj = d.toObject ? d.toObject() : d;
        const finalObj = {
          ...obj,
          id: (obj._id || d._id || '').toString()
        };

        // Enrich meter devices with latest values from logs
        if (finalObj.type === 'meter') {
          const latestLogs = await DeviceLog.find({
            device_id: finalObj.id
          }).sort({ ts: -1 }).limit(10);

          const eLog = latestLogs.find(l => l.value && l.value.startsWith('E_'));
          const wLog = latestLogs.find(l => l.value && l.value.startsWith('W_'));

          if (!finalObj.state) finalObj.state = {};
          if (eLog && eLog.value) {
            const val = parseFloat(eLog.value.split('_')[1]);
            if (!isNaN(val)) finalObj.state.electricity = val;
          }
          if (wLog && wLog.value) {
            const val = parseFloat(wLog.value.split('_')[1]);
            if (!isNaN(val)) finalObj.state.water = val;
          }
        }

        return finalObj;
      }));

      console.log(`[API] Returning ${mappedDevices.length} devices with robust ID mapping and meter enrichment`);
      res.json(mappedDevices);
    } catch (err) {
      console.error("Error fetching devices:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/v1/devices/control", authenticateToken, async (req: any, res) => {
    const { id, state } = req.body;
    console.log(`[API] Control device: ${id}, State:`, state);

    if (!id || id === 'null') {
      return res.status(400).json({ error: "Invalid Device ID" });
    }

    try {
      const query = { _id: id };
      const updatedDevice = await Device.findOneAndUpdate(query, {
        $set: {
          state,
          lastUpdate: "Vừa xong",
          updatedAt: new Date(),
          last_seen: new Date()
        }
      }, { returnDocument: 'after' });

      if (updatedDevice) {
        console.log(`[API] Device ${id} updated in DB successfully`);
        const result = updatedDevice.toObject() as any;
        const finalId = result._id?.toString() || id;
        io.emit("device-update", { ...result, id: finalId });
        res.json({ ...result, id: finalId });
      } else {
        console.warn(`[API] Device ${id} not found for control`);
        res.status(404).json({ error: "Device not found" });
      }
    } catch (err) {
      console.error("Control error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // NHẬN DỮ LIỆU TỪ GATEWAY (ARDUINO -> SERVER)
  app.post("/api/v1/devices/status", async (req, res) => {
    const { deviceId, value } = req.body;
    console.log(`[IOT] Status update from Gateway: ${deviceId} = ${value}`);

    try {
      const device = await Device.findOne({ _id: deviceId });
      if (!device) return res.status(404).json({ error: "Device not found" });

      const updateData: any = {
        last_state: value,
        last_seen: new Date(),
        updatedAt: new Date(),
        lastUpdate: "Vừa xong"
      };

      // Xử lý logic đặc biệt cho Meter (Điện Nước)
      if (device.type === 'meter') {
         const eMatch = value.match(/E:([\d.]+)/);
         const wMatch = value.match(/W:([\d.]+)/);
         if (eMatch) updateData["state.electricity"] = parseFloat(eMatch[1]);
         if (wMatch) updateData["state.water"] = parseFloat(wMatch[1]);
      }

      const updated = await Device.findOneAndUpdate(
        { _id: deviceId },
        { $set: updateData },
        { new: true }
      );

      // Lưu log hoạt động
      await DeviceLog.create({
        device_id: deviceId,
        event: "status_update",
        value: value,
        ts: new Date()
      });

      // Phát realtime lên giao diện web
      const result = updated?.toJSON() as any;
      io.emit("device-update", { ...result, id: deviceId });

      // Nếu là hỏa hoạn -> Tạo thông báo khẩn cấp + QUY TRÌNH CỨU HỘ
      if (value === 'FIRE') {
         // 1. Tạo thông báo
         const newNotif = await Notification.create({
            title: "CẢNH BÁO CHÁY",
            content: `Phát hiện cháy tại thiết bị ${deviceId}! Đang kích hoạt cứu hộ tự động...`,
            type: 'alert',
            severity: 'critical',
            time: new Date().toLocaleTimeString('vi-VN')
         });
         io.emit('alert', newNotif);

         // 2. Tự động mở cửa & bật đèn trong cùng phòng
         if (device.room_id || device.roomNumber) {
            const roomId = device.room_id || device.roomId || device.roomNumber;
            const roomDevices = await Device.find({ 
               $or: [
                 { room_id: roomId }, 
                 { roomId: roomId }, 
                 { roomNumber: roomId }
               ] 
            });

            for (const dev of roomDevices) {
               let updatedDev = null;
               if (dev.type === 'light') {
                  updatedDev = await Device.findByIdAndUpdate(dev._id, {
                     $set: { "state.on": true, last_state: 'ON', lastUpdate: 'CỨU HỘ' }
                  }, { new: true });
               } else if (dev.type === 'lock') {
                  updatedDev = await Device.findByIdAndUpdate(dev._id, {
                     $set: { "state.locked": false, last_state: 'DOOR_OPEN', lastUpdate: 'CỨU HỘ' }
                  }, { new: true });
               }

               if (updatedDev) {
                  const data = updatedDev.toJSON() as any;
                  data.id = updatedDev._id.toString();
                  io.emit("device-update", data);
               }
            }
         }
      }

      res.json({ ok: true });
    } catch (err) {
      console.error("[IOT] Error handling status update:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/v1/devices/light/toggle", authenticateToken, async (req: any, res) => {
    const { id } = req.body;
    console.log(`[API] Toggle light: ${id}`);

    if (!id || id === 'null') {
      return res.status(400).json({ error: "Invalid Device ID" });
    }

    try {
      const query = { _id: id };
      const device = await Device.findOne(query);
      if (!device || device.type !== 'light') {
        console.warn(`[API] Light ${id} not found for toggle`);
        return res.status(404).json({ error: "Light device not found" });
      }

      const newOnState = !device.state?.on;
      const updatedDevice = await Device.findOneAndUpdate(query, {
        $set: {
          "state.on": newOnState,
          last_state: newOnState ? 'ON' : 'OFF',
          lastUpdate: "Vừa xong",
          updatedAt: new Date(),
          last_seen: new Date()
        }
      }, { returnDocument: 'after' });

      if (updatedDevice) {
        const result = updatedDevice.toJSON() as any;
        const finalId = result.id || updatedDevice._id?.toString() || id;
        io.emit("device-update", { ...result, id: finalId });
        
        // PHÁT LỆNH XUỐNG GATEWAY
        io.emit("command", {
          deviceId: finalId,
          command: newOnState ? "LIGHT_ON" : "LIGHT_OFF"
        });
        
        res.json({ ...result, id: finalId });
      } else {
        res.status(500).json({ error: "Failed to update light" });
      }
    } catch (err) {
      console.error("Toggle light error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/v1/devices/door/control", authenticateToken, async (req: any, res) => {
    const { id, action } = req.body; // action: 'open' | 'close'
    console.log(`[API] Control door: ${id}, Action: ${action}`);

    if (!id || id === 'null') {
      return res.status(400).json({ error: "Invalid Device ID" });
    }

    try {
      const query = { _id: id };
      const device = await Device.findOne(query);
      if (!device || device.type !== 'lock') {
        console.warn(`[API] Lock ${id} not found for control`);
        return res.status(404).json({ error: "Lock device not found" });
      }

      const isLocked = action === 'close';
      const last_state = action === 'open' ? 'DOOR_OPEN' : 'DOOR_CLOSED';
      const updatedDevice = await Device.findOneAndUpdate(query, {
        $set: {
          "state.locked": isLocked,
          last_state: last_state,
          lastUpdate: "Vừa xong",
          updatedAt: new Date(),
          last_seen: new Date()
        }
      }, { returnDocument: 'after' });

      if (updatedDevice) {
        const result = updatedDevice.toJSON() as any;
        const finalId = result.id || updatedDevice._id?.toString() || id;
        io.emit("device-update", { ...result, id: finalId });
        
        // PHÁT LỆNH XUỐNG GATEWAY
        io.emit("command", {
          deviceId: finalId,
          command: action === 'open' ? "UNLOCK" : "LOCK"
        });

        res.json({ ...result, id: finalId });
      } else {
        res.status(500).json({ error: "Failed to update door" });
      }
    } catch (err) {
      console.error("Control door error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // EMERGENCY ESCAPE PROCEDURE
  app.post("/api/v1/devices/:id/trigger-fire", authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    console.log(`[EMERGENCY] Triggering fire alarm for device: ${id}`);

    try {
      const sensor = await Device.findOne({ _id: id });
      if (!sensor) return res.status(404).json({ error: "Sensor not found" });

      // PHÁT LỆNH XUỐNG GATEWAY
      console.log(`[EMERGENCY] Emitting command FIRE for device: ${id}`);
      io.emit("command", {
        deviceId: id,
        command: "FIRE"
      });

      // 1. Update the sensor state
      await Device.findOneAndUpdate({ _id: id }, {
        $set: {
          "state.alert": true,
          status: 'online',
          last_state: 'FIRE_DETECTED',
          lastUpdate: "KHẨN CẤP"
        }
      });

      // 2. Find associated room context
      const roomId = sensor.room_id || sensor.roomId || sensor.roomNumber;
      console.log(`[EMERGENCY] Finding devices for Room Context: ${roomId}`);

      // 3. Automated Rescue: Open Doors and Turn on Lights in that room
      const roomQuery = {
        $or: [
          { room_id: roomId },
          { roomId: roomId },
          { roomNumber: roomId }
        ]
      };
      const roomDevices = await Device.find(roomQuery);
      console.log(`[EMERGENCY] Found ${roomDevices.length} devices in the same room context.`);

      const affectedDevices: any[] = [];

      for (const dev of roomDevices) {
        let updated = null;
        if (dev.type === 'light') {
          updated = await Device.findByIdAndUpdate(dev._id, {
            $set: {
              "state.on": true,
              last_state: 'ON',
              lastUpdate: 'CỨU HỘ',
              updatedAt: new Date()
            }
          }, { new: true });
        } else if (dev.type === 'lock') {
          updated = await Device.findByIdAndUpdate(dev._id, {
            $set: {
              "state.locked": false,
              last_state: 'DOOR_OPEN',
              lastUpdate: 'CỨU HỘ',
              updatedAt: new Date()
            }
          }, { new: true });
        }

        if (updated) {
          const data = updated.toJSON() as any;
          data.id = updated._id.toString();
          io.emit("device-update", data);
          affectedDevices.push(data);
        }
      }

      // 4. Log the event
      await DeviceLog.create({
        device_id: id,
        event: "FIRE_EMERGENCY",
        value: " quy trình cứu hộ tự động khi có sự cố cháy nổ",
        user_id: req.user?.id,
        ts: new Date()
      });

      // 5. Create Notification and Emit global alert
      const newNotif = await Notification.create({
        title: "CỨU HỘ TỰ ĐỘNG",
        content: `Phát hiện cháy tại Phòng ${sensor.roomNumber || '?'}. Đã tự động mở khóa và bật điện thoát hiểm.`,
        type: 'alert',
        time: new Date().toLocaleTimeString('vi-VN')
      });

      const finalSensor = await Device.findOne({ _id: id });
      io.emit("device-update", { ...finalSensor?.toJSON(), id: id });
      io.emit('alert', {
        id: newNotif._id.toString(),
        _id: newNotif._id.toString(),
        title: newNotif.title,
        content: newNotif.content,
        type: 'fire_emergency',
        time: 'Vừa xong'
      });

      res.json({
        message: "Quy trình cứu hộ tự động đã được kích hoạt",
        affectedCount: affectedDevices.length,
        notificationId: newNotif._id
      });

    } catch (err) {
      console.error("Emergency trigger error:", err);
      res.status(500).json({ error: "Lỗi Server" });
    }
  });

  app.post("/api/v1/devices/:id/reset-fire", authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const deviceIdStr = id.toString();
    console.log(`[EMERGENCY] Request to reset fire alarm for device: ${deviceIdStr}`);

    try {
      let query: any = { _id: deviceIdStr };
      // If it's a valid ObjectId string, try that too if simple string fails
      if (mongoose.Types.ObjectId.isValid(deviceIdStr)) {
        query = { $or: [{ _id: deviceIdStr }, { _id: new mongoose.Types.ObjectId(deviceIdStr) }] };
      }

      const sensor = await Device.findOne(query);
      if (!sensor) {
        console.error(`[EMERGENCY] Device NOT FOUND: ${deviceIdStr}`);
        return res.status(404).json({ error: "Sensor not found in database" });
      }

      console.log(`[EMERGENCY] Found device: ${sensor.name}. Current alert state: ${sensor.state?.alert}`);

      const updated = await Device.findOneAndUpdate(query, {
        $set: {
          "state.alert": false,
          status: 'online',
          last_state: 'NORMAL',
          lastUpdate: "ĐÃ KHẮC PHỤC"
        }
      }, { new: true });

      if (updated) {
        // PHÁT LỆNH TẮT BÁO CHÁY XUỐNG GATEWAY
        io.emit("command", {
          deviceId: id,
          command: "FIRE_NORMAL"
        });
        const data = updated.toJSON() as any;
        data.id = updated._id.toString();
        console.log(`[EMERGENCY] Device ${deviceIdStr} reset successfully.`);

        // Reset Room status
        const roomId = updated.room_id || updated.roomId || updated.roomNumber;
        if (roomId) {
          const roomQuery = mongoose.Types.ObjectId.isValid(roomId.toString())
            ? { $or: [{ _id: roomId }, { _id: new mongoose.Types.ObjectId(roomId.toString()) }, { number: roomId }] }
            : { number: roomId };

          const room = await Room.findOne(roomQuery);
          if (room && room.status === 'alert') {
            console.log(`[EMERGENCY] Resetting room ${room.number} status to rented`);
            await Room.findByIdAndUpdate(room._id, { $set: { status: 'rented' } });
            const updatedRoom = await Room.findById(room._id);
            io.emit('roomUpdate', updatedRoom);
          }
        }

        io.emit("device-update", data);
        res.json({ message: "Đã tắt báo động thành công", device: data });
      } else {
        console.error(`[EMERGENCY] Failed to update device ${deviceIdStr}`);
        res.status(500).json({ error: "Lỗi cập nhật thiết bị" });
      }
    } catch (err) {
      console.error("[EMERGENCY] Reset fire error:", err);
      res.status(500).json({ error: "Lỗi Server" });
    }
  });

  app.get("/api/v1/bills", authenticateToken, async (req: any, res) => {
    try {
      const allBills = await Bill.find({});
      const enrichedBills = await Promise.all(allBills.map(async (bill: any) => {
        const billData = bill.toJSON();
        if (billData.room_id) {
          try {
            const room = await Room.findById(billData.room_id);
            if (room) {
              billData.roomName = (room as any).name || "";
            }
          } catch (err) { }
        }
        return billData;
      }));
      res.json(enrichedBills);
    } catch (err) {
      console.error("[ERROR] Fetching bills:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.post("/api/v1/bills", authenticateToken, async (req: any, res) => {
    const newBill = new Bill({ ...req.body, status: 'unpaid' });
    await newBill.save();
    io.emit('billUpdate', newBill);
    res.status(201).json(newBill);
  });

  app.patch("/api/v1/bills/:id/status", authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const updatedBill = await Bill.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
    if (updatedBill) {
      io.emit('billUpdate', updatedBill);
      res.json(updatedBill);
    } else {
      res.status(404).json({ error: "Bill not found" });
    }
  });

  app.get("/api/v1/notifications", authenticateToken, async (req: any, res) => {
    const allNotifications = await Notification.find({});
    res.json(allNotifications);
  });

  app.get("/api/v1/alerts", authenticateToken, async (req: any, res) => {
    const alerts = await Notification.find({ type: 'alert' });
    res.json(alerts);
  });

  app.post("/api/v1/alerts/:id/resolve", authenticateToken, async (req: any, res) => {
    try {
      const { id } = req.params;
      if (!id || id === 'undefined') {
        return res.status(400).json({ error: "Invalid alert ID" });
      }
      const updatedNotif = await Notification.findByIdAndUpdate(id, { isRead: true, type: 'resolved_alert' }, { returnDocument: 'after' });
      if (updatedNotif) {
        res.json({ message: "Alert resolved" });
      } else {
        res.status(404).json({ error: "Alert not found" });
      }
    } catch (err) {
      console.error("Resolve alert error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/v1/stats/overview", authenticateToken, async (req, res) => {
    const allBills = await Bill.find({});
    const allRooms = await Room.find({});
    const allDevices = await Device.find({});
    const allNotifs = await Notification.find({});

    const totalRevenueSum = allBills.reduce((acc: number, b: any) => acc + (b.total_amount || 0), 0);
    const activeRoomsCount = allRooms.filter((r: any) => r.status === 'rented').length;
    const onlineDevicesCount = allDevices.filter((d: any) => d.status === 'online').length;
    const pendingAlertsCount = allNotifs.filter((n: any) => n.type === 'alert' && !n.isRead).length;

    res.json({
      totalRevenue: totalRevenueSum,
      activeRooms: activeRoomsCount,
      onlineDevices: onlineDevicesCount,
      pendingAlerts: pendingAlertsCount,
      occupancyRate: Math.round((activeRoomsCount / (allRooms.length || 1)) * 100)
    });
  });

  app.get("/api/v1/stats/revenue", authenticateToken, (req, res) => {
    res.json([
      { month: 'T1', amount: 45000000 },
      { month: 'T2', amount: 52000000 },
      { month: 'T3', amount: 48000000 },
      { month: 'T4', amount: 61000000 },
      { month: 'T5', amount: 55000000 },
    ]);
  });

  app.get("/api/v1/stats/devices", authenticateToken, async (req, res) => {
    const allDevices = await Device.find({});
    const mapping: Record<string, string> = {
      light: 'Hệ thống đèn',
      lock: 'Khóa cửa',
      fire_alarm: 'Cảm biến cháy',
      meter: 'Đồng hồ điện/nước',
      hub: 'Bộ điều khiển',
      security: 'An ninh'
    };
    const deviceTypes = allDevices.reduce((acc: any, d: any) => {
      const label = mapping[d.type] || d.type;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    res.json(Object.entries(deviceTypes).map(([name, value]) => ({ name, value })));
  });

  app.get("/api/v1/admin/owners", authenticateToken, async (req, res) => {
    const adminOwners = await User.find({ role: 'owner' });
    res.json(adminOwners);
  });

  app.get("/api/v1/device-logs", authenticateToken, async (req, res) => {
    try {
      const logs = await DeviceLog.find({}).sort({ ts: -1 }).limit(50);
      res.json(logs);
    } catch (err) {
      console.error("Error fetching device logs:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/v1/users/tenants", authenticateToken, async (req, res) => {
    try {
      // Fetch users with role 'tenant'
      const tenantUsers = await User.find({ role: 'tenant' });

      // Enriched tenants with room information
      const enrichTenants = await Promise.all(tenantUsers.map(async (u: any) => {
        let roomNum = u.roomNumber;
        let roomNameTag = "";

        // If roomNumber is missing but room_id exists, look it up
        if (u.room_id) {
          try {
            const room = await Room.findById(u.room_id);
            if (room) {
              roomNum = room.number || roomNum;
              roomNameTag = (room as any).name || "";
            }
          } catch (err) {
            console.error(`Error looking up room for tenant ${u.email}:`, err);
          }
        }

        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          phone: u.phone,
          roomNumber: roomNum || "N/A",
          roomName: roomNameTag,
          room_id: u.room_id,
          status: 'active'
        };
      }));

      // Also support legacy logic if there are rented rooms without User accounts
      const rentedRooms = await Room.find({ status: 'rented' });
      const legacyTenants = rentedRooms
        .filter(r => !enrichTenants.some(t => t.roomNumber === r.number || t.room_id?.toString() === r._id.toString()))
        .map((r: any) => ({
          id: `room_tenant_${r._id}`,
          name: r.tenantName || "Unknown",
          room_id: r._id,
          roomNumber: r.number,
          roomName: (r as any).name || "",
          status: 'active'
        }));

      res.json([...enrichTenants, ...legacyTenants]);
    } catch (err) {
      console.error("[ERROR] Fetching tenants:", err);
      res.status(500).json({ error: "Lỗi hệ thống" });
    }
  });

  // Socket.io connection handling
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // IoT Simulation - TẠM TẮT ĐỂ TEST PHẦN CỨNG THẬT
  if (false && isConnected) {
    setInterval(async () => {
      try {
        const meters = await Device.find({ type: 'meter' });
        for (const meter of meters) {
          if (!meter) continue;

          const electricity = (meter.state?.electricity || 0) + Math.random() * 0.1;
          const water = (meter.state?.water || 0) + Math.random() * 0.05;

          await Device.findByIdAndUpdate(meter._id, {
            $set: {
              "state.electricity": electricity,
              "state.water": water
            }
          });

          // Update associated room indices
          if (meter.roomNumber) {
            await Room.findOneAndUpdate(
              { number: meter.roomNumber },
              {
                $set: {
                  electricity_index: Math.round(electricity * 10) / 10,
                  water_index: Math.round(water * 10) / 10
                }
              }
            );
          }

          const deviceId = (meter as any).id || meter._id?.toString();
          if (deviceId) {
            io.emit('meter-update', {
              deviceId: deviceId,
              values: { electricity, water }
            });
          }
        }

        // Random alert simulation (1% chance every 10s)
        if (Math.random() < 0.01) {
          const fireAlarms = await Device.find({ type: { $in: ['fire_alarm', 'fire_sensor'] } });
          if (fireAlarms && fireAlarms.length > 0) {
            const alarm = fireAlarms[Math.floor(Math.random() * fireAlarms.length)];
            const alarmId = alarm.id || alarm._id?.toString();
            if (alarmId) {
              // Update device state in DB so "Reset" works
              await Device.findByIdAndUpdate(alarmId, {
                $set: {
                  "state.alert": true,
                  last_state: 'FIRE_DETECTED',
                  lastUpdate: "CẢNH BÁO (Hệ thống)"
                }
              });

              const newNotif = await Notification.create({
                title: "CẢNH BÁO CHÁY (Simulated)",
                content: `Phát hiện khói tại Phòng ${alarm.roomNumber}`,
                type: 'alert',
                severity: 'crucial',
                time: new Date().toLocaleTimeString('vi-VN')
              });

              if (newNotif) {
                const n = newNotif as any;
                // Emit device update so UI reflects alarm state
                const updatedDevice = await Device.findById(alarmId);
                if (updatedDevice) {
                  io.emit('device-update', { ...updatedDevice.toJSON(), id: alarmId });
                }

                io.emit('alert', {
                  id: n._id.toString(),
                  _id: n._id.toString(),
                  title: n.title,
                  content: n.content,
                  type: 'fire_emergency',
                  deviceId: alarmId,
                  time: 'Vừa xong'
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Simulation error:", err);
      }
    }, 10000); // Every 10 seconds
  }

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});


