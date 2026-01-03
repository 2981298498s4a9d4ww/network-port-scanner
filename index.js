const express = require("express");
const cors = require("cors");
const net = require("net");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Scanner API running");
});

// Simple TCP port scan
function scanPort(host, port, timeout = 1000) {
  return new Promise(resolve => {
    const socket = new net.Socket();
    let open = false;

    socket.setTimeout(timeout);

    socket.on("connect", () => {
      open = true;
      socket.destroy();
    });

    socket.on("timeout", () => {
      socket.destroy();
    });

    socket.on("error", () => {});

    socket.on("close", () => {
      resolve(open);
    });

    socket.connect(port, host);
  });
}

app.post("/scan", async (req, res) => {
  const target = req.body.target;

  if (!target) {
    return res.status(400).json({ error: "No target provided" });
  }

  // Allow only domains / IPs
  if (!/^[a-zA-Z0-9.\-]+$/.test(target)) {
    return res.status(400).json({ error: "Invalid target format" });
  }

  const portsToScan = [21, 22, 25, 53, 80, 110, 143, 443, 3306, 8080];
  const openPorts = [];

  for (const port of portsToScan) {
    const isOpen = await scanPort(target, port);
    if (isOpen) {
      openPorts.push(port);
    }
  }

  res.json({
    target,
    open_ports: openPorts
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
