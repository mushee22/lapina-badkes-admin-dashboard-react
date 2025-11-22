import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useTransactionsPaginatedQuery } from "../../../hooks/queries/transactions";
import type { TransactionListParams } from "../../../services/transactions";
import type { Transaction } from "../../../services/transactions";
import type { PaginationMeta } from "../../../types/pagination";

export function useTransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params
  const [page, setPage] = useState<number>(Number(searchParams.get("page")) || 1);
  const [perPage, setPerPage] = useState<number>(Number(searchParams.get("per_page")) || 15);
  const [type, setType] = useState<string | undefined>(searchParams.get("type") || undefined);
  const [paymentMode, setPaymentMode] = useState<string | undefined>(searchParams.get("payment_mode") || undefined);
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>(searchParams.get("payment_status") || undefined);
  const [collectedBy, setCollectedBy] = useState<number | undefined>(
    searchParams.get("collected_by") ? Number(searchParams.get("collected_by")) : undefined
  );
  const [addedBy, setAddedBy] = useState<number | undefined>(
    searchParams.get("added_by") ? Number(searchParams.get("added_by")) : undefined
  );
  const [dateFrom, setDateFrom] = useState<string | undefined>(searchParams.get("date_from") || undefined);
  const [dateTo, setDateTo] = useState<string | undefined>(searchParams.get("date_to") || undefined);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (perPage !== 15) params.set("per_page", String(perPage));
    if (type) params.set("type", type);
    if (paymentMode) params.set("payment_mode", paymentMode);
    if (paymentStatus) params.set("payment_status", paymentStatus);
    if (collectedBy !== undefined) params.set("collected_by", String(collectedBy));
    if (addedBy !== undefined) params.set("added_by", String(addedBy));
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, type, paymentMode, paymentStatus, collectedBy, addedBy, dateFrom, dateTo]);

  // Reset to page 1 when filters change (except page itself)
  useEffect(() => {
    setPage(1);
  }, [type, paymentMode, paymentStatus, collectedBy, addedBy, dateFrom, dateTo]);

  const params: TransactionListParams = {
    page,
    per_page: perPage,
    type,
    payment_mode: paymentMode,
    payment_status: paymentStatus,
    collected_by: collectedBy,
    added_by: addedBy,
    date_from: dateFrom,
    date_to: dateTo,
  };

  const { data: transactionsRes, isLoading } = useTransactionsPaginatedQuery(params);
  
  const transactions: Transaction[] = transactionsRes?.data ?? [];
  const meta: PaginationMeta | undefined = transactionsRes?.meta;

  const clearFilters = () => {
    setType(undefined);
    setPaymentMode(undefined);
    setPaymentStatus(undefined);
    setCollectedBy(undefined);
    setAddedBy(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
  };

  const hasActiveFilters = !!(
    type ||
    paymentMode ||
    paymentStatus ||
    collectedBy !== undefined ||
    addedBy !== undefined ||
    dateFrom ||
    dateTo
  );

  return {
    transactions,
    isLoading,
    page,
    perPage,
    setPage,
    setPerPage,
    meta,
    type,
    setType,
    paymentMode,
    setPaymentMode,
    paymentStatus,
    setPaymentStatus,
    collectedBy,
    setCollectedBy,
    addedBy,
    setAddedBy,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clearFilters,
    hasActiveFilters,
  };
}

