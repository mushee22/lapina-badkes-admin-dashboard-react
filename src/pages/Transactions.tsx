import { useTransactionsPage } from "./Transactions/hooks/useTransactionsPage";
import { TransactionsView } from "./Transactions/components/TransactionsView";

export default function Transactions() {
  const {
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
  } = useTransactionsPage();

  return (
    <TransactionsView
      transactions={transactions}
      isLoading={isLoading}
      page={page}
      perPage={perPage}
      setPage={setPage}
      setPerPage={setPerPage}
      meta={meta}
      type={type}
      setType={setType}
      paymentMode={paymentMode}
      setPaymentMode={setPaymentMode}
      paymentStatus={paymentStatus}
      setPaymentStatus={setPaymentStatus}
      collectedBy={collectedBy}
      setCollectedBy={setCollectedBy}
      addedBy={addedBy}
      setAddedBy={setAddedBy}
      dateFrom={dateFrom}
      setDateFrom={setDateFrom}
      dateTo={dateTo}
      setDateTo={setDateTo}
      clearFilters={clearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
}