
import axios from 'axios';

let apiUrlCache:string = '';
const API_URL = `/api`;

/**
 * This is the baseUrl of the server that needs to fwded to the windows service to initiate uploads
 * With VITE configs, the server url is not getting picked up via the env vars in openshift; though its working fine in local
 * In the interest of time, using this wierd way retrieving the url by via an endpoing.
 * NOT RECOMMNEDED APPROACH. NEEDS REVISITING AND PROPER INVESTIGATING TO MAKE IT PICK FROM THE ENV VARS
 * @returns the baseUrl of the server
 */
const getApiBaseUrl = async () => {
    console.log(`server url from vite config: ${ import.meta.env.VITE_API_URL}`)
  if (apiUrlCache) {
    return apiUrlCache;
  }

  try {
    const response = await axios.get(`${API_URL}/api/base-url`);
    apiUrlCache = response.data.baseUrl;
    return apiUrlCache;
  } catch (error) {
    console.error('Error fetching API base URL:', error);
    throw error;
  }
};

export { getApiBaseUrl };
