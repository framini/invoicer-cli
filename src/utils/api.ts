import axios, { AxiosRequestConfig } from 'axios';

type ApiConfig = AxiosRequestConfig;

export const api = (config: ApiConfig) => axios(config);
