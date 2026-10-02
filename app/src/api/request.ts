import { isPreview, isPublicDemo } from '@/runtime';
import { getToken } from "@/utils/auth";
import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosRequestConfig, AxiosInstance } from "axios";

export interface HttpResponse<T = any> {
  code: number;
  msg?: string;
  message?: string;
  data: T;
  [propName: string]: any;
}

// 扩展 AxiosInstance 类型，使其方法返回 HttpResponse<T>
interface RequestInstance extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'patch' | 'delete'> {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
}

const config = {
  baseURL: '',
  timeout: 10000,
  withCredentials: true,
  headers: {},
};

const requestInstance = axios.create(config);

requestInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if ((import.meta.env.DEV || isPublicDemo) && isPreview) {
      config.adapter = async (requestConfig) => {
        if (requestConfig.method !== 'get') throw new Error('演示预览已禁用保存与设备指令');
        const { getPreviewData } = await import('./preview');
        const data = getPreviewData(requestConfig.url || '', requestConfig.params);
        return { data: {code:0,data}, status:200, statusText:'OK', headers:{}, config:requestConfig };
      };
      return config;
    }
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

requestInstance.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const { data } = response;
    if (data.code !== 0) {
      let error = new Error(data.msg || data.message || '请求失败！');
      console.log(error);
      return Promise.reject(error);
    }
    return data as any;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

// 将 requestInstance 类型断言为 RequestInstance，使其具有正确的类型
const request = requestInstance as unknown as RequestInstance;

export default request;
