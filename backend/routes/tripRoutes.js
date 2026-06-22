const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { generateTrip,getMyTrips,updateTrip,regenerateDay,deleteTrip } = require("../controllers/tripController");

router.post("/generate", auth, generateTrip);
router.get("/", auth, getMyTrips);
router.put("/:id", auth, updateTrip);
router.post("/:id/regenerate-day", auth, regenerateDay);
router.delete("/:id", auth, deleteTrip);

module.exports = router;