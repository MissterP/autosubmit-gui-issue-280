import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { CLIMATE_MODELS_API_SOURCE } from '../consts'

export const climateModelsApi = createApi({
    reducerPath: 'climateModelsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: CLIMATE_MODELS_API_SOURCE + "/v1",
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("token")
            if (token) {
                headers.set('Authorization', token)
            }
            return headers
        },
    }),
    keepUnusedDataFor: 5,
    endpoints: (builder) => ({
        getPopularModelsAggregated: builder.query({
            query: ({ limit = 10 }) => ({
                url: `metrics/popular_models/aggregated`,
                params: { limit }
            })
        }),
        getPopularModelsHistorical: builder.query({
            query: ({ start_date, end_date }) => ({
                url: `metrics/popular_models/historical`,
                params: { start_date, end_date }
            })
        }),
        getFootprintModelsAggregated: builder.query({
            query: ({ limit = 10 }) => ({
                url: `metrics/footprint_models/aggregated`,
                params: { limit }
            })
        }),
        getFootprintModelsHistorical: builder.query({
            query: ({ start_date, end_date }) => ({
                url: `metrics/footprint_models/historical`,
                params: { start_date, end_date }
            })
        }),
        getSypdParallelizationModels: builder.query({
            query: () => ({
                url: `metrics/sypd_parallelization_models`,
                method: "GET"
            })
        }),
        getChsyParallelizationModels: builder.query({
            query: () => ({
                url: `metrics/chsy_parallelization_models`,
                method: "GET"
            })
        }),
        getJpsyParallelizationModels: builder.query({
            query: () => ({
                url: `metrics/jpsy_parallelization_models`,
                method: "GET"
            })
        }),
    }),
})

export const {
    useGetPopularModelsAggregatedQuery,
    useGetPopularModelsHistoricalQuery,
    useGetFootprintModelsAggregatedQuery,
    useGetFootprintModelsHistoricalQuery,
    useGetSypdParallelizationModelsQuery,
    useGetChsyParallelizationModelsQuery,
    useGetJpsyParallelizationModelsQuery
} = climateModelsApi
