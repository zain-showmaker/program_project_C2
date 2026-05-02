import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AuthUserEnvelope, BeginBrowserLoginParams, BulkIds, BulkOperationResult, CategoryRevenuePoint, Component, CreateComponent, CreateSale, DailyRevenuePoint, DashboardSummary, ErrorEnvelope, GetBestSellersParams, GetLowStockParams, GetSlowMoversParams, HandleBrowserLoginCallbackParams, HealthStatus, ListComponentsParams, LogoutSuccess, MobileTokenExchangeRequest, MobileTokenExchangeSuccess, ProductPerformance, ReorderItem, Sale, Suggestion, UpdateComponent } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Get the currently authenticated user
 */
export declare const getGetCurrentAuthUserUrl: () => string;
export declare const getCurrentAuthUser: (options?: RequestInit) => Promise<AuthUserEnvelope>;
export declare const getGetCurrentAuthUserQueryKey: () => readonly ["/api/auth/user"];
export declare const getGetCurrentAuthUserQueryOptions: <TData = Awaited<ReturnType<typeof getCurrentAuthUser>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentAuthUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCurrentAuthUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCurrentAuthUserQueryResult = NonNullable<Awaited<ReturnType<typeof getCurrentAuthUser>>>;
export type GetCurrentAuthUserQueryError = ErrorType<unknown>;
/**
 * @summary Get the currently authenticated user
 */
export declare function useGetCurrentAuthUser<TData = Awaited<ReturnType<typeof getCurrentAuthUser>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentAuthUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Start the browser OIDC login flow
 */
export declare const getBeginBrowserLoginUrl: (params?: BeginBrowserLoginParams) => string;
export declare const beginBrowserLogin: (params?: BeginBrowserLoginParams, options?: RequestInit) => Promise<unknown>;
export declare const getBeginBrowserLoginQueryKey: (params?: BeginBrowserLoginParams) => readonly ["/api/login", ...BeginBrowserLoginParams[]];
export declare const getBeginBrowserLoginQueryOptions: <TData = Awaited<ReturnType<typeof beginBrowserLogin>>, TError = ErrorType<void>>(params?: BeginBrowserLoginParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof beginBrowserLogin>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof beginBrowserLogin>>, TError, TData> & {
    queryKey: QueryKey;
};
export type BeginBrowserLoginQueryResult = NonNullable<Awaited<ReturnType<typeof beginBrowserLogin>>>;
export type BeginBrowserLoginQueryError = ErrorType<void>;
/**
 * @summary Start the browser OIDC login flow
 */
export declare function useBeginBrowserLogin<TData = Awaited<ReturnType<typeof beginBrowserLogin>>, TError = ErrorType<void>>(params?: BeginBrowserLoginParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof beginBrowserLogin>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Complete the browser OIDC login flow
 */
export declare const getHandleBrowserLoginCallbackUrl: (params?: HandleBrowserLoginCallbackParams) => string;
export declare const handleBrowserLoginCallback: (params?: HandleBrowserLoginCallbackParams, options?: RequestInit) => Promise<unknown>;
export declare const getHandleBrowserLoginCallbackQueryKey: (params?: HandleBrowserLoginCallbackParams) => readonly ["/api/callback", ...HandleBrowserLoginCallbackParams[]];
export declare const getHandleBrowserLoginCallbackQueryOptions: <TData = Awaited<ReturnType<typeof handleBrowserLoginCallback>>, TError = ErrorType<void>>(params?: HandleBrowserLoginCallbackParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof handleBrowserLoginCallback>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof handleBrowserLoginCallback>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HandleBrowserLoginCallbackQueryResult = NonNullable<Awaited<ReturnType<typeof handleBrowserLoginCallback>>>;
export type HandleBrowserLoginCallbackQueryError = ErrorType<void>;
/**
 * @summary Complete the browser OIDC login flow
 */
export declare function useHandleBrowserLoginCallback<TData = Awaited<ReturnType<typeof handleBrowserLoginCallback>>, TError = ErrorType<void>>(params?: HandleBrowserLoginCallbackParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof handleBrowserLoginCallback>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Clear the session and begin OIDC logout
 */
export declare const getLogoutBrowserSessionUrl: () => string;
export declare const logoutBrowserSession: (options?: RequestInit) => Promise<unknown>;
export declare const getLogoutBrowserSessionQueryKey: () => readonly ["/api/logout"];
export declare const getLogoutBrowserSessionQueryOptions: <TData = Awaited<ReturnType<typeof logoutBrowserSession>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof logoutBrowserSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof logoutBrowserSession>>, TError, TData> & {
    queryKey: QueryKey;
};
export type LogoutBrowserSessionQueryResult = NonNullable<Awaited<ReturnType<typeof logoutBrowserSession>>>;
export type LogoutBrowserSessionQueryError = ErrorType<void>;
/**
 * @summary Clear the session and begin OIDC logout
 */
export declare function useLogoutBrowserSession<TData = Awaited<ReturnType<typeof logoutBrowserSession>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof logoutBrowserSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Exchange a mobile OIDC code for a session token
 */
export declare const getExchangeMobileAuthorizationCodeUrl: () => string;
export declare const exchangeMobileAuthorizationCode: (mobileTokenExchangeRequest: MobileTokenExchangeRequest, options?: RequestInit) => Promise<MobileTokenExchangeSuccess>;
export declare const getExchangeMobileAuthorizationCodeMutationOptions: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>, TError, {
        data: BodyType<MobileTokenExchangeRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>, TError, {
    data: BodyType<MobileTokenExchangeRequest>;
}, TContext>;
export type ExchangeMobileAuthorizationCodeMutationResult = NonNullable<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>>;
export type ExchangeMobileAuthorizationCodeMutationBody = BodyType<MobileTokenExchangeRequest>;
export type ExchangeMobileAuthorizationCodeMutationError = ErrorType<ErrorEnvelope>;
/**
 * @summary Exchange a mobile OIDC code for a session token
 */
export declare const useExchangeMobileAuthorizationCode: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>, TError, {
        data: BodyType<MobileTokenExchangeRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>, TError, {
    data: BodyType<MobileTokenExchangeRequest>;
}, TContext>;
/**
 * @summary Delete a mobile session token
 */
export declare const getLogoutMobileSessionUrl: () => string;
export declare const logoutMobileSession: (options?: RequestInit) => Promise<LogoutSuccess>;
export declare const getLogoutMobileSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutMobileSession>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logoutMobileSession>>, TError, void, TContext>;
export type LogoutMobileSessionMutationResult = NonNullable<Awaited<ReturnType<typeof logoutMobileSession>>>;
export type LogoutMobileSessionMutationError = ErrorType<unknown>;
/**
 * @summary Delete a mobile session token
 */
export declare const useLogoutMobileSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutMobileSession>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logoutMobileSession>>, TError, void, TContext>;
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List inventory components
 */
export declare const getListComponentsUrl: (params?: ListComponentsParams) => string;
export declare const listComponents: (params?: ListComponentsParams, options?: RequestInit) => Promise<Component[]>;
export declare const getListComponentsQueryKey: (params?: ListComponentsParams) => readonly ["/api/components", ...ListComponentsParams[]];
export declare const getListComponentsQueryOptions: <TData = Awaited<ReturnType<typeof listComponents>>, TError = ErrorType<unknown>>(params?: ListComponentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listComponents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listComponents>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListComponentsQueryResult = NonNullable<Awaited<ReturnType<typeof listComponents>>>;
export type ListComponentsQueryError = ErrorType<unknown>;
/**
 * @summary List inventory components
 */
export declare function useListComponents<TData = Awaited<ReturnType<typeof listComponents>>, TError = ErrorType<unknown>>(params?: ListComponentsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listComponents>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Add new component (auto-assigns ID)
 */
export declare const getCreateComponentUrl: () => string;
export declare const createComponent: (createComponent: CreateComponent, options?: RequestInit) => Promise<Component>;
export declare const getCreateComponentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createComponent>>, TError, {
        data: BodyType<CreateComponent>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createComponent>>, TError, {
    data: BodyType<CreateComponent>;
}, TContext>;
export type CreateComponentMutationResult = NonNullable<Awaited<ReturnType<typeof createComponent>>>;
export type CreateComponentMutationBody = BodyType<CreateComponent>;
export type CreateComponentMutationError = ErrorType<unknown>;
/**
 * @summary Add new component (auto-assigns ID)
 */
export declare const useCreateComponent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createComponent>>, TError, {
        data: BodyType<CreateComponent>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createComponent>>, TError, {
    data: BodyType<CreateComponent>;
}, TContext>;
/**
 * @summary Update price and/or stock for a component
 */
export declare const getUpdateComponentUrl: (id: number) => string;
export declare const updateComponent: (id: number, updateComponent: UpdateComponent, options?: RequestInit) => Promise<Component>;
export declare const getUpdateComponentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateComponent>>, TError, {
        id: number;
        data: BodyType<UpdateComponent>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateComponent>>, TError, {
    id: number;
    data: BodyType<UpdateComponent>;
}, TContext>;
export type UpdateComponentMutationResult = NonNullable<Awaited<ReturnType<typeof updateComponent>>>;
export type UpdateComponentMutationBody = BodyType<UpdateComponent>;
export type UpdateComponentMutationError = ErrorType<unknown>;
/**
 * @summary Update price and/or stock for a component
 */
export declare const useUpdateComponent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateComponent>>, TError, {
        id: number;
        data: BodyType<UpdateComponent>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateComponent>>, TError, {
    id: number;
    data: BodyType<UpdateComponent>;
}, TContext>;
/**
 * @summary Remove a component
 */
export declare const getDeleteComponentUrl: (id: number) => string;
export declare const deleteComponent: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteComponentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteComponent>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteComponent>>, TError, {
    id: number;
}, TContext>;
export type DeleteComponentMutationResult = NonNullable<Awaited<ReturnType<typeof deleteComponent>>>;
export type DeleteComponentMutationError = ErrorType<unknown>;
/**
 * @summary Remove a component
 */
export declare const useDeleteComponent: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteComponent>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteComponent>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Delete multiple components by id
 */
export declare const getBulkDeleteComponentsUrl: () => string;
export declare const bulkDeleteComponents: (bulkIds: BulkIds, options?: RequestInit) => Promise<BulkOperationResult>;
export declare const getBulkDeleteComponentsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof bulkDeleteComponents>>, TError, {
        data: BodyType<BulkIds>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof bulkDeleteComponents>>, TError, {
    data: BodyType<BulkIds>;
}, TContext>;
export type BulkDeleteComponentsMutationResult = NonNullable<Awaited<ReturnType<typeof bulkDeleteComponents>>>;
export type BulkDeleteComponentsMutationBody = BodyType<BulkIds>;
export type BulkDeleteComponentsMutationError = ErrorType<unknown>;
/**
 * @summary Delete multiple components by id
 */
export declare const useBulkDeleteComponents: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof bulkDeleteComponents>>, TError, {
        data: BodyType<BulkIds>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof bulkDeleteComponents>>, TError, {
    data: BodyType<BulkIds>;
}, TContext>;
/**
 * @summary Sales history (newest first)
 */
export declare const getListSalesUrl: () => string;
export declare const listSales: (options?: RequestInit) => Promise<Sale[]>;
export declare const getListSalesQueryKey: () => readonly ["/api/sales"];
export declare const getListSalesQueryOptions: <TData = Awaited<ReturnType<typeof listSales>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSales>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listSales>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListSalesQueryResult = NonNullable<Awaited<ReturnType<typeof listSales>>>;
export type ListSalesQueryError = ErrorType<unknown>;
/**
 * @summary Sales history (newest first)
 */
export declare function useListSales<TData = Awaited<ReturnType<typeof listSales>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listSales>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Record a sale (decrements stock)
 */
export declare const getRecordSaleUrl: () => string;
export declare const recordSale: (createSale: CreateSale, options?: RequestInit) => Promise<Sale>;
export declare const getRecordSaleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordSale>>, TError, {
        data: BodyType<CreateSale>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof recordSale>>, TError, {
    data: BodyType<CreateSale>;
}, TContext>;
export type RecordSaleMutationResult = NonNullable<Awaited<ReturnType<typeof recordSale>>>;
export type RecordSaleMutationBody = BodyType<CreateSale>;
export type RecordSaleMutationError = ErrorType<unknown>;
/**
 * @summary Record a sale (decrements stock)
 */
export declare const useRecordSale: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordSale>>, TError, {
        data: BodyType<CreateSale>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof recordSale>>, TError, {
    data: BodyType<CreateSale>;
}, TContext>;
/**
 * @summary Mark a sale returned and restock the component
 */
export declare const getReturnSaleUrl: (id: number) => string;
export declare const returnSale: (id: number, options?: RequestInit) => Promise<Sale>;
export declare const getReturnSaleMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof returnSale>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof returnSale>>, TError, {
    id: number;
}, TContext>;
export type ReturnSaleMutationResult = NonNullable<Awaited<ReturnType<typeof returnSale>>>;
export type ReturnSaleMutationError = ErrorType<unknown>;
/**
 * @summary Mark a sale returned and restock the component
 */
export declare const useReturnSale: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof returnSale>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof returnSale>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Available smart categories
 */
export declare const getListCategoriesUrl: () => string;
export declare const listCategories: (options?: RequestInit) => Promise<string[]>;
export declare const getListCategoriesQueryKey: () => readonly ["/api/suggestions/categories"];
export declare const getListCategoriesQueryOptions: <TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCategoriesQueryResult = NonNullable<Awaited<ReturnType<typeof listCategories>>>;
export type ListCategoriesQueryError = ErrorType<unknown>;
/**
 * @summary Available smart categories
 */
export declare function useListCategories<TData = Awaited<ReturnType<typeof listCategories>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listCategories>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Smart model suggestions with approximate market prices
 */
export declare const getGetCategorySuggestionsUrl: (category: string) => string;
export declare const getCategorySuggestions: (category: string, options?: RequestInit) => Promise<Suggestion[]>;
export declare const getGetCategorySuggestionsQueryKey: (category: string) => readonly [`/api/suggestions/${string}`];
export declare const getGetCategorySuggestionsQueryOptions: <TData = Awaited<ReturnType<typeof getCategorySuggestions>>, TError = ErrorType<unknown>>(category: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategorySuggestions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCategorySuggestions>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCategorySuggestionsQueryResult = NonNullable<Awaited<ReturnType<typeof getCategorySuggestions>>>;
export type GetCategorySuggestionsQueryError = ErrorType<unknown>;
/**
 * @summary Smart model suggestions with approximate market prices
 */
export declare function useGetCategorySuggestions<TData = Awaited<ReturnType<typeof getCategorySuggestions>>, TError = ErrorType<unknown>>(category: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategorySuggestions>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Dashboard summary (totals, low stock, today's revenue, profit)
 */
export declare const getGetDashboardSummaryUrl: () => string;
export declare const getDashboardSummary: (options?: RequestInit) => Promise<DashboardSummary>;
export declare const getGetDashboardSummaryQueryKey: () => readonly ["/api/analytics/summary"];
export declare const getGetDashboardSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDashboardSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getDashboardSummary>>>;
export type GetDashboardSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Dashboard summary (totals, low stock, today's revenue, profit)
 */
export declare function useGetDashboardSummary<TData = Awaited<ReturnType<typeof getDashboardSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDashboardSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Daily revenue + profit breakdown (last 30 days)
 */
export declare const getGetDailyRevenueUrl: () => string;
export declare const getDailyRevenue: (options?: RequestInit) => Promise<DailyRevenuePoint[]>;
export declare const getGetDailyRevenueQueryKey: () => readonly ["/api/analytics/daily-revenue"];
export declare const getGetDailyRevenueQueryOptions: <TData = Awaited<ReturnType<typeof getDailyRevenue>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDailyRevenue>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDailyRevenue>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDailyRevenueQueryResult = NonNullable<Awaited<ReturnType<typeof getDailyRevenue>>>;
export type GetDailyRevenueQueryError = ErrorType<unknown>;
/**
 * @summary Daily revenue + profit breakdown (last 30 days)
 */
export declare function useGetDailyRevenue<TData = Awaited<ReturnType<typeof getDailyRevenue>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDailyRevenue>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Revenue & profit grouped by category
 */
export declare const getGetCategoryRevenueUrl: () => string;
export declare const getCategoryRevenue: (options?: RequestInit) => Promise<CategoryRevenuePoint[]>;
export declare const getGetCategoryRevenueQueryKey: () => readonly ["/api/analytics/category-revenue"];
export declare const getGetCategoryRevenueQueryOptions: <TData = Awaited<ReturnType<typeof getCategoryRevenue>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategoryRevenue>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCategoryRevenue>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCategoryRevenueQueryResult = NonNullable<Awaited<ReturnType<typeof getCategoryRevenue>>>;
export type GetCategoryRevenueQueryError = ErrorType<unknown>;
/**
 * @summary Revenue & profit grouped by category
 */
export declare function useGetCategoryRevenue<TData = Awaited<ReturnType<typeof getCategoryRevenue>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCategoryRevenue>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Components with stock below threshold
 */
export declare const getGetLowStockUrl: (params?: GetLowStockParams) => string;
export declare const getLowStock: (params?: GetLowStockParams, options?: RequestInit) => Promise<Component[]>;
export declare const getGetLowStockQueryKey: (params?: GetLowStockParams) => readonly ["/api/analytics/low-stock", ...GetLowStockParams[]];
export declare const getGetLowStockQueryOptions: <TData = Awaited<ReturnType<typeof getLowStock>>, TError = ErrorType<unknown>>(params?: GetLowStockParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLowStock>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLowStock>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLowStockQueryResult = NonNullable<Awaited<ReturnType<typeof getLowStock>>>;
export type GetLowStockQueryError = ErrorType<unknown>;
/**
 * @summary Components with stock below threshold
 */
export declare function useGetLowStock<TData = Awaited<ReturnType<typeof getLowStock>>, TError = ErrorType<unknown>>(params?: GetLowStockParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLowStock>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Best-selling components by units sold
 */
export declare const getGetBestSellersUrl: (params?: GetBestSellersParams) => string;
export declare const getBestSellers: (params?: GetBestSellersParams, options?: RequestInit) => Promise<ProductPerformance[]>;
export declare const getGetBestSellersQueryKey: (params?: GetBestSellersParams) => readonly ["/api/analytics/best-sellers", ...GetBestSellersParams[]];
export declare const getGetBestSellersQueryOptions: <TData = Awaited<ReturnType<typeof getBestSellers>>, TError = ErrorType<unknown>>(params?: GetBestSellersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBestSellers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBestSellers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBestSellersQueryResult = NonNullable<Awaited<ReturnType<typeof getBestSellers>>>;
export type GetBestSellersQueryError = ErrorType<unknown>;
/**
 * @summary Best-selling components by units sold
 */
export declare function useGetBestSellers<TData = Awaited<ReturnType<typeof getBestSellers>>, TError = ErrorType<unknown>>(params?: GetBestSellersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBestSellers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Items with low/no recent sales
 */
export declare const getGetSlowMoversUrl: (params?: GetSlowMoversParams) => string;
export declare const getSlowMovers: (params?: GetSlowMoversParams, options?: RequestInit) => Promise<ProductPerformance[]>;
export declare const getGetSlowMoversQueryKey: (params?: GetSlowMoversParams) => readonly ["/api/analytics/slow-movers", ...GetSlowMoversParams[]];
export declare const getGetSlowMoversQueryOptions: <TData = Awaited<ReturnType<typeof getSlowMovers>>, TError = ErrorType<unknown>>(params?: GetSlowMoversParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSlowMovers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSlowMovers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSlowMoversQueryResult = NonNullable<Awaited<ReturnType<typeof getSlowMovers>>>;
export type GetSlowMoversQueryError = ErrorType<unknown>;
/**
 * @summary Items with low/no recent sales
 */
export declare function useGetSlowMovers<TData = Awaited<ReturnType<typeof getSlowMovers>>, TError = ErrorType<unknown>>(params?: GetSlowMoversParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSlowMovers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Suggested reorder list ranked by stockout risk
 */
export declare const getGetReorderListUrl: () => string;
export declare const getReorderList: (options?: RequestInit) => Promise<ReorderItem[]>;
export declare const getGetReorderListQueryKey: () => readonly ["/api/analytics/reorder"];
export declare const getGetReorderListQueryOptions: <TData = Awaited<ReturnType<typeof getReorderList>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReorderList>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getReorderList>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetReorderListQueryResult = NonNullable<Awaited<ReturnType<typeof getReorderList>>>;
export type GetReorderListQueryError = ErrorType<unknown>;
/**
 * @summary Suggested reorder list ranked by stockout risk
 */
export declare function useGetReorderList<TData = Awaited<ReturnType<typeof getReorderList>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReorderList>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map