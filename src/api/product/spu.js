import request from "@/utils/request";

export default {
  // 获取spu列表
  reqList(page, limit, category3Id) {
    return request({
      url: `/admin/product/${page}/${limit}`,
      method: "get",
      params: {
        category3Id,
      },
    });
  },
  // 获取spu信息
  reqSpuInfo(spuId) {
    return request.get(`/admin/product/getSpuById/${spuId}`);
  },
  // 获取spu图片列表
  reqSpuImgList(spuId) {
    return request.get(`/admin/product/spuImageList/${spuId}`);
  },
  // 获取spu所有的销售属性
  reqSpuSaleBase() {
    return request.get(`/admin/product/baseSaleAttrList`);
  },
  // 删除spu
  delSpu(spuId) {
    return request.delete(`/admin/product/deleteSpu/${spuId}`);
  },
  // 保存spu信息
  save(spuInfo) {
    if (spuInfo.id)
      return request.post(`/admin/product/updateSpuInfo`, spuInfo);
    else return request.post(`/admin/product/saveSpuInfo`, spuInfo);
  },
};
