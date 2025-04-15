import { jwtDecode } from 'jwt-decode';

export const decodeAccessToken = (
  accessToken: string,
):
  | {
      exp: number;
      projectId: string;
      sub: string;
    }
  | undefined => {
  try {
    return jwtDecode(accessToken);
  } catch (e) {
    console.error('Failed to decode access token', e);
    return undefined;
  }
};

export const decodeProjectId = (accessToken: string) => {
  const decoded = decodeAccessToken(accessToken);

  return decoded?.projectId || '';
}
