import { pinApi } from "./AnalyticService";
import { SubmissionHistoryQuery, SubmissionHistoryResponse, SubmissionHistoryUsersResponse } from "@/types/history";

export const getSubmissionHistory = async (
  adminPin: string,
  query: SubmissionHistoryQuery
): Promise<SubmissionHistoryResponse> => {
  if (!adminPin) {
    throw new Error("PIN admin belum diatur");
  }

  const res = await pinApi.get("form/admin/history", {
    headers: {
      "x-admin-pin": adminPin,
    },
    params: {
      userId: query.userId,
      userName: query.userName,
      assetId: query.assetId,
      threatId: query.threatId,
      months: query.months,
      page: query.page,
      pageSize: query.pageSize,
      sort: query.sort,
    },
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Gagal mengambil history submission");
  }

  return res.data.data as SubmissionHistoryResponse;
};

export const getSubmissionHistoryUsers = async (
  adminPin: string,
  query: SubmissionHistoryQuery
): Promise<SubmissionHistoryUsersResponse> => {
  if (!adminPin) {
    throw new Error("PIN admin belum diatur");
  }

  const res = await pinApi.get("form/admin/history", {
    headers: { "x-admin-pin": adminPin },
    params: {
      userName: query.userName,
      months: query.months,
      page: query.page,
      pageSize: query.pageSize,
      listUsers: true,
    },
  });

  if (!res.data?.success) {
    throw new Error(res.data?.message || "Gagal mengambil daftar user history");
  }

  return res.data.data as SubmissionHistoryUsersResponse;
};

