"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSubmissionHistory, getSubmissionHistoryUsers } from "@/services/AdminHistoryService";
import { SubmissionHistoryQuery, SubmissionHistoryResponse, SubmissionHistoryUsersResponse } from "@/types/history";
import { toast } from "react-hot-toast";

const DEFAULT_MONTHS = 12;

export default function AdminHistoryPage() {
  const [adminPin, setAdminPin] = useState("");
  const [pinSubmitted, setPinSubmitted] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const USER_PAGE_SIZE = 10;
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);

  const [filters, setFilters] = useState<SubmissionHistoryQuery>({
    months: DEFAULT_MONTHS,
    page: 1,
    pageSize: 20,
    sort: "desc",
  });

  const queryEnabled = pinSubmitted && !!adminPin;

  const { data: usersData, isFetching: isFetchingUsers, error: usersError, refetch: refetchUsers } = useQuery<SubmissionHistoryUsersResponse>({
    queryKey: ["admin-history-users", adminPin, userSearch, userPage],
    queryFn: async () => {
      return getSubmissionHistoryUsers(adminPin, {
        userName: userSearch || undefined,
        months: filters.months,
        page: userPage,
        pageSize: USER_PAGE_SIZE,
      });
    },
    enabled: queryEnabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data, isFetching, refetch, error } = useQuery<SubmissionHistoryResponse>({
    queryKey: ["admin-history", adminPin, filters, selectedUserId],
    queryFn: async () => {
      return getSubmissionHistory(adminPin, { ...filters, userId: selectedUserId });
    },
    enabled: queryEnabled && !!selectedUserId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const handleSubmitPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin) {
      toast.error("PIN admin wajib diisi");
      return;
    }
    setPinSubmitted(true);
    refetchUsers();
  };

  const updateFilterNumber = (key: keyof SubmissionHistoryQuery, value: string) => {
    const parsed = value ? Number(value) : undefined;
    setFilters((prev) => ({
      ...prev,
      [key]: Number.isNaN(parsed) ? undefined : parsed,
      page: 1, // reset page when filter changes
    }));
  };

  const totalPages = useMemo(() => data?.totalPages ?? 1, [data]);
  const totalUserPages = useMemo(() => usersData?.totalPages ?? 1, [usersData]);

  const fmtScore = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "—";
    const rounded = Math.round(val * 100) / 100;
    return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(2);
  };

  // Auto-select first user when list loaded and no selection
  useMemo(() => {
    if (!selectedUserId && usersData?.users?.length) {
      setSelectedUserId(usersData.users[0].id);
      setFilters((prev) => ({ ...prev, page: 1 })); // reset history page
    }
  }, [usersData, selectedUserId]);

  if (!pinSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow">
          <h1 className="text-2xl font-semibold mb-4 text-center">Masukkan PIN Admin</h1>
          <form onSubmit={handleSubmitPin} className="space-y-4">
            <Input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="PIN Admin"
              disabled={isFetching}
            />
            <Button type="submit" className="w-full" disabled={isFetching || !adminPin}>
              {isFetching ? "Memeriksa..." : "Lanjutkan"}
            </Button>
          </form>
          {error && <p className="mt-3 text-sm text-red-500">PIN salah atau tidak dapat mengakses data.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* User list & search */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Daftar User (12 bulan terakhir)</h2>
              <p className="text-sm text-gray-600">Pilih user untuk melihat history submission.</p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Cari nama user..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                  setSelectedUserId(undefined);
                }}
                disabled={isFetchingUsers}
              />
              <Button onClick={() => refetchUsers()} disabled={isFetchingUsers}>
                {isFetchingUsers ? "Memuat..." : "Cari"}
              </Button>
            </div>
          </div>

          {usersError && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Gagal memuat daftar user. Pastikan PIN benar dan coba ulang.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Total Submission</th>
                  <th className="px-3 py-2">Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {usersData?.users?.length ? (
                  usersData.users.map((u) => (
                    <tr
                      key={u.id}
                      className={`border-b last:border-0 cursor-pointer hover:bg-gray-50 ${
                        selectedUserId === u.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setFilters((prev) => ({ ...prev, page: 1 }));
                      }}
                    >
                      <td className="px-3 py-2">
                        <div className="font-medium">{u.name || "—"}</div>
                        <div className="text-xs text-gray-500">ID: {u.id}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-700">{u.email}</td>
                      <td className="px-3 py-2">{u.submissions}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {u.latestSubmittedAt
                          ? new Date(u.latestSubmittedAt).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-4 text-center text-gray-500" colSpan={4}>
                      {isFetchingUsers ? "Memuat data..." : "Tidak ada user untuk filter ini."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Halaman {userPage} dari {totalUserPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setUserPage(Math.max(1, userPage - 1))}
                disabled={userPage <= 1 || isFetchingUsers}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                onClick={() => setUserPage(Math.min(totalUserPages, userPage + 1))}
                disabled={userPage >= totalUserPages || isFetchingUsers}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </div>

        {/* History for selected user */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">History Submission (12 bulan)</h3>
              <p className="text-sm text-gray-600">
                {selectedUserId ? `User ID: ${selectedUserId}` : "Pilih user untuk melihat history."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                className="border rounded px-3 py-2 text-sm"
                value={filters.sort ?? "desc"}
                onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value as "asc" | "desc", page: 1 }))}
              >
                <option value="desc">Terbaru</option>
                <option value="asc">Terlama</option>
              </select>
              <Input
                type="number"
                className="w-24"
                value={filters.pageSize ?? 20}
                min={1}
                max={100}
                onChange={(e) => updateFilterNumber("pageSize", e.target.value)}
              />
              <Button onClick={() => refetch()} disabled={isFetching || !selectedUserId}>
                {isFetching ? "Memuat..." : "Refresh"}
              </Button>
            </div>
          </div>
          {error && (
            <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Gagal memuat data history. Pastikan PIN benar dan coba ulang.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-3 py-2">Tanggal</th>
                  <th className="px-3 py-2">Asset</th>
                  <th className="px-3 py-2">Threat</th>
                  <th className="px-3 py-2">Skor</th>
                  <th className="px-3 py-2">Kategori</th>
                  <th className="px-3 py-2">Pemahaman</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.length ? (
                  data.items.map((item) => (
                    <tr key={item.submissionId} className="border-b last:border-0">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(item.submittedAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium">#{item.asset.id}</div>
                        <div className="text-xs text-gray-500">{item.asset.name}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium">#{item.threat.id}</div>
                        <div className="text-xs text-gray-500">{item.threat.name}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{fmtScore(item.score?.total)}</div>
                        <div className="text-xs text-gray-500 space-x-2">
                          <span>Peluang: {fmtScore(item.score?.peluang)}</span>
                          <span>Impact: {fmtScore(item.score?.impact)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 uppercase">{item.score?.category ?? "—"}</td>
                      <td className="px-3 py-2">
                        {item.understand === "MENGERTI" ? "Mengerti" : "Tidak Mengerti"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-4 text-center text-gray-500" colSpan={6}>
                      {isFetching ? "Memuat data..." : selectedUserId ? "Belum ada data untuk user ini." : "Pilih user untuk melihat data."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Menampilkan halaman {filters.page ?? 1} dari {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page ?? 1) - 1) }))
                }
                disabled={(filters.page ?? 1) <= 1 || isFetching || !selectedUserId}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: Math.min(totalPages, (prev.page ?? 1) + 1) }))
                }
                disabled={(filters.page ?? 1) >= totalPages || isFetching || !selectedUserId}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

