import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter';
import axios from 'axios';
import { Api } from './generatedApi/Api';

const axiosAdapter = createUniAppAxiosAdapter();
axios.defaults.adapter = axiosAdapter;
const httpApi = new Api({ baseURL: 'http://localhost:3000' });

export { httpApi };
