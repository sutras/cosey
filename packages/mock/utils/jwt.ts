import CryptoJS from 'crypto-js';

/**
 * jwt 签名与验证
 */
export const jwt = {
  sign(
    payload: object,
    options?: {
      expiresIn: number;
    },
  ) {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = CryptoJS.enc.Base64url.stringify(
      CryptoJS.enc.Utf8.parse(JSON.stringify(header)),
    );

    const encodedPayload = CryptoJS.enc.Base64url.stringify(
      CryptoJS.enc.Utf8.parse(
        JSON.stringify({
          ...payload,
          exp: Date.now() + (options?.expiresIn || 60 * 60 * 24) * 1000,
        }),
      ),
    );

    const beforeSign = encodedHeader + '.' + encodedPayload;

    const signature = CryptoJS.enc.Base64url.stringify(CryptoJS.HmacSHA256(beforeSign, jwt.secret));

    return beforeSign + '.' + signature;
  },

  verify(token: string) {
    const [encodedHeader, encodedPayload, signature] = token.replace('Bearer ', '').split('.');

    const beforeSign = encodedHeader + '.' + encodedPayload;

    const matchingSignature = CryptoJS.enc.Base64url.stringify(
      CryptoJS.HmacSHA256(beforeSign, jwt.secret),
    );

    if (signature !== matchingSignature) {
      return new Error('Invalid token');
    }

    const decodedPayload = CryptoJS.enc.Base64url.parse(encodedPayload);
    const payload = JSON.parse(decodedPayload.toString(CryptoJS.enc.Utf8));
    if (payload.exp <= Date.now()) {
      return new Error('Token expired');
    }

    return payload;
  },

  secret: '123456',
};

export function generateTokens(userId: number, username: string) {
  const payload = { username, sub: userId };

  const accessToken = jwt.sign(
    {
      ...payload,
      type: 'access',
    },
    {
      expiresIn: 60 * 30, // 30 minutes
    },
  );
  const refreshToken = jwt.sign(
    {
      ...payload,
      type: 'refresh',
    },
    {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
    },
  );

  return {
    accessToken,
    refreshToken,
  };
}
