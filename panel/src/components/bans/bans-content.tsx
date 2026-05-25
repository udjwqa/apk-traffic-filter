"use client";

import { useBanLists } from "@/hooks/use-ban-lists";
import { Skeleton } from "@/components/ui/skeleton";
import { BanTable } from "./ban-table";
import { WhitelistTable } from "./whitelist-table";

export function BansContent() {
  const {
    banList,
    whitelist,
    banTotal,
    whitelistTotal,
    isLoading,
    searchBan,
    setSearchBan,
    searchWhitelist,
    setSearchWhitelist,
    unban,
    addBan,
    removeException,
    addException,
  } = useBanLists();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-56 bg-white/[0.05]" />
        <Skeleton className="h-80 w-full rounded-2xl bg-white/[0.03]" />
        <Skeleton className="h-60 w-full rounded-2xl bg-white/[0.03]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Репозиторий банов
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Управление чёрным и белым списками
        </p>
      </div>

      <BanTable
        entries={banList}
        total={banTotal}
        search={searchBan}
        onSearchChange={setSearchBan}
        onUnban={unban}
        onAddBan={addBan}
      />

      <WhitelistTable
        entries={whitelist}
        total={whitelistTotal}
        search={searchWhitelist}
        onSearchChange={setSearchWhitelist}
        onRemove={removeException}
        onAdd={addException}
      />
    </div>
  );
}
