const express = require("express");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Scanner API running");
});

app.post("/scan", (req, res) => {
  const target = req.body.target;

  if (!target) {
    return res.status(400).json({ error: "No target provided" });
  }

  const command = `nmap -Pn -T4 -F --open ${target}`;

  exec(command, { timeout: 15000 }, (error, stdout) => {
    if (error) {
      return res.status(500).json({ error: "Scan failed" });
    }
    res.json({ result: stdout });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
