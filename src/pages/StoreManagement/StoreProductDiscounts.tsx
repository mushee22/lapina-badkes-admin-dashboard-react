import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { useStoreQuery, useSetStoreProductDiscountsMutation } from "../../hooks/queries/stores";
import type { StoreProduct } from "../../types/store";
import { ChevronLeftIcon } from "../../icons";

interface DiscountRow {
    storeProduct: StoreProduct;
    discountedPrice: string; // admin enters the final discounted price
}

export default function StoreProductDiscounts() {
    const { id } = useParams<{ id: string }>();
    const storeId = Number(id);
    const navigate = useNavigate();

    const { data: store, isLoading } = useStoreQuery(storeId || null);

    const [rows, setRows] = useState<DiscountRow[]>([]);

    // Initialise rows from store_products when store data loads
    useEffect(() => {
        if (store?.store_products && store.store_products.length > 0) {
            setRows(
                store.store_products.map((sp) => ({
                    storeProduct: sp,
                    // Pre-fill with already-set selling price (current discounted price)
                    discountedPrice: sp.selling_price.toFixed(2),
                }))
            );
        }
    }, [store?.store_products?.length]);

    const setDiscountsMutation = useSetStoreProductDiscountsMutation();

    const handlePriceChange = (productId: number, value: string) => {
        setRows((prev) =>
            prev.map((r) =>
                r.storeProduct.product_id === productId ? { ...r, discountedPrice: value } : r
            )
        );
    };

    const getBasePrice = (sp: StoreProduct): number => sp.price;

    // Discount amount = base price − discounted price entered by admin
    const getDiscountAmount = (row: DiscountRow): number | null => {
        const base = getBasePrice(row.storeProduct);
        const discounted = parseFloat(row.discountedPrice);
        if (isNaN(discounted) || row.discountedPrice === "") return null;
        return Math.max(0, base - discounted);
    };

    const handleSave = () => {
        if (!storeId) return;
        const items = rows.map((r) => ({
            product_id: r.storeProduct.product_id,
            discount_amount: getDiscountAmount(r) ?? 0,
        }));
        setDiscountsMutation.mutate({ storeId, items });
    };

    return (
        <>
            <PageMeta
                title={`Product Discounts — ${store?.name ?? "Store"} | Lapina Bakes Admin`}
                description="Set per-product discounted prices for this store"
            />
            <PageBreadcrumb
                pageTitle={`Product Discounts — ${store?.name ?? `Store #${storeId}`}`}
            />

            <div className="space-y-6">
                <ComponentCard title="">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enter the{" "}
                            <span className="font-medium text-gray-800 dark:text-white/90">discounted price</span>{" "}
                            for each product. The discount amount (savings) is calculated automatically.
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/stores/${id}`)}
                                startIcon={<ChevronLeftIcon className="w-4 h-4" />}
                            >
                                Back to Outlet
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={setDiscountsMutation.isPending || isLoading}
                            >
                                {setDiscountsMutation.isPending ? "Saving..." : "Save All"}
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                    <TableRow>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Product
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Base Price (₹)
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Discounted Price (₹)
                                        </TableCell>
                                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                            Discount Amount (₹)
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Loading products...
                                            </TableCell>
                                            <TableCell>{null}</TableCell>
                                            <TableCell>{null}</TableCell>
                                            <TableCell>{null}</TableCell>
                                        </TableRow>
                                    ) : rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                                                No products found for this outlet
                                            </TableCell>
                                            <TableCell>{null}</TableCell>
                                            <TableCell>{null}</TableCell>
                                            <TableCell>{null}</TableCell>
                                        </TableRow>
                                    ) : (
                                        rows.map((row) => {
                                            const basePrice = getBasePrice(row.storeProduct);
                                            const discountAmount = getDiscountAmount(row);

                                            return (
                                                <TableRow key={row.storeProduct.product_id}>
                                                    {/* Product name */}
                                                    <TableCell className="px-5 py-4 text-start">
                                                        <div>
                                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                                {row.storeProduct.product_name}
                                                            </span>
                                                            <span className="text-xs text-gray-400">ID: {row.storeProduct.product_id}</span>
                                                        </div>
                                                    </TableCell>

                                                    {/* Base price — read only */}
                                                    <TableCell className="px-5 py-4 text-start">
                                                        <span className="text-gray-700 text-theme-sm dark:text-gray-300">
                                                            ₹{basePrice.toFixed(2)}
                                                        </span>
                                                    </TableCell>

                                                    {/* Discounted price — admin enters this */}
                                                    <TableCell className="px-5 py-4 text-start">
                                                        <div className="relative w-36">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">₹</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={basePrice}
                                                                step="0.01"
                                                                placeholder={basePrice.toFixed(2)}
                                                                value={row.discountedPrice}
                                                                onChange={(e) => handlePriceChange(row.storeProduct.product_id, e.target.value)}
                                                                className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:border-white/[0.10] dark:bg-white/[0.04] dark:text-white/90"
                                                            />
                                                        </div>
                                                    </TableCell>

                                                    {/* Calculated discount amount — read only */}
                                                    <TableCell className="px-5 py-4 text-start">
                                                        {discountAmount !== null ? (
                                                            <div className="flex flex-col">
                                                                <span className={`font-semibold text-theme-sm ${discountAmount > 0 ? "text-success-600 dark:text-success-400" : "text-gray-700 dark:text-gray-300"}`}>
                                                                    ₹{discountAmount.toFixed(2)}
                                                                </span>
                                                                {discountAmount > 0 && (
                                                                    <span className="text-xs text-success-500 dark:text-success-400">
                                                                        {((discountAmount / basePrice) * 100).toFixed(1)}% off
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">—</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Bottom save bar */}
                    {rows.length > 0 && (
                        <div className="mt-4 flex justify-end">
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={setDiscountsMutation.isPending}
                            >
                                {setDiscountsMutation.isPending ? "Saving..." : "Save All Discounts"}
                            </Button>
                        </div>
                    )}
                </ComponentCard>
            </div>
        </>
    );
}
