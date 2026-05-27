import express from "express"
import axios from "axios"

const router = express.Router()

router.get("/prices", async (req, res) => {
  try {
    const response = await axios.get(
      // RESOURCE ID GOES HERE ↓↓↓
      "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24",
      {
        params: {
          "api-key": process.env.DATA_GOV_API_KEY,
          format: "json",
          limit: 20,
        },
      }
    )

    res.json(response.data)

  } catch (error) {
    console.log(error)

    res.status(500).json({
      error: "Failed to fetch prices",
    })
  }
})

export default router
