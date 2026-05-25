import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Order } from "@/app/[locale]/admin/orders/page";

const patchOrderStatus = async (payload: {
  orderId: string;
  status: string;
}) => {
  const { data } = await axios.patch("/api/products/order", payload);
  return data;
};

export const useUpdateOrder = (
  pageNumber: number,
  setStatusOrder: (s: any) => void,
  status: string,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchOrderStatus,

    onMutate: async (vars) => {
      const ordersKey = ["orders", pageNumber, status];
      const statsKey = ["order-stats"];

      await queryClient.cancelQueries({ queryKey: ordersKey });
      await queryClient.cancelQueries({ queryKey: statsKey });

      const prevOrders = queryClient.getQueryData<Order[]>(ordersKey);
      const prevStats = queryClient.getQueryData<any[]>(statsKey);

      queryClient.setQueryData<Order[]>(
        ordersKey,
        (old) =>
          old?.map((o) =>
            o.id === vars.orderId ? { ...o, status: vars.status } : o,
          ) ?? [],
      );

      // --- التحديث المتفائل للإحصائيات (الـ Stats) ---
      queryClient.setQueryData<any[]>(statsKey, (oldStats) => {
        if (!oldStats) return oldStats;

        const orderBeforeUpdate = prevOrders?.find(
          (o) => o.id === vars.orderId,
        );
        const oldStatus = orderBeforeUpdate?.status;

        if (!oldStatus || oldStatus === vars.status) return oldStats;

        return oldStats.map((stat) => {
          if (stat.status === oldStatus) {
            return {
              ...stat,
              _count: { status: Math.max(0, stat._count.status - 1) },
            };
          }
          if (stat.status === vars.status) {
            return {
              ...stat,
              _count: { status: (stat._count.status || 0) + 1 },
            };
          }
          return stat;
        });
      });

      return { prevOrders, prevStats, ordersKey, statsKey };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prevOrders)
        queryClient.setQueryData(ctx.ordersKey, ctx.prevOrders);
      if (ctx?.prevStats) queryClient.setQueryData(ctx.statsKey, ctx.prevStats);
    },

    onSettled: () => {
      setStatusOrder(null);
      // في الآخر، اسحب الداتا الحقيقية من السيرفر للتأكيد
      // queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      // queryClient.invalidateQueries({
      //   queryKey: ["orders", pageNumber, status],
      // });
    },
  });
};
