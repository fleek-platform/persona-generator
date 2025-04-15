import { getDefined } from './defined.js';

const restApiUrl = getDefined('PUBLIC_FLEEK_REST_API_URL');

type Project = {
  id: string;
  teamId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export const isValidUserProjectAccount = async ({
  accessToken,
  projectId
}: {
  accessToken: string;
  projectId: string;
}) => {
  try {
    const url = new URL(`${restApiUrl}/api/v1/projects/${projectId}`);
    
    const res = await fetch(url.href, {
      "headers": {
        "authorization": `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      "body": null,
      "method": "GET",
    });

    if (!res.ok) {
      throw new Error('Network response was not ok');
    }

    const { id, teamId, name, createdAt } = await res.json() as Project;

    if (!id || !teamId || !name || !createdAt) throw Error('Unexpected project data');

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
