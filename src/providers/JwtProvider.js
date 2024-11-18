import JWT from 'jsonwebtoken'


/**
 * Function tạo mới một token - Cần 3 tham số đầu vào
 * userInfo: Những thông tin muốn đính kèm vào Token
 * secretSignature: Chữ kí bí mật
 * tokenLife: Thời gian sống của Token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    //Hamf sign() của JWT, Thuật toán mặc định HS256
    return JWT.sign(userInfo, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) { throw new Error(error) }
}


/**
 * Function kiểm tra một token có hợp lệ không
 * Hợp lệ là token được tạo ra đúng với chữ kí bí mật
 */
const verifyToken = async (token, secretSignature) => {
  try {
    // Hàm verify của JWT
    return JWT.verify(token, secretSignature)
  } catch (error) { throw new Error(error) }
}


/**
 * 2 cái chữ ký bí mật quan trọng trong dự án. Dành cho JWT - Jsonwebtokens
 * Lưu ý phải lưu vào biến môi trường ENV trong thực tế cho bảo mật.
 */
export const ACCESS_TOKEN_SECRET_SIGNATURE = 'KBgJwUETt4HeVD05WaXXI9V3JnwCVP'
export const REFRESH_TOKEN_SECRET_SIGNATURE = 'fcCjhnpeopVn2Hg1jG75MUi62051yL'

export const JwtProvider = {
  generateToken,
  verifyToken
}