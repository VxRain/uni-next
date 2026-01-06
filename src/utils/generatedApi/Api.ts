/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title @fastify/swagger
 * @version 9.6.1
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * @description 获取验证码图片，Cookie保存验证码ID
     *
     * @tags 认证
     * @name GetCaptcha
     * @request GET:/auth/captcha
     */
    getCaptcha: (
      query: {
        /**
         * 验证码业务类型
         * @default "Common"
         */
        bizType: "Signup" | "Login" | "Common";
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/auth/captcha`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 获取验证码SVG和验证码ID
     *
     * @tags 认证
     * @name GetCaptchaWithId
     * @request GET:/auth/captchaUseId
     */
    getCaptchaWithId: (
      query: {
        /**
         * 验证码业务类型
         * @default "Common"
         */
        bizType: "Signup" | "Login" | "Common";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 验证码ID */
            id: string;
            /** 验证码SVG */
            svg: string;
          };
        },
        any
      >({
        path: `/auth/captchaUseId`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 返回验证码SVG和签名
     *
     * @tags 认证
     * @name GetCaptchaWithSign
     * @request GET:/auth/captchaUseSign
     */
    getCaptchaWithSign: (
      query: {
        /**
         * 验证码业务类型
         * @default "Common"
         */
        bizType: "Signup" | "Login" | "Common";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 验证码签名 */
            sign: string;
            /** 验证码SVG */
            svg: string;
          };
        },
        any
      >({
        path: `/auth/captchaUseSign`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 校验验证码，判断验证码是否正确，和业务无关联
     *
     * @tags 认证
     * @name VerifyCaptcha
     * @request POST:/auth/captchaVerify
     */
    verifyCaptcha: (
      query: {
        /** 验证码ID */
        captchaId?: string;
        /** 验证码签名 */
        captchaSign?: string;
        /**
         * 验证码
         * @minLength 4
         * @maxLength 4
         */
        captchaText: string;
        /**
         * 验证码业务类型
         * @default "Common"
         */
        captchaBizType: "Signup" | "Login" | "Common";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: null;
        },
        {
          /**
           * 非0状态码
           * @min 1
           * @default 1
           */
          code: number;
          /**
           * 错误提示信息
           * @default "验证码无效或已过期"
           */
          msg: string;
          data: null;
        }
      >({
        path: `/auth/captchaVerify`,
        method: "POST",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 注册用户
     *
     * @tags 认证
     * @name Signup
     * @request POST:/auth/signup
     */
    signup: (
      data: {
        /**
         * 用户名
         * @minLength 3
         * @maxLength 32
         */
        username: string;
        /**
         * 密码
         * @minLength 6
         * @maxLength 32
         */
        password: string;
        /** 验证码ID */
        captchaId?: string;
        /** 验证码签名 */
        captchaSign?: string;
        /**
         * 验证码
         * @minLength 4
         * @maxLength 4
         */
        captchaText: string;
        /**
         * 验证码业务类型
         * @default "Common"
         */
        captchaBizType: "Signup" | "Login" | "Common";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            user: {
              /** 用户ID */
              id: number;
              /** 用户名 */
              username: string;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: any;
              /** 昵称 */
              nickname: string | null;
              /** 状态 */
              status: number;
              /** 手机号 */
              mobile: string | null;
              /** 邮箱 */
              email: string | null;
              /** 头像 */
              avatar: string | null;
              /** 邀请人ID */
              invitorId: number | null;
            };
            /** 访问令牌 */
            accessToken: string;
            /** 刷新令牌 */
            refreshToken: string;
          };
        },
        {
          /**
           * 非0状态码
           * @min 1
           * @default 1
           */
          code: number;
          /**
           * 错误提示信息
           * @default "验证失败"
           */
          msg: string;
          data: null;
        }
      >({
        path: `/auth/signup`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 登录
     *
     * @tags 认证
     * @name Login
     * @request POST:/auth/login
     */
    login: (
      data: {
        /**
         * 用户名
         * @minLength 3
         * @maxLength 32
         */
        username: string;
        /**
         * 密码
         * @minLength 6
         * @maxLength 32
         */
        password: string;
        /** 验证码ID */
        captchaId?: string;
        /** 验证码签名 */
        captchaSign?: string;
        /**
         * 验证码
         * @minLength 4
         * @maxLength 4
         */
        captchaText: string;
        /**
         * 验证码业务类型
         * @default "Common"
         */
        captchaBizType: "Signup" | "Login" | "Common";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            user: {
              /** 用户ID */
              id: number;
              /** 用户名 */
              username: string;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: any;
              /** 昵称 */
              nickname: string | null;
              /** 状态 */
              status: number;
              /** 手机号 */
              mobile: string | null;
              /** 邮箱 */
              email: string | null;
              /** 头像 */
              avatar: string | null;
              /** 邀请人ID */
              invitorId: number | null;
            };
            /** 访问令牌 */
            accessToken: string;
            /** 刷新令牌 */
            refreshToken: string;
          };
        },
        {
          /**
           * 非0状态码
           * @min 1
           * @default 1
           */
          code: number;
          /**
           * 错误提示信息
           * @default "验证失败"
           */
          msg: string;
          data: null;
        }
      >({
        path: `/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 使用refreshToken获取新的Tokens，RefreshToken只有有效期不足一半时才会刷新返回
     *
     * @tags 认证
     * @name RefreshToken
     * @request GET:/auth/refreshToken
     */
    refreshToken: (params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 访问令牌 */
            accessToken: string;
            /** 刷新令牌 */
            refreshToken: string;
          };
        },
        {
          /**
           * 非0状态码
           * @min 1
           * @default 1
           */
          code: number;
          /**
           * 错误提示信息
           * @default "错误提示信息"
           */
          msg: string;
          data: null;
        }
      >({
        path: `/auth/refreshToken`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 获取开发测试Token，有效期100年，用户ID为1
     *
     * @tags 认证
     * @name GetDevToken
     * @request GET:/auth/devToken
     */
    getDevToken: (
      query: {
        /**
         * 密码
         * @minLength 1
         * @maxLength 100
         */
        password: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 访问令牌 */
            accessToken: string;
          };
        },
        {
          /**
           * 非0状态码
           * @min 1
           * @default 1
           */
          code: number;
          /**
           * 错误提示信息
           * @default "密码错误"
           */
          msg: string;
          data: null;
        }
      >({
        path: `/auth/devToken`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  permission = {
    /**
     * @description 获取权限列表
     *
     * @tags 权限
     * @name ListPermissions
     * @request GET:/permission/
     */
    listPermissions: (
      query?: {
        /**
         * 页码，从1开始，默认为1
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 每页条数，默认为10，最小为5，最大为100
         * @min 5
         * @max 100
         * @default 10
         */
        take?: number;
        /** 游标分页，上次的ID */
        lastId?: number;
        /**
         * 游标分页，使用的键
         * @default "id"
         */
        cursorKey?: string;
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 总记录数 */
            totalCount?: number;
            /** 总页数 */
            totalPage?: number;
            /** 当前页码 */
            page?: number;
            /** 每页条数 */
            take: number;
            /** 数据列表 */
            list: {
              /** 权限ID */
              id: number;
              /** 权限名称 */
              name: string;
              /** 权限代码 */
              code: string;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: any;
            }[];
          };
        },
        any
      >({
        path: `/permission/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 创建权限
     *
     * @tags 权限
     * @name CreatePermission
     * @request POST:/permission/
     */
    createPermission: (
      data: {
        /**
         * 权限名称
         * @minLength 1
         * @maxLength 50
         */
        name: string;
        /**
         * 权限代码
         * @minLength 1
         * @maxLength 100
         */
        code: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 权限ID */
            id: number;
            /** 权限名称 */
            name: string;
            /** 权限代码 */
            code: string;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: any;
          };
        },
        any
      >({
        path: `/permission/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 获取所有权限
     *
     * @tags 权限
     * @name ListAllPermissions
     * @request GET:/permission/all
     */
    listAllPermissions: (params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 权限ID */
            id: number;
            /** 权限名称 */
            name: string;
            /** 权限代码 */
            code: string;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: any;
          }[];
        },
        any
      >({
        path: `/permission/all`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 根据ID获取权限
     *
     * @tags 权限
     * @name GetPermission
     * @request GET:/permission/{id}
     */
    getPermission: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 权限ID */
            id: number;
            /** 权限名称 */
            name: string;
            /** 权限代码 */
            code: string;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: any;
          };
        },
        any
      >({
        path: `/permission/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 更新权限
     *
     * @tags 权限
     * @name UpdatePermission
     * @request PUT:/permission/{id}
     */
    updatePermission: (
      id: number,
      data: {
        /**
         * 权限名称
         * @minLength 1
         * @maxLength 50
         */
        name?: string;
        /**
         * 权限代码
         * @minLength 1
         * @maxLength 100
         */
        code?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 权限ID */
            id: number;
            /** 权限名称 */
            name: string;
            /** 权限代码 */
            code: string;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: any;
          };
        },
        any
      >({
        path: `/permission/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 删除权限
     *
     * @tags 权限
     * @name DeletePermission
     * @request DELETE:/permission/{id}
     */
    deletePermission: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            id: number;
          };
        },
        any
      >({
        path: `/permission/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),
  };
  role = {
    /**
     * @description 获取角色列表
     *
     * @tags 角色
     * @name ListRoles
     * @request GET:/role/
     */
    listRoles: (
      query?: {
        /**
         * 页码，从1开始，默认为1
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 每页条数，默认为10，最小为5，最大为100
         * @min 5
         * @max 100
         * @default 10
         */
        take?: number;
        /** 游标分页，上次的ID */
        lastId?: number;
        /**
         * 游标分页，使用的键
         * @default "id"
         */
        cursorKey?: string;
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 总记录数 */
            totalCount?: number;
            /** 总页数 */
            totalPage?: number;
            /** 当前页码 */
            page?: number;
            /** 每页条数 */
            take: number;
            /** 数据列表 */
            list: {
              /** 角色ID */
              id: number;
              /** 角色名称 */
              name: string;
              /** 角色代码 */
              code: string;
              /** 角色描述 */
              desc: string | null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: null;
            }[];
          };
        },
        any
      >({
        path: `/role/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 创建角色
     *
     * @tags 角色
     * @name CreateRole
     * @request POST:/role/
     */
    createRole: (
      data: {
        /**
         * 角色名称
         * @minLength 1
         * @maxLength 50
         */
        name: string;
        /**
         * 角色代码
         * @minLength 1
         * @maxLength 50
         */
        code: string;
        /**
         * 角色描述
         * @maxLength 255
         */
        desc?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 角色ID */
            id: number;
            /** 角色名称 */
            name: string;
            /** 角色代码 */
            code: string;
            /** 角色描述 */
            desc: string | null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: null;
          };
        },
        any
      >({
        path: `/role/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 获取所有角色
     *
     * @tags 角色
     * @name ListAllRoles
     * @request GET:/role/all
     */
    listAllRoles: (
      query?: {
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 角色ID */
            id: number;
            /** 角色名称 */
            name: string;
            /** 角色代码 */
            code: string;
            /** 角色描述 */
            desc: string | null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: null;
          }[];
        },
        any
      >({
        path: `/role/all`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 根据ID获取角色
     *
     * @tags 角色
     * @name GetRole
     * @request GET:/role/{id}
     */
    getRole: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 角色ID */
            id: number;
            /** 角色名称 */
            name: string;
            /** 角色代码 */
            code: string;
            /** 角色描述 */
            desc: string | null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: null;
          };
        },
        any
      >({
        path: `/role/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 更新角色
     *
     * @tags 角色
     * @name UpdateRole
     * @request PUT:/role/{id}
     */
    updateRole: (
      id: number,
      data: {
        /**
         * 角色名称
         * @minLength 1
         * @maxLength 50
         */
        name?: string;
        /**
         * 角色代码
         * @minLength 1
         * @maxLength 50
         */
        code?: string;
        /**
         * 角色描述
         * @maxLength 255
         */
        desc?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 角色ID */
            id: number;
            /** 角色名称 */
            name: string;
            /** 角色代码 */
            code: string;
            /** 角色描述 */
            desc: string | null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: null;
          };
        },
        any
      >({
        path: `/role/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 删除角色
     *
     * @tags 角色
     * @name DeleteRole
     * @request DELETE:/role/{id}
     */
    deleteRole: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            id: number;
          };
        },
        any
      >({
        path: `/role/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description 获取角色权限列表
     *
     * @tags 角色
     * @name GetRolePermissions
     * @request GET:/role/{id}/permissions
     */
    getRolePermissions: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 权限ID */
            id: number;
            /** 权限名称 */
            name: string;
            /** 权限代码 */
            code: string;
          }[];
        },
        any
      >({
        path: `/role/${id}/permissions`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 分配权限给角色
     *
     * @tags 角色
     * @name AssignPermissionsToRole
     * @request POST:/role/{id}/assignPermissions
     */
    assignPermissionsToRole: (
      id: number,
      data: {
        /**
         * 权限ID数组
         * @minItems 1
         */
        permissionIds: number[];
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: null;
        },
        any
      >({
        path: `/role/${id}/assignPermissions`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 取消角色的所有权限
     *
     * @tags 角色
     * @name UnassignRolePermissions
     * @request POST:/role/{id}/unassignPermissions
     */
    unassignRolePermissions: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: null;
        },
        any
      >({
        path: `/role/${id}/unassignPermissions`,
        method: "POST",
        format: "json",
        ...params,
      }),
  };
  user = {
    /**
     * @description 获取用户列表
     *
     * @tags 用户
     * @name ListUsers
     * @request GET:/user/
     */
    listUsers: (
      query?: {
        /** 用户名(模糊查询) */
        username?: string;
        /** 状态：0正常 1封禁 */
        status?: number;
        /**
         * 页码，从1开始，默认为1
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 每页条数，默认为10，最小为5，最大为100
         * @min 5
         * @max 100
         * @default 10
         */
        take?: number;
        /** 游标分页，上次的ID */
        lastId?: number;
        /**
         * 游标分页，使用的键
         * @default "id"
         */
        cursorKey?: string;
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 总记录数 */
            totalCount?: number;
            /** 总页数 */
            totalPage?: number;
            /** 当前页码 */
            page?: number;
            /** 每页条数 */
            take: number;
            /** 数据列表 */
            list: {
              /** 用户ID */
              id: number;
              /** 用户名 */
              username: string;
              /** 昵称 */
              nickname: string | null;
              /** 手机号 */
              mobile: string | null;
              /** 邮箱 */
              email: string | null;
              /** 头像 */
              avatar: string | null;
              /** 状态：0正常 1封禁 */
              status: number;
              /** 邀请人ID */
              invitorId: number | null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: null;
              roles?: {
                /** 角色ID */
                id: number;
                /** 角色名称 */
                name: string;
                /** 角色代码 */
                code: string;
                /** 角色描述 */
                desc: string | null;
                /** 创建时间 */
                createdAt: any;
                /** 更新时间 */
                updatedAt: null;
              }[];
              profile?: null | {
                /** 用户ID */
                userId: number;
                /** 真实姓名 */
                realName: string | null;
                /** 个性签名 */
                bio: string | null;
                /** 生日 */
                birthday: null;
                /** 性别 */
                gender: number | null;
                /** 身份证号 */
                idCardNum: string | null;
                /** 创建时间 */
                createdAt: any;
                /** 更新时间 */
                updatedAt: null;
              };
            }[];
          };
        },
        any
      >({
        path: `/user/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 创建用户
     *
     * @tags 用户
     * @name CreateUser
     * @request POST:/user/
     */
    createUser: (
      data: {
        /**
         * 用户名
         * @minLength 3
         * @maxLength 32
         */
        username: string;
        /**
         * 密码
         * @minLength 6
         * @maxLength 32
         */
        password: string;
        /**
         * 昵称
         * @maxLength 50
         */
        nickname?: string;
        /**
         * 手机号
         * @minLength 11
         * @maxLength 11
         */
        mobile?: string;
        /**
         * 邮箱
         * @format email
         */
        email?: string;
        /** 头像URL */
        avatar?: string;
        /**
         * 状态：0正常 1封禁
         * @default 0
         */
        status?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 用户ID */
            id: number;
            /** 用户名 */
            username: string;
            /** 昵称 */
            nickname: string | null;
            /** 手机号 */
            mobile: string | null;
            /** 邮箱 */
            email: string | null;
            /** 头像 */
            avatar: string | null;
            /** 状态：0正常 1封禁 */
            status: number;
            /** 邀请人ID */
            invitorId: number | null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: null;
            roles?: {
              /** 角色ID */
              id: number;
              /** 角色名称 */
              name: string;
              /** 角色代码 */
              code: string;
              /** 角色描述 */
              desc: string | null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: null;
            }[];
            profile?: null | {
              /** 用户ID */
              userId: number;
              /** 真实姓名 */
              realName: string | null;
              /** 个性签名 */
              bio: string | null;
              /** 生日 */
              birthday: null;
              /** 性别 */
              gender: number | null;
              /** 身份证号 */
              idCardNum: string | null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: null;
            };
          };
        },
        any
      >({
        path: `/user/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 根据ID获取用户
     *
     * @tags 用户
     * @name GetUser
     * @request GET:/user/{id}
     */
    getUser: (
      id: number,
      query?: {
        /**
         * 是否包含角色列表
         * @default false
         */
        withRoles?: boolean;
        /**
         * 是否包含用户资料
         * @default false
         */
        withProfile?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 用户ID */
            id: number;
            /** 用户名 */
            username: string;
            /** 昵称 */
            nickname: string | null;
            /** 手机号 */
            mobile: string | null;
            /** 邮箱 */
            email: string | null;
            /** 头像 */
            avatar: string | null;
            /** 状态：0正常 1封禁 */
            status: number;
            /** 邀请人ID */
            invitorId: number | null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: null;
            roles?: {
              /** 角色ID */
              id: number;
              /** 角色名称 */
              name: string;
              /** 角色代码 */
              code: string;
              /** 角色描述 */
              desc: string | null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: null;
            }[];
            profile?: null | {
              /** 用户ID */
              userId: number;
              /** 真实姓名 */
              realName: string | null;
              /** 个性签名 */
              bio: string | null;
              /** 生日 */
              birthday: null;
              /** 性别 */
              gender: number | null;
              /** 身份证号 */
              idCardNum: string | null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: null;
            };
          };
        },
        any
      >({
        path: `/user/${id}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 更新用户
     *
     * @tags 用户
     * @name UpdateUser
     * @request PUT:/user/{id}
     */
    updateUser: (
      id: number,
      data: {
        /**
         * 密码
         * @minLength 6
         * @maxLength 32
         */
        password?: string;
        /**
         * 昵称
         * @maxLength 50
         */
        nickname?: string;
        /**
         * 手机号
         * @minLength 11
         * @maxLength 11
         */
        mobile?: string;
        /**
         * 邮箱
         * @format email
         */
        email?: string;
        /** 头像URL */
        avatar?: string;
        /** 状态：0正常 1封禁 */
        status?: number;
        profile?: {
          /**
           * 真实姓名
           * @maxLength 50
           */
          realName?: string;
          /**
           * 个性签名
           * @maxLength 200
           */
          bio?: string;
          /** 生日 */
          birthday?: any;
          /** 性别：0未知 1男性 2女性 */
          gender?: number;
          /**
           * 身份证号
           * @minLength 15
           * @maxLength 18
           */
          idCardNum?: string;
        };
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 用户ID */
            id: number;
            /** 用户名 */
            username: string;
            /** 昵称 */
            nickname: string | null;
            /** 手机号 */
            mobile: string | null;
            /** 邮箱 */
            email: string | null;
            /** 头像 */
            avatar: string | null;
            /** 状态：0正常 1封禁 */
            status: number;
            /** 邀请人ID */
            invitorId: number | null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: null;
            roles?: {
              /** 角色ID */
              id: number;
              /** 角色名称 */
              name: string;
              /** 角色代码 */
              code: string;
              /** 角色描述 */
              desc: string | null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: null;
            }[];
            profile?: null | {
              /** 用户ID */
              userId: number;
              /** 真实姓名 */
              realName: string | null;
              /** 个性签名 */
              bio: string | null;
              /** 生日 */
              birthday: null;
              /** 性别 */
              gender: number | null;
              /** 身份证号 */
              idCardNum: string | null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: null;
            };
          };
        },
        any
      >({
        path: `/user/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 删除用户
     *
     * @tags 用户
     * @name DeleteUser
     * @request DELETE:/user/{id}
     */
    deleteUser: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 被删除的用户ID */
            id: number;
          };
        },
        any
      >({
        path: `/user/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description 获取用户角色列表
     *
     * @tags 用户
     * @name GetUserRoles
     * @request GET:/user/{id}/roles
     */
    getUserRoles: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 角色ID */
            id: number;
            /** 角色名称 */
            name: string;
            /** 角色代码 */
            code: string;
            /** 角色描述 */
            desc: string | null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: null;
          }[];
        },
        any
      >({
        path: `/user/${id}/roles`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 获取用户档案
     *
     * @tags 用户
     * @name GetUserProfile
     * @request GET:/user/{id}/profile
     */
    getUserProfile: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: null | {
            /** 用户ID */
            userId: number;
            /** 真实姓名 */
            realName: string | null;
            /** 个性签名 */
            bio: string | null;
            /** 生日 */
            birthday: null;
            /** 性别 */
            gender: number | null;
            /** 身份证号 */
            idCardNum: string | null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: null;
          };
        },
        any
      >({
        path: `/user/${id}/profile`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 获取用户权限列表
     *
     * @tags 用户
     * @name GetUserPermissions
     * @request GET:/user/{id}/allPermissions
     */
    getUserPermissions: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 权限ID */
            id: number;
            /** 权限名称 */
            name: string;
            /** 权限码 */
            code: string;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: null;
          }[];
        },
        any
      >({
        path: `/user/${id}/allPermissions`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 分配角色给用户
     *
     * @tags 用户
     * @name AssignRolesToUser
     * @request POST:/user/{id}/assignRoles
     */
    assignRolesToUser: (
      id: number,
      data: {
        /**
         * 角色ID数组
         * @minItems 1
         */
        roleIds: number[];
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: null;
        },
        any
      >({
        path: `/user/${id}/assignRoles`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 取消用户的指定角色
     *
     * @tags 用户
     * @name UnassignUserRoles
     * @request POST:/user/{id}/unassignRoles
     */
    unassignUserRoles: (
      id: number,
      data: {
        /**
         * 角色ID数组
         * @minItems 1
         */
        roleIds: number[];
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: null;
        },
        any
      >({
        path: `/user/${id}/unassignRoles`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  knowledgeBase = {
    /**
     * @description 获取知识库列表
     *
     * @tags 知识库
     * @name ListKnowledgeBases
     * @request GET:/knowledgeBase/
     */
    listKnowledgeBases: (
      query?: {
        /**
         * 页码，从1开始，默认为1
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 每页条数，默认为10，最小为5，最大为100
         * @min 5
         * @max 100
         * @default 10
         */
        take?: number;
        /** 游标分页，上次的ID */
        lastId?: number;
        /**
         * 游标分页，使用的键
         * @default "id"
         */
        cursorKey?: string;
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 总记录数 */
            totalCount?: number;
            /** 总页数 */
            totalPage?: number;
            /** 当前页码 */
            page?: number;
            /** 每页条数 */
            take: number;
            /** 数据列表 */
            list: {
              /** 知识库ID */
              id: number;
              /** 知识库名称 */
              name: string;
              /** 知识库描述 */
              desc: string | null;
              /** 知识库封面URL */
              cover: string | null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: any;
            }[];
          };
        },
        any
      >({
        path: `/knowledgeBase/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 创建知识库
     *
     * @tags 知识库
     * @name CreateKnowledgeBase
     * @request POST:/knowledgeBase/
     */
    createKnowledgeBase: (
      data: {
        /**
         * 知识库名称
         * @minLength 1
         * @maxLength 100
         */
        name: string;
        /**
         * 知识库描述
         * @maxLength 500
         */
        description: string;
        /**
         * 知识库封面URL
         * @maxLength 500
         */
        cover?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 知识库ID */
            id: number;
            /** 知识库名称 */
            name: string;
            /** 知识库描述 */
            desc: string | null;
            /** 知识库封面URL */
            cover: string | null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: any;
          };
        },
        any
      >({
        path: `/knowledgeBase/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 根据ID获取知识库
     *
     * @tags 知识库
     * @name GetKnowledgeBase
     * @request GET:/knowledgeBase/{id}
     */
    getKnowledgeBase: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 知识库ID */
            id: number;
            /** 知识库名称 */
            name: string;
            /** 知识库描述 */
            desc: string | null;
            /** 知识库封面URL */
            cover: string | null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: any;
          };
        },
        any
      >({
        path: `/knowledgeBase/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 更新知识库
     *
     * @tags 知识库
     * @name UpdateKnowledgeBase
     * @request PUT:/knowledgeBase/{id}
     */
    updateKnowledgeBase: (
      id: number,
      data: {
        /**
         * 知识库名称
         * @minLength 1
         * @maxLength 100
         */
        name?: string;
        /**
         * 知识库描述
         * @maxLength 500
         */
        description?: string;
        /**
         * 知识库封面URL
         * @maxLength 500
         */
        cover?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 知识库ID */
            id: number;
            /** 知识库名称 */
            name: string;
            /** 知识库描述 */
            desc: string | null;
            /** 知识库封面URL */
            cover: string | null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: any;
          };
        },
        any
      >({
        path: `/knowledgeBase/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 删除知识库
     *
     * @tags 知识库
     * @name DeleteKnowledgeBase
     * @request DELETE:/knowledgeBase/{id}
     */
    deleteKnowledgeBase: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            id: number;
          };
        },
        any
      >({
        path: `/knowledgeBase/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description 获取文档列表
     *
     * @tags 知识库
     * @name ListKnowledgeDocuments
     * @request GET:/knowledgeBase/documents
     */
    listKnowledgeDocuments: (
      query: {
        /**
         * 知识库ID
         * @min 1
         */
        knowledgeBaseId: number;
        /** @minLength 1 */
        status?: string;
        /**
         * 页码，从1开始，默认为1
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 每页条数，默认为10，最小为5，最大为100
         * @min 5
         * @max 100
         * @default 10
         */
        take?: number;
        /** 游标分页，上次的ID */
        lastId?: number;
        /**
         * 游标分页，使用的键
         * @default "id"
         */
        cursorKey?: string;
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 总记录数 */
            totalCount?: number;
            /** 总页数 */
            totalPage?: number;
            /** 当前页码 */
            page?: number;
            /** 每页条数 */
            take: number;
            /** 数据列表 */
            list: {
              /** 文档ID */
              id: number;
              /** 知识库ID */
              knowledgeBaseId: number;
              /** 文档名称 */
              fileName: string;
              /** @minLength 1 */
              status: string;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: any;
            }[];
          };
        },
        any
      >({
        path: `/knowledgeBase/documents`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 知识库(RAG)聊天接口
     *
     * @tags 知识库
     * @name ChatWithKnowledgeBase
     * @request POST:/knowledgeBase/chat
     */
    chatWithKnowledgeBase: (
      data: {
        /**
         * 用户消息
         * @minLength 1
         */
        query: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/knowledgeBase/chat`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  knowledgeBaseKbId = {
    /**
     * No description
     *
     * @tags 知识库
     * @name DeleteKnowledgeDocument
     * @request DELETE:/knowledgeBase{kbId}/docs/{docId}
     */
    deleteKnowledgeDocument: (
      kbId: number,
      docId: number,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/knowledgeBase${kbId}/docs/${docId}`,
        method: "DELETE",
        ...params,
      }),
  };
  cdn = {
    /**
     * @description 解析CDN日志
     *
     * @tags CDN
     * @name ParseCdnLog
     * @request GET:/cdn/parseLog
     */
    parseCdnLog: (
      query: {
        logUrl: string;
        logType:
          | "aliyun"
          | "baishan"
          | "tencent"
          | "wangsu"
          | "huawei"
          | "tencentLive"
          | "wangsuLive"
          | "huaweiLive";
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/cdn/parseLog`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 获取CDN已使用流量
     *
     * @tags CDN
     * @name GetCdnUsedTraffic
     * @request GET:/cdn/usedTraffic
     */
    getCdnUsedTraffic: (
      query?: {
        domain?: string;
        startAt?: number;
        endAt?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/cdn/usedTraffic`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 获取CDN流量统计
     *
     * @tags CDN
     * @name GetCdnTrafficStat
     * @request GET:/cdn/trafficStat
     */
    getCdnTrafficStat: (
      query?: {
        domain?: string;
        startAt?: number;
        endAt?: number;
        timeUnit?: "hour" | "day" | "month";
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/cdn/trafficStat`,
        method: "GET",
        query: query,
        ...params,
      }),
  };
  processor = {
    /**
     * No description
     *
     * @tags 处理器
     * @name GetPlaceholderImage
     * @request GET:/processor/placeholder
     */
    getPlaceholderImage: (
      query: {
        /**
         * @min 1
         * @default 200
         */
        width: number;
        /**
         * @min 1
         * @default 100
         */
        height: number;
        /** @default "Hello, World." */
        text: string;
        /**
         * @format regex
         * @default "eee"
         * @pattern ^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$
         */
        bgColor?: string;
        /**
         * @format regex
         * @default "aaa"
         * @pattern ^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$
         */
        color: string;
        /**
         * @min 1
         * @default 16
         */
        fontSize?: number;
        /** @min 1 */
        x?: number;
        /** @min 1 */
        y?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/processor/placeholder`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 测试处理器，新增异步任务，会由消费者异步处理
     *
     * @tags 处理器
     * @name TestProcessor
     * @request GET:/processor/testProcessor
     */
    testProcessor: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/processor/testProcessor`,
        method: "GET",
        ...params,
      }),
  };
  qBank = {
    /**
     * @description 获取题库列表
     *
     * @tags 题库
     * @name ListQBanks
     * @request GET:/qBank/
     */
    listQBanks: (
      query?: {
        /** 搜索关键词 */
        search?: string;
        /** 是否获取SKU */
        withSkus?: boolean;
        /**
         * 页码，从1开始，默认为1
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 每页条数，默认为10，最小为5，最大为100
         * @min 5
         * @max 100
         * @default 10
         */
        take?: number;
        /** 游标分页，上次的ID */
        lastId?: number;
        /**
         * 游标分页，使用的键
         * @default "id"
         */
        cursorKey?: string;
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 总记录数 */
            totalCount?: number;
            /** 总页数 */
            totalPage?: number;
            /** 当前页码 */
            page?: number;
            /** 每页条数 */
            take: number;
            /** 数据列表 */
            list: {
              /** 题库ID */
              id: number;
              /** 题库名称 */
              name: string;
              /** 副标题 */
              subTitle: null | string;
              /** 题库简介 */
              desc: null | string;
              /** 题库详情 */
              content: null | string;
              /** 题库封面 */
              cover: null | string;
              /**
               * 试题数量
               * @min 0
               */
              questionCount: number;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: any;
              skus?: {
                /** SKU ID */
                id: number;
                /** 题库ID */
                qBankId: number;
                /** SKU名称 */
                name: string;
                /** SKU描述 */
                desc: null | string;
                /**
                 * 价格
                 * @min 0
                 */
                price: number;
                /**
                 * 市场价
                 * @min 0
                 */
                marketPrice: number;
                /** 有效期类型 */
                validType: "Day" | "Fixed" | "Permanent";
                /** 有效天数 */
                validDay: null | number;
                /** 截止日期 */
                validDate: null;
                /** 创建时间 */
                createdAt: any;
                /** 更新时间 */
                updatedAt: any;
              }[];
            }[];
          };
        },
        any
      >({
        path: `/qBank/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 创建题库
     *
     * @tags 题库
     * @name CreateQBank
     * @request POST:/qBank/
     */
    createQBank: (
      data: {
        /**
         * 题库名称
         * @minLength 1
         * @maxLength 100
         */
        name: string;
        /**
         * 副标题
         * @maxLength 200
         */
        subTitle?: string;
        /**
         * 题库简介
         * @maxLength 500
         */
        desc?: string;
        /** 题库详情 */
        content?: string;
        /**
         * 题库封面
         * @format uri
         */
        cover?: string;
        skus?: {
          /**
           * SKU名称
           * @minLength 1
           * @maxLength 100
           */
          name: string;
          /**
           * SKU描述
           * @maxLength 500
           */
          desc?: string;
          /**
           * 价格
           * @min 0
           */
          price: number;
          /**
           * 市场价
           * @min 0
           */
          marketPrice: number;
          /** 有效期类型 */
          validType: "Day" | "Fixed" | "Permanent";
          /**
           * 有效天数
           * @min 1
           */
          validDay?: number;
          /**
           * 截止日期
           * @format date-time
           */
          validDate?: string;
        }[];
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 题库ID */
            id: number;
            /** 题库名称 */
            name: string;
            /** 副标题 */
            subTitle: null | string;
            /** 题库简介 */
            desc: null | string;
            /** 题库详情 */
            content: null | string;
            /** 题库封面 */
            cover: null | string;
            /**
             * 试题数量
             * @min 0
             */
            questionCount: number;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: any;
            skus?: {
              /** SKU ID */
              id: number;
              /** 题库ID */
              qBankId: number;
              /** SKU名称 */
              name: string;
              /** SKU描述 */
              desc: null | string;
              /**
               * 价格
               * @min 0
               */
              price: number;
              /**
               * 市场价
               * @min 0
               */
              marketPrice: number;
              /** 有效期类型 */
              validType: "Day" | "Fixed" | "Permanent";
              /** 有效天数 */
              validDay: null | number;
              /** 截止日期 */
              validDate: null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: any;
            }[];
          };
        },
        any
      >({
        path: `/qBank/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 根据ID获取题库详情
     *
     * @tags 题库
     * @name GetQBank
     * @request GET:/qBank/{id}
     */
    getQBank: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 题库ID */
            id: number;
            /** 题库名称 */
            name: string;
            /** 副标题 */
            subTitle: null | string;
            /** 题库简介 */
            desc: null | string;
            /** 题库详情 */
            content: null | string;
            /** 题库封面 */
            cover: null | string;
            /**
             * 试题数量
             * @min 0
             */
            questionCount: number;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: any;
            skus?: {
              /** SKU ID */
              id: number;
              /** 题库ID */
              qBankId: number;
              /** SKU名称 */
              name: string;
              /** SKU描述 */
              desc: null | string;
              /**
               * 价格
               * @min 0
               */
              price: number;
              /**
               * 市场价
               * @min 0
               */
              marketPrice: number;
              /** 有效期类型 */
              validType: "Day" | "Fixed" | "Permanent";
              /** 有效天数 */
              validDay: null | number;
              /** 截止日期 */
              validDate: null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: any;
            }[];
          };
        },
        any
      >({
        path: `/qBank/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 更新题库
     *
     * @tags 题库
     * @name UpdateQBank
     * @request PUT:/qBank/{id}
     */
    updateQBank: (
      id: number,
      data: {
        /**
         * 题库名称
         * @minLength 1
         * @maxLength 100
         */
        name?: string;
        /**
         * 副标题
         * @maxLength 200
         */
        subTitle?: string;
        /**
         * 题库简介
         * @maxLength 500
         */
        desc?: string;
        /** 题库详情 */
        content?: string;
        /**
         * 题库封面
         * @format uri
         */
        cover?: string;
        skus?: {
          /**
           * SKU名称
           * @minLength 1
           * @maxLength 100
           */
          name: string;
          /**
           * SKU描述
           * @maxLength 500
           */
          desc?: string;
          /**
           * 价格
           * @min 0
           */
          price: number;
          /**
           * 市场价
           * @min 0
           */
          marketPrice: number;
          /** 有效期类型 */
          validType: "Day" | "Fixed" | "Permanent";
          /**
           * 有效天数
           * @min 1
           */
          validDay?: number;
          /**
           * 截止日期
           * @format date-time
           */
          validDate?: string;
        }[];
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 题库ID */
            id: number;
            /** 题库名称 */
            name: string;
            /** 副标题 */
            subTitle: null | string;
            /** 题库简介 */
            desc: null | string;
            /** 题库详情 */
            content: null | string;
            /** 题库封面 */
            cover: null | string;
            /**
             * 试题数量
             * @min 0
             */
            questionCount: number;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: any;
            skus?: {
              /** SKU ID */
              id: number;
              /** 题库ID */
              qBankId: number;
              /** SKU名称 */
              name: string;
              /** SKU描述 */
              desc: null | string;
              /**
               * 价格
               * @min 0
               */
              price: number;
              /**
               * 市场价
               * @min 0
               */
              marketPrice: number;
              /** 有效期类型 */
              validType: "Day" | "Fixed" | "Permanent";
              /** 有效天数 */
              validDay: null | number;
              /** 截止日期 */
              validDate: null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: any;
            }[];
          };
        },
        any
      >({
        path: `/qBank/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 删除题库
     *
     * @tags 题库
     * @name DeleteQBank
     * @request DELETE:/qBank/{id}
     */
    deleteQBank: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /**
             * 题库ID
             * @min 1
             */
            id: number;
          };
        },
        any
      >({
        path: `/qBank/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description 获取题库SKU列表
     *
     * @tags 题库
     * @name ListQBankSkus
     * @request GET:/qBank/{qBankId}/skus
     */
    listQBankSkus: (
      id: number,
      qBankId: string,
      query?: {
        /**
         * 页码，从1开始，默认为1
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 每页条数，默认为10，最小为5，最大为100
         * @min 5
         * @max 100
         * @default 10
         */
        take?: number;
        /** 游标分页，上次的ID */
        lastId?: number;
        /**
         * 游标分页，使用的键
         * @default "id"
         */
        cursorKey?: string;
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 总记录数 */
            totalCount?: number;
            /** 总页数 */
            totalPage?: number;
            /** 当前页码 */
            page?: number;
            /** 每页条数 */
            take: number;
            /** 数据列表 */
            list: {
              /** SKU ID */
              id: number;
              /** 题库ID */
              qBankId: number;
              /** SKU名称 */
              name: string;
              /** SKU描述 */
              desc: null | string;
              /**
               * 价格
               * @min 0
               */
              price: number;
              /**
               * 市场价
               * @min 0
               */
              marketPrice: number;
              /** 有效期类型 */
              validType: "Day" | "Fixed" | "Permanent";
              /** 有效天数 */
              validDay: null | number;
              /** 截止日期 */
              validDate: null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: any;
            }[];
          };
        },
        any
      >({
        path: `/qBank/${qBankId}/skus`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 创建题库SKU
     *
     * @tags 题库
     * @name CreateQBankSku
     * @request POST:/qBank/{qBankId}/skus
     */
    createQBankSku: (
      id: number,
      qBankId: string,
      data: {
        /**
         * 题库ID
         * @min 1
         */
        qBankId: number;
        /**
         * SKU名称
         * @minLength 1
         * @maxLength 100
         */
        name: string;
        /**
         * SKU描述
         * @maxLength 500
         */
        desc?: string;
        /**
         * 价格
         * @min 0
         */
        price: number;
        /**
         * 市场价
         * @min 0
         */
        marketPrice: number;
        /** 有效期类型 */
        validType: "Day" | "Fixed" | "Permanent";
        /**
         * 有效天数
         * @min 1
         */
        validDay?: number;
        /**
         * 截止日期
         * @format date-time
         */
        validDate?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** SKU ID */
            id: number;
            /** 题库ID */
            qBankId: number;
            /** SKU名称 */
            name: string;
            /** SKU描述 */
            desc: null | string;
            /**
             * 价格
             * @min 0
             */
            price: number;
            /**
             * 市场价
             * @min 0
             */
            marketPrice: number;
            /** 有效期类型 */
            validType: "Day" | "Fixed" | "Permanent";
            /** 有效天数 */
            validDay: null | number;
            /** 截止日期 */
            validDate: null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: any;
          };
        },
        any
      >({
        path: `/qBank/${qBankId}/skus`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 获取题库SKU详情
     *
     * @tags 题库
     * @name GetQBankSku
     * @request GET:/qBank/{qBankId}/skus/{id}
     */
    getQBankSku: (
      qBankId: {
        /**
         * 题库ID
         * @min 1
         */
        id?: number;
      },
      id: number,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** SKU ID */
            id: number;
            /** 题库ID */
            qBankId: number;
            /** SKU名称 */
            name: string;
            /** SKU描述 */
            desc: null | string;
            /**
             * 价格
             * @min 0
             */
            price: number;
            /**
             * 市场价
             * @min 0
             */
            marketPrice: number;
            /** 有效期类型 */
            validType: "Day" | "Fixed" | "Permanent";
            /** 有效天数 */
            validDay: null | number;
            /** 截止日期 */
            validDate: null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: any;
          };
        },
        any
      >({
        path: `/qBank/${qBankId}/skus/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 更新题库SKU
     *
     * @tags 题库
     * @name UpdateQBankSku
     * @request PUT:/qBank/{qBankId}/skus/{id}
     */
    updateQBankSku: (
      qBankId: {
        /**
         * 题库ID
         * @min 1
         */
        id?: number;
      },
      id: number,
      data: {
        /**
         * SKU名称
         * @minLength 1
         * @maxLength 100
         */
        name?: string;
        /**
         * SKU描述
         * @maxLength 500
         */
        desc?: string;
        /**
         * 价格
         * @min 0
         */
        price?: number;
        /**
         * 市场价
         * @min 0
         */
        marketPrice?: number;
        /** 有效期类型 */
        validType?: "Day" | "Fixed" | "Permanent";
        /**
         * 有效天数
         * @min 1
         */
        validDay?: number;
        /**
         * 截止日期
         * @format date-time
         */
        validDate?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** SKU ID */
            id: number;
            /** 题库ID */
            qBankId: number;
            /** SKU名称 */
            name: string;
            /** SKU描述 */
            desc: null | string;
            /**
             * 价格
             * @min 0
             */
            price: number;
            /**
             * 市场价
             * @min 0
             */
            marketPrice: number;
            /** 有效期类型 */
            validType: "Day" | "Fixed" | "Permanent";
            /** 有效天数 */
            validDay: null | number;
            /** 截止日期 */
            validDate: null;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: any;
          };
        },
        any
      >({
        path: `/qBank/${qBankId}/skus/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 删除题库SKU
     *
     * @tags 题库
     * @name DeleteQBankSku
     * @request DELETE:/qBank/{qBankId}/skus/{id}
     */
    deleteQBankSku: (
      qBankId: {
        /**
         * 题库ID
         * @min 1
         */
        id?: number;
      },
      id: number,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            id: number;
          };
        },
        any
      >({
        path: `/qBank/${qBankId}/skus/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),
  };
  question = {
    /**
     * @description 获取试题列表
     *
     * @tags 试题
     * @name ListQuestions
     * @request GET:/question/
     */
    listQuestions: (
      query?: {
        /**
         * 题库ID
         * @min 1
         */
        qBankId?: number;
        /**
         * 试题类型
         * @min 1
         * @max 8
         */
        type?: number;
        /**
         * 关键词搜索
         * @maxLength 100
         */
        keyword?: string;
        /** 是否包含内容详情 */
        withBody?: boolean;
        /** 是否包含统计信息 */
        withStat?: boolean;
        /**
         * 页码，从1开始，默认为1
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 每页条数，默认为10，最小为5，最大为100
         * @min 5
         * @max 100
         * @default 10
         */
        take?: number;
        /** 游标分页，上次的ID */
        lastId?: number;
        /**
         * 游标分页，使用的键
         * @default "id"
         */
        cursorKey?: string;
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 总记录数 */
            totalCount?: number;
            /** 总页数 */
            totalPage?: number;
            /** 当前页码 */
            page?: number;
            /** 每页条数 */
            take: number;
            /** 数据列表 */
            list: {
              /** 试题ID */
              id: number;
              /** 所属题库ID */
              qBankId: null | number;
              /** 试题类型 */
              type: number;
              body?: null | {
                /** 试题ID */
                questionId: number;
                /** 题干 */
                stem: string;
                /** 题目答案 */
                answer: null;
                /** 选项 */
                options: null;
                /** 解析 */
                analysis: null | string;
                /** 文本向量 */
                txtVec: null;
                /** 创建时间 */
                createdAt: any;
                /** 更新时间 */
                updatedAt: null;
                /** 创建用户ID */
                createdBy: number;
                /** 更新用户ID */
                updatedBy: null | number;
              };
              stat?: null | {
                /** 总答题次数 */
                answerCount: number;
                /** 答对次数 */
                rightCount: number;
                /** 笔记数量 */
                noteCount: number;
                /** 做过该题的用户数量 */
                userCount: number;
              };
            }[];
          };
        },
        any
      >({
        path: `/question/`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 创建试题
     *
     * @tags 试题
     * @name CreateQuestion
     * @request POST:/question/
     */
    createQuestion: (
      data: {
        /**
         * 所属题库ID
         * @min 1
         */
        qBankId?: number;
        /**
         * 试题类型
         * @min 1
         * @max 8
         */
        type: number;
        body: {
          /**
           * 题干
           * @minLength 1
           * @maxLength 2000
           */
          stem: string;
          /** 题目答案 */
          answer?: any;
          /** 选项 */
          options?: any;
          /**
           * 解析
           * @maxLength 2000
           */
          analysis?: string;
        };
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 试题ID */
            id: number;
            /** 所属题库ID */
            qBankId: null | number;
            /** 试题类型 */
            type: number;
            body?: null | {
              /** 试题ID */
              questionId: number;
              /** 题干 */
              stem: string;
              /** 题目答案 */
              answer: null;
              /** 选项 */
              options: null;
              /** 解析 */
              analysis: null | string;
              /** 文本向量 */
              txtVec: null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: null;
              /** 创建用户ID */
              createdBy: number;
              /** 更新用户ID */
              updatedBy: null | number;
            };
            stat?: null | {
              /** 总答题次数 */
              answerCount: number;
              /** 答对次数 */
              rightCount: number;
              /** 笔记数量 */
              noteCount: number;
              /** 做过该题的用户数量 */
              userCount: number;
            };
          };
        },
        any
      >({
        path: `/question/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 根据ID获取试题详情
     *
     * @tags 试题
     * @name GetQuestion
     * @request GET:/question/{id}
     */
    getQuestion: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 试题ID */
            id: number;
            /** 所属题库ID */
            qBankId: null | number;
            /** 试题类型 */
            type: number;
            body?: null | {
              /** 试题ID */
              questionId: number;
              /** 题干 */
              stem: string;
              /** 题目答案 */
              answer: null;
              /** 选项 */
              options: null;
              /** 解析 */
              analysis: null | string;
              /** 文本向量 */
              txtVec: null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: null;
              /** 创建用户ID */
              createdBy: number;
              /** 更新用户ID */
              updatedBy: null | number;
            };
            stat?: null | {
              /** 总答题次数 */
              answerCount: number;
              /** 答对次数 */
              rightCount: number;
              /** 笔记数量 */
              noteCount: number;
              /** 做过该题的用户数量 */
              userCount: number;
            };
          };
        },
        any
      >({
        path: `/question/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 更新试题
     *
     * @tags 试题
     * @name UpdateQuestion
     * @request PUT:/question/{id}
     */
    updateQuestion: (
      id: number,
      data: {
        /**
         * 所属题库ID
         * @min 1
         */
        qBankId?: number;
        /**
         * 试题类型
         * @min 1
         * @max 8
         */
        type?: number;
        body?: {
          /**
           * 题干
           * @minLength 1
           * @maxLength 2000
           */
          stem: string;
          /** 题目答案 */
          answer?: any;
          /** 选项 */
          options?: any;
          /**
           * 解析
           * @maxLength 2000
           */
          analysis?: string;
        };
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 试题ID */
            id: number;
            /** 所属题库ID */
            qBankId: null | number;
            /** 试题类型 */
            type: number;
            body?: null | {
              /** 试题ID */
              questionId: number;
              /** 题干 */
              stem: string;
              /** 题目答案 */
              answer: null;
              /** 选项 */
              options: null;
              /** 解析 */
              analysis: null | string;
              /** 文本向量 */
              txtVec: null;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: null;
              /** 创建用户ID */
              createdBy: number;
              /** 更新用户ID */
              updatedBy: null | number;
            };
            stat?: null | {
              /** 总答题次数 */
              answerCount: number;
              /** 答对次数 */
              rightCount: number;
              /** 笔记数量 */
              noteCount: number;
              /** 做过该题的用户数量 */
              userCount: number;
            };
          };
        },
        any
      >({
        path: `/question/${id}`,
        method: "PUT",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 删除试题
     *
     * @tags 试题
     * @name DeleteQuestion
     * @request DELETE:/question/{id}
     */
    deleteQuestion: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /**
             * 试题ID
             * @min 1
             */
            id: number;
          };
        },
        any
      >({
        path: `/question/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * @description 试题批量操作（移动、删除）
     *
     * @tags 试题
     * @name BatchOperationQuestions
     * @request POST:/question/batch
     */
    batchOperationQuestions: (
      data: {
        /**
         * 试题ID列表
         * @maxItems 100
         * @minItems 1
         */
        questionIds: number[];
        /** 操作类型：move-移动, delete-删除 */
        operation: "move" | "delete";
        /**
         * 目标题库ID（移动操作时必需）
         * @min 1
         */
        targetQBankId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 成功数量 */
            successCount: number;
            /** 失败数量 */
            failCount: number;
            /** 失败的试题ID列表 */
            failedIds: number[];
          };
        },
        any
      >({
        path: `/question/batch`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 获取指定题库下的试题列表
     *
     * @tags 试题
     * @name ListQuestionsByQBank
     * @request GET:/question/qBank/{qBankId}
     */
    listQuestionsByQBank: (
      qBankId: number,
      query?: {
        /**
         * 题库ID
         * @min 1
         */
        qBankId?: number;
        /**
         * 试题类型
         * @min 1
         * @max 8
         */
        type?: number;
        /**
         * 关键词搜索
         * @maxLength 100
         */
        keyword?: string;
        /** 是否包含内容详情 */
        withBody?: boolean;
        /** 是否包含统计信息 */
        withStat?: boolean;
        /**
         * 页码，从1开始，默认为1
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 每页条数，默认为10，最小为5，最大为100
         * @min 5
         * @max 100
         * @default 10
         */
        take?: number;
        /** 游标分页，上次的ID */
        lastId?: number;
        /**
         * 游标分页，使用的键
         * @default "id"
         */
        cursorKey?: string;
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 总记录数 */
            totalCount?: number;
            /** 总页数 */
            totalPage?: number;
            /** 当前页码 */
            page?: number;
            /** 每页条数 */
            take: number;
            /** 数据列表 */
            list: {
              /** 试题ID */
              id: number;
              /** 所属题库ID */
              qBankId: null | number;
              /** 试题类型 */
              type: number;
              body?: null | {
                /** 试题ID */
                questionId: number;
                /** 题干 */
                stem: string;
                /** 题目答案 */
                answer: null;
                /** 选项 */
                options: null;
                /** 解析 */
                analysis: null | string;
                /** 文本向量 */
                txtVec: null;
                /** 创建时间 */
                createdAt: any;
                /** 更新时间 */
                updatedAt: null;
                /** 创建用户ID */
                createdBy: number;
                /** 更新用户ID */
                updatedBy: null | number;
              };
              stat?: null | {
                /** 总答题次数 */
                answerCount: number;
                /** 答对次数 */
                rightCount: number;
                /** 笔记数量 */
                noteCount: number;
                /** 做过该题的用户数量 */
                userCount: number;
              };
            }[];
          };
        },
        any
      >({
        path: `/question/qBank/${qBankId}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 试题全文搜索
     *
     * @tags 试题
     * @name SearchQuestions
     * @request GET:/question/search
     */
    searchQuestions: (
      query?: {
        /**
         * 题库ID
         * @min 1
         */
        qBankId?: number;
        /**
         * 试题类型
         * @min 1
         * @max 8
         */
        type?: number;
        /**
         * 关键词搜索
         * @maxLength 100
         */
        keyword?: string;
        /** 是否包含内容详情 */
        withBody?: boolean;
        /** 是否包含统计信息 */
        withStat?: boolean;
        /**
         * 页码，从1开始，默认为1
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 每页条数，默认为10，最小为5，最大为100
         * @min 5
         * @max 100
         * @default 10
         */
        take?: number;
        /** 游标分页，上次的ID */
        lastId?: number;
        /**
         * 游标分页，使用的键
         * @default "id"
         */
        cursorKey?: string;
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 总记录数 */
            totalCount?: number;
            /** 总页数 */
            totalPage?: number;
            /** 当前页码 */
            page?: number;
            /** 每页条数 */
            take: number;
            /** 数据列表 */
            list: {
              /** 试题ID */
              id: number;
              /** 所属题库ID */
              qBankId: null | number;
              /** 试题类型 */
              type: number;
              body?: null | {
                /** 试题ID */
                questionId: number;
                /** 题干 */
                stem: string;
                /** 题目答案 */
                answer: null;
                /** 选项 */
                options: null;
                /** 解析 */
                analysis: null | string;
                /** 文本向量 */
                txtVec: null;
                /** 创建时间 */
                createdAt: any;
                /** 更新时间 */
                updatedAt: null;
                /** 创建用户ID */
                createdBy: number;
                /** 更新用户ID */
                updatedBy: null | number;
              };
              stat?: null | {
                /** 总答题次数 */
                answerCount: number;
                /** 答对次数 */
                rightCount: number;
                /** 笔记数量 */
                noteCount: number;
                /** 做过该题的用户数量 */
                userCount: number;
              };
            }[];
          };
        },
        any
      >({
        path: `/question/search`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  quiz = {
    /**
     * @description 提交用户答题历史
     *
     * @tags 答题
     * @name SubmitQuizHistory
     * @request POST:/quiz/submit
     */
    submitQuizHistory: (
      data: {
        /**
         * 题库ID
         * @min 1
         */
        qBankId: number;
        /**
         * 答案列表
         * @minItems 1
         */
        answerList: {
          /**
           * 试题ID
           * @min 1
           */
          qId: number;
          /** 用户答案 */
          answer: string;
        }[];
        /** 最后做题的前端索引 */
        lastIndex?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: null;
        },
        any
      >({
        path: `/quiz/submit`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 获取用户答题历史
     *
     * @tags 答题
     * @name GetQuizHistories
     * @request GET:/quiz/histories
     */
    getQuizHistories: (
      query?: {
        /**
         * 题库ID
         * @min 1
         */
        qBankId?: number;
        /**
         * 页码，从1开始，默认为1
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 每页条数，默认为10，最小为5，最大为100
         * @min 5
         * @max 100
         * @default 10
         */
        take?: number;
        /** 游标分页，上次的ID */
        lastId?: number;
        /**
         * 游标分页，使用的键
         * @default "id"
         */
        cursorKey?: string;
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 总记录数 */
            totalCount?: number;
            /** 总页数 */
            totalPage?: number;
            /** 当前页码 */
            page?: number;
            /** 每页条数 */
            take: number;
            /** 数据列表 */
            list: {
              /** 历史记录ID */
              id: number;
              /** 创建时间 */
              createdAt: any;
              /** 更新时间 */
              updatedAt: null;
              qBank: {
                /** 题库ID */
                id: number;
                /** 题库名称 */
                name: string;
                /** 试题数量 */
                questionCount: number;
              } | null;
            }[];
          };
        },
        any
      >({
        path: `/quiz/histories`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  shortUrl = {
    /**
     * No description
     *
     * @tags 短链接管理
     * @name CreateShortUrl
     * @request POST:/shortUrl/
     */
    createShortUrl: (
      data: {
        /** @format uri */
        url: string;
        /** @format date-time */
        expiredAt?: string;
        /** @min 1 */
        domainId: number;
        /**
         * @minLength 4
         * @maxLength 28
         */
        customHash?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/shortUrl/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 短链接管理
     * @name ListUserDomains
     * @request GET:/shortUrl/userDomains
     */
    listUserDomains: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/shortUrl/userDomains`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 短链接管理
     * @name ListShortUrls
     * @request GET:/shortUrl/getList
     */
    listShortUrls: (
      query?: {
        /**
         * 页码，从1开始，默认为1
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 每页条数，默认为10，最小为5，最大为100
         * @min 5
         * @max 100
         * @default 10
         */
        take?: number;
        /** 游标分页，上次的ID */
        lastId?: number;
        /**
         * 游标分页，使用的键
         * @default "id"
         */
        cursorKey?: string;
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/shortUrl/getList`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 短链接管理
     * @name DeleteShortUrl
     * @request DELETE:/shortUrl/deleteOne
     */
    deleteShortUrl: (
      query: {
        /**
         * ID
         * @min 1
         */
        id: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/shortUrl/deleteOne`,
        method: "DELETE",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 短链接管理
     * @name RedirectShortUrl
     * @request GET:/shortUrl/redirect/{hash}
     */
    redirectShortUrl: (hash: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/shortUrl/redirect/${hash}`,
        method: "GET",
        ...params,
      }),
  };
  upload = {
    /**
     * No description
     *
     * @tags 文件上传
     * @name ListFiles
     * @request GET:/upload
     */
    listFiles: (
      query?: {
        /**
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * @min 1
         * @default 10
         */
        pageSize?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/upload`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 文件上传
     * @name UploadFile
     * @request POST:/upload
     */
    uploadFile: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/upload`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 文件上传
     * @name GetFile
     * @request GET:/upload/{id}
     */
    getFile: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/upload/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags 文件上传
     * @name PatchFile
     * @request PATCH:/upload/{id}
     */
    patchFile: (
      id: number,
      data: {
        /** 文件名 */
        filename: string;
        /** 文件路径 */
        path: string;
        /** 文件大小 */
        size: number;
        /** 文件类型 */
        mimetype: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/upload/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags 文件上传
     * @name DeleteFile
     * @request DELETE:/upload/{id}
     */
    deleteFile: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/upload/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description 获取第三方上传参数
     *
     * @tags 文件上传
     * @name GetThirdPartyUploadParams
     * @request GET:/upload/thirdPartyParam
     */
    getThirdPartyUploadParams: (
      query: {
        /**
         * 第三方服务类型，默认为bg
         * @default "bg"
         */
        type: "xk" | "bg" | "dlkc" | "ktj";
        /**
         * 文件名
         * @minLength 1
         * @maxLength 50
         */
        filename: string;
        /**
         * 文件类型
         * @minLength 1
         * @maxLength 50
         */
        contentType?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/upload/thirdPartyParam`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 获取第三方文件列表
     *
     * @tags 文件上传
     * @name ListThirdPartyFiles
     * @request GET:/upload/thirdPartyFiles
     */
    listThirdPartyFiles: (
      query?: {
        /**
         * 文件名
         * @minLength 0
         * @maxLength 50
         */
        name?: string;
        /** 开始时间 */
        startTime?: number;
        /** 结束时间 */
        endTime?: number;
        /**
         * 页码，从1开始，默认为1
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 每页条数，默认为10，最小为5，最大为100
         * @min 5
         * @max 100
         * @default 10
         */
        take?: number;
        /** 游标分页，上次的ID */
        lastId?: number;
        /**
         * 游标分页，使用的键
         * @default "id"
         */
        cursorKey?: string;
        /** 排序字段，多字段用英文逗号`,`分隔，默认升序；字段名前加`-`表示降序；例如：`-createdAt,id` */
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/upload/thirdPartyFiles`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 更新第三方文件URL
     *
     * @tags 文件上传
     * @name PatchThirdPartyFile
     * @request PATCH:/upload/thirdPartyFiles/{id}
     */
    patchThirdPartyFile: (
      id: number,
      data: {
        /**
         * 文件名
         * @minLength 1
         * @maxLength 50
         */
        name: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/upload/thirdPartyFiles/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 删除第三方文件
     *
     * @tags 文件上传
     * @name DeleteThirdPartyFile
     * @request DELETE:/upload/thirdPartyFiles/{id}
     */
    deleteThirdPartyFile: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/upload/thirdPartyFiles/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description 记录第三方服务的文件URL
     *
     * @tags 文件上传
     * @name CreateThirdPartyFileUrl
     * @request POST:/upload/thirdPartyFileUrls
     */
    createThirdPartyFileUrl: (
      data: {
        /**
         * 文件名
         * @minLength 1
         * @maxLength 50
         */
        name: string;
        /**
         * 文件扩展名
         * @minLength 1
         * @maxLength 10
         */
        ext: string;
        /** 文件大小 */
        size: number;
        /**
         * 文件链接
         * @format uri
         */
        url: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/upload/thirdPartyFileUrls`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),
  };
  wallet = {
    /**
     * @description 获取用户钱包余额
     *
     * @tags 钱包账户
     * @name GetWalletBalance
     * @request GET:/wallet/balance
     */
    getWalletBalance: (
      query?: {
        /**
         * 钱包账户类型
         * @default "Balance"
         */
        type?: "Balance" | "RewardPoint" | "AiPoint";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 钱包ID */
            id: number;
            /** 用户ID */
            userId: number;
            /**
             * 钱包账户类型
             * @default "Balance"
             */
            type: "Balance" | "RewardPoint" | "AiPoint";
            /** 用户余额，单位：分 */
            balance: number;
            /** 冻结余额，单位：分 */
            frozenBalance: number;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: null;
          };
        },
        {
          /**
           * 非0状态码
           * @min 1
           * @default 1
           */
          code: number;
          /**
           * 错误提示信息
           * @default "错误提示信息"
           */
          msg: string;
          data: null;
        }
      >({
        path: `/wallet/balance`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 获取用户所有钱包
     *
     * @tags 钱包账户
     * @name ListUserWallets
     * @request GET:/wallet/wallets
     */
    listUserWallets: (params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 钱包ID */
            id: number;
            /** 用户ID */
            userId: number;
            /**
             * 钱包账户类型
             * @default "Balance"
             */
            type: "Balance" | "RewardPoint" | "AiPoint";
            /** 用户余额，单位：分 */
            balance: number;
            /** 冻结余额，单位：分 */
            frozenBalance: number;
            /** 创建时间 */
            createdAt: any;
            /** 更新时间 */
            updatedAt: null;
          }[];
        },
        {
          /**
           * 非0状态码
           * @min 1
           * @default 1
           */
          code: number;
          /**
           * 错误提示信息
           * @default "错误提示信息"
           */
          msg: string;
          data: null;
        }
      >({
        path: `/wallet/wallets`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 获取用户钱包变动记录
     *
     * @tags 钱包账户
     * @name ListWalletChanges
     * @request GET:/wallet/changes
     */
    listWalletChanges: (
      query?: {
        /**
         * 钱包账户类型
         * @default "Balance"
         */
        type?: "Balance" | "RewardPoint" | "AiPoint";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 变动记录ID */
            id: number;
            /** 用户ID */
            userId: number;
            /**
             * 钱包账户类型
             * @default "Balance"
             */
            type: "Balance" | "RewardPoint" | "AiPoint";
            /** 关联钱包ID */
            walletId: number;
            /** 变动金额，正数增加，负数减少，单位：分 */
            amount: number;
            /** 变动前余额，单位：分 */
            amountBefore: number;
            /** 变动后余额，单位：分 */
            amountAfter: number;
            /** 业务类型标识符，如：RECHARGE、WITHDRAWAL等 */
            bizType: string;
            /** 关联业务单号，如订单号、提现ID等 */
            refBizId: string | null;
            /** 变动说明，用户可见 */
            desc: string | null;
            /** 管理员备注，内部使用 */
            remark: string | null;
            /** 创建时间 */
            createdAt: any;
          }[];
        },
        {
          /**
           * 非0状态码
           * @min 1
           * @default 1
           */
          code: number;
          /**
           * 错误提示信息
           * @default "错误提示信息"
           */
          msg: string;
          data: null;
        }
      >({
        path: `/wallet/changes`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description 创建提现申请
     *
     * @tags 钱包账户
     * @name CreateWithdrawal
     * @request POST:/wallet/withdrawal
     */
    createWithdrawal: (
      data: {
        /**
         * 提现金额，单位：分
         * @min 1
         */
        amount: number;
        /**
         * 提现渠道，如：支付宝、微信、银行卡等
         * @minLength 1
         */
        channel: string;
        /** 用户申请时的备注说明 */
        userRemark?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 提现记录ID */
            id: number;
            /** 用户ID */
            userId: number;
            /** 处理人ID，管理员或审核人员 */
            processorId: number | null;
            /** 提现状态：1已申请 2审核通过 3审核拒绝 4已打款 5打款失败 */
            status: number;
            /** 提现金额，单位：分 */
            amount: number;
            /** 提现渠道，如：支付宝、微信、银行卡等 */
            channel: string;
            /** 用户申请时的备注说明 */
            userRemark: string | null;
            /** 管理员审核时的备注说明 */
            adminRemark: string | null;
            /** 拒绝原因，仅在审核拒绝时填写 */
            rejectMsg: string | null;
            /** 申请时间 */
            createdAt: any;
            /** 审核时间 */
            reviewedAt: null;
            /** 打款时间 */
            paidAt: null;
          };
        },
        {
          /**
           * 非0状态码
           * @min 1
           * @default 1
           */
          code: number;
          /**
           * 错误提示信息
           * @default "余额不足"
           */
          msg: string;
          data: null;
        }
      >({
        path: `/wallet/withdrawal`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 获取用户提现记录
     *
     * @tags 钱包账户
     * @name ListUserWithdrawals
     * @request GET:/wallet/withdrawal
     */
    listUserWithdrawals: (params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 提现记录ID */
            id: number;
            /** 用户ID */
            userId: number;
            /** 处理人ID，管理员或审核人员 */
            processorId: number | null;
            /** 提现状态：1已申请 2审核通过 3审核拒绝 4已打款 5打款失败 */
            status: number;
            /** 提现金额，单位：分 */
            amount: number;
            /** 提现渠道，如：支付宝、微信、银行卡等 */
            channel: string;
            /** 用户申请时的备注说明 */
            userRemark: string | null;
            /** 管理员审核时的备注说明 */
            adminRemark: string | null;
            /** 拒绝原因，仅在审核拒绝时填写 */
            rejectMsg: string | null;
            /** 申请时间 */
            createdAt: any;
            /** 审核时间 */
            reviewedAt: null;
            /** 打款时间 */
            paidAt: null;
          }[];
        },
        {
          /**
           * 非0状态码
           * @min 1
           * @default 1
           */
          code: number;
          /**
           * 错误提示信息
           * @default "错误提示信息"
           */
          msg: string;
          data: null;
        }
      >({
        path: `/wallet/withdrawal`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 管理员获取所有提现记录
     *
     * @tags 钱包账户
     * @name ListAllWithdrawals
     * @request GET:/wallet/allWithdrawals
     */
    listAllWithdrawals: (params: RequestParams = {}) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 提现记录ID */
            id: number;
            /** 用户ID */
            userId: number;
            /** 处理人ID，管理员或审核人员 */
            processorId: number | null;
            /** 提现状态：1已申请 2审核通过 3审核拒绝 4已打款 5打款失败 */
            status: number;
            /** 提现金额，单位：分 */
            amount: number;
            /** 提现渠道，如：支付宝、微信、银行卡等 */
            channel: string;
            /** 用户申请时的备注说明 */
            userRemark: string | null;
            /** 管理员审核时的备注说明 */
            adminRemark: string | null;
            /** 拒绝原因，仅在审核拒绝时填写 */
            rejectMsg: string | null;
            /** 申请时间 */
            createdAt: any;
            /** 审核时间 */
            reviewedAt: null;
            /** 打款时间 */
            paidAt: null;
          }[];
        },
        {
          /**
           * 非0状态码
           * @min 1
           * @default 1
           */
          code: number;
          /**
           * 错误提示信息
           * @default "错误提示信息"
           */
          msg: string;
          data: null;
        }
      >({
        path: `/wallet/allWithdrawals`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 管理员处理提现
     *
     * @tags 钱包账户
     * @name ProcessWithdrawal
     * @request POST:/wallet/processWithdrawal
     */
    processWithdrawal: (
      data: {
        /**
         * 提现记录ID
         * @min 1
         */
        id: number;
        /**
         * 状态：1已申请 2审核通过 3审核拒绝 4已打款 5打款失败
         * @min 1
         * @max 5
         */
        status: number;
        /** 管理员备注，可选 */
        adminRemark?: string;
        /** 拒绝原因，仅在状态为3时有效 */
        rejectMsg?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 提现记录ID */
            id: number;
            /** 用户ID */
            userId: number;
            /** 处理人ID，管理员或审核人员 */
            processorId: number | null;
            /** 提现状态：1已申请 2审核通过 3审核拒绝 4已打款 5打款失败 */
            status: number;
            /** 提现金额，单位：分 */
            amount: number;
            /** 提现渠道，如：支付宝、微信、银行卡等 */
            channel: string;
            /** 用户申请时的备注说明 */
            userRemark: string | null;
            /** 管理员审核时的备注说明 */
            adminRemark: string | null;
            /** 拒绝原因，仅在审核拒绝时填写 */
            rejectMsg: string | null;
            /** 申请时间 */
            createdAt: any;
            /** 审核时间 */
            reviewedAt: null;
            /** 打款时间 */
            paidAt: null;
          };
        },
        {
          /**
           * 非0状态码
           * @min 1
           * @default 1
           */
          code: number;
          /**
           * 错误提示信息
           * @default "提现记录状态不允许处理"
           */
          msg: string;
          data: null;
        }
      >({
        path: `/wallet/processWithdrawal`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 管理员调整用户钱包额度
     *
     * @tags 钱包账户
     * @name AdjustBalance
     * @request POST:/wallet/adjustBalance
     */
    adjustBalance: (
      data: {
        /**
         * 用户ID
         * @min 1
         */
        userId: number;
        /**
         * 钱包账户类型
         * @default "Balance"
         */
        type: "Balance" | "RewardPoint" | "AiPoint";
        /** 调整金额，正数增加，负数扣减，单位：分 */
        amount: number;
        /**
         * 调整说明，用户可见
         * @minLength 1
         * @default "管理员手动调整额度"
         */
        desc?: string;
        /** 管理员备注，内部使用 */
        remark?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /**
           * 状态码
           * @default 0
           */
          code: number;
          /**
           * 响应消息
           * @default "OK"
           */
          msg: string;
          data: {
            /** 变动记录ID */
            id: number;
            /** 用户ID */
            userId: number;
            /**
             * 钱包账户类型
             * @default "Balance"
             */
            type: "Balance" | "RewardPoint" | "AiPoint";
            /** 关联钱包ID */
            walletId: number;
            /** 变动金额，正数增加，负数减少，单位：分 */
            amount: number;
            /** 变动前余额，单位：分 */
            amountBefore: number;
            /** 变动后余额，单位：分 */
            amountAfter: number;
            /** 业务类型标识符，如：RECHARGE、WITHDRAWAL等 */
            bizType: string;
            /** 关联业务单号，如订单号、提现ID等 */
            refBizId: string | null;
            /** 变动说明，用户可见 */
            desc: string | null;
            /** 管理员备注，内部使用 */
            remark: string | null;
            /** 创建时间 */
            createdAt: any;
          };
        },
        {
          /**
           * 非0状态码
           * @min 1
           * @default 1
           */
          code: number;
          /**
           * 错误提示信息
           * @default "错误提示信息"
           */
          msg: string;
          data: null;
        }
      >({
        path: `/wallet/adjustBalance`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
