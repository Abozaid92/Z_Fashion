// import { useQueryClient, useMutation } from "@tanstack/react-query";
// import { fetchToggleFavorite } from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";
// import { Product } from "@/lib/data";
// const useFavoriteMutation = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     // product === props we will send in clothesCard
//     mutationFn: async (product: Product) => fetchToggleFavorite(product.id),
//     // onMutate: async (clickedProduct: Product) => {
//     //   await queryClient.cancelQueries({ queryKey: ["clothes"] });

//     //   // old data
//     //   const previousQueries = queryClient.getQueriesData({
//     //     queryKey: ["clothes"],
//     //   });

//     //   queryClient.setQueriesData({ queryKey: ["clothes"] }, (old: any) => {
//     //     if (Array.isArray(old)) {
//     //       return old.map((item) =>
//     //         item.id === clickedProduct.id ?
//     //           { ...item, favorite: { id: item.id } }
//     //         : item,
//     //       );
//     //     }

//     //     if (old?.data) {
//     //       return {
//     //         ...old,
//     //         data: old.data.map((item: any) =>
//     //           item.id === clickedProduct.id ?
//     //             { ...item, favorite: item.id }
//     //           : item,
//     //         ),
//     //       };
//     //     }
//     //     return old;
//     //   });

//     //   return { previousQueries };
//     // },

//     // onError: (err, newTodo, context) => {
//     //   // الـ Rollback هنا بيلف يرجع كل الـ Queries لأصلها
//     //   context?.previousQueries?.forEach(([queryKey, oldData]) => {
//     //     queryClient.setQueryData(queryKey, oldData);
//     //   });
//     // },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["clothes"], exact: false });
//     },
//   });
// };
// export default useFavoriteMutation;
