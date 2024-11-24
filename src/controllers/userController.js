
import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { JwtProvider, ACCESS_TOKEN_SECRET_SIGNATURE, REFRESH_TOKEN_SECRET_SIGNATURE } from '~/providers/JwtProvider'


//Mock nhanh thông tin user thay vì phải tạo Database rồi query.
const MOCK_DATABASE = {
  USER: {
    ID: 'Mducday-1203',
    EMAIL: 'mduc1203@gmail.com',
    PASSWORD: 'mduc@1203'
  }
}

const login = async (req, res) => {
  try {
    if (req.body.email !== MOCK_DATABASE.USER.EMAIL || req.body.password !== MOCK_DATABASE.USER.PASSWORD) {
      res.status(StatusCodes.FORBIDDEN).json({ message: 'Your email or password is incorrect!' })
      return
    }

    // Trường hợp nhập đúng thông tin tài khoản, tạo token và trả về cho phía Client

    // Tạo thông tin payload để đính kèm trong JWT Token: bao gồm _id và email của user
    const userInfo = {
      id: MOCK_DATABASE.USER.ID,
      email: MOCK_DATABASE.USER.EMAIL
    }

    // Tạo ra 2 loại token: accessToken và refeshToken trả về client
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      // '1h'
      5
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      REFRESH_TOKEN_SECRET_SIGNATURE,
      // '7 days'
      15
    )


    /**
     * Xử lí trường hợp trả về http only cookie cho phía trình duyệt
     * Đối với maxAge để tối đa là 14 ngày tùy dự án (lưu ý khác với refreshToken)
     * Ví dụ nếu accessToken cookie = 1h thì trình duyệt sẽ gỡ đi ko còn access cũ để gửi lên server biết là hết hạn --> trở thành trường hợp ko có accessToken
     */
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none', //set để domain BE và FE không cùng site cx
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none', //set để domain BE và FE không cùng site cx
      maxAge: ms('14 days')
    })

    //Trả về thông tin user cũng như trả về Tokens cho trường hợp phía FE cần lưu Tokens vào localStorage
    res.status(StatusCodes.OK).json({
      ...userInfo,
      accessToken,
      refreshToken
    })


  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const logout = async (req, res) => {
  try {
    // xóa cookie(làm ngược lại với gán cookie ở login)
    res.clearCookie('accessToken')
    res.clearCookie('Rrfresh')

    res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    //Cách 1: Lấy luôn từ Cookie đã đính kèm vào request
    const refeshTokenFromCookie = req.cookies?.refreshToken

    //Cách 2: Từ LocalStorage phía FE sẽ truyền vào body khi gọi api
    // const refeshTokenFromBody = req.body?.refreshToken

    //Verify/ giải mã refresh token xem có hợp lệ hay không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      refeshTokenFromCookie, //cach1
      // refeshTokenFromBody, //cach2
      REFRESH_TOKEN_SECRET_SIGNATURE
    )
    // console.log(refreshTokenDecoded)

    //Vì chỉ lưu thông tin unique và cố định của user trong token rồi, vì vậy có thể lấy luôn từ decoded ra
    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.email
    }

    //Tạo accessToken mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      // '1h'
      5
    )

    //Res lại cookie accessToken mới cho TH sử dụng cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none', //set để domain BE và FE không cùng site cx
      maxAge: ms('14 days')
    })

    //Trả về accessToken mới cho trường hợp FE cần update lại trong LocalStorage
    res.status(StatusCodes.OK).json({ accessToken })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Refresh Token API failed.' })
  }
}

export const userController = {
  login,
  logout,
  refreshToken
}
