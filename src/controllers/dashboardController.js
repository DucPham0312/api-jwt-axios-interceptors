
import { StatusCodes } from 'http-status-codes'

const access = async (req, res) => {
  try {
    // const user = { email: 'mduc1203@gmail.com' }
    const userInfo = {
      id: req.JwtDecoded.id,
      email: req.JwtDecoded.email
    }

    res.status(StatusCodes.OK).json(userInfo)
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

export const dashboardController = {
  access
}
