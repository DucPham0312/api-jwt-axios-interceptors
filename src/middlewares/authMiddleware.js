import { StatusCodes } from 'http-status-codes'
import { JwtProvider, ACCESS_TOKEN_SECRET_SIGNATURE } from '~/providers/JwtProvider'


//Middleware này sẽ đảm nhiệm việc quan trọng: Lấy và xác thực JWT accessToken nhận được từ FE có hợp lệ hay không
const isAuthorized = async (req, res, next) => {
  //Cách 1: Lấy accessToken nằm trong req cookie phía client - withCredentials trong file authorizeAxios và credentials trong CoRS
  const accessTokenFromCookie = req.cookies?.accessToken
  // console.log('accessTokenFromCookie', accessTokenFromCookie)
  // console.log('---')
  if (!accessTokenFromCookie) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized! (Token not found)' })
  }

  //Cách 2: Lấy accessToken trong trường hợp phía FE lưu localStorage và gửi lên thông qua header authorization
  const accessTokenFromHeader = req.headers.authorization
  // console.log('accessTokenFromHeader', accessTokenFromHeader)
  // console.log('---')
  if (!accessTokenFromHeader) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized! (Token not found)' })
    return
  }

  try {
    //Thực hiện giải mã token xem có hợp lệ không
    const accessTokenDecoded = await JwtProvider.verifyToken(
      accessTokenFromCookie,
      // accessTokenFromHeader.substring('Bearer '.length),
      ACCESS_TOKEN_SECRET_SIGNATURE
    )
    // console.log('accessTokenDecoded', accessTokenDecoded)

    //**Nếu token hợp lệ, cần lưu thông tin giải mã được vào req.jwtDecoded, để xử dụng ở phía sau
    req.JwtDecoded = accessTokenDecoded

    //Cho phép req đi tiếp
    next()

  } catch (error) {
    // console.log('Error from authMiddleware', error)
    // Trường hợp lỗi 01: Nếu cái accessToken bị hết hạn (expired), thì cần trả về một cái mã lỗi GONE - 410 cho phía FE biết để gọi API refreshToken
    if (error.message?.includes('jwt expired')) {
      res.status(StatusCodes.GONE).json({ message: 'Need to refresh token' })
      return
    }
    // Trường hợp lỗi 02: Nếu như cái accessToken không hợp lệ do bất kỳ điều gì khác (ví dụ: bị revoke) thì trả về mã lỗi 401 cho phía FE xử lý Logout hoặc gọi API Logout tùy trường hợp
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized! Please Login' })
  }
}

export const authMiddleware = {
  isAuthorized
}