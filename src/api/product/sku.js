import request from "@/utils/request";

export default {
  // 获取spu的销售属性
  reqSaleAttrList(spuId) {
    return request.get(`/admin/product/spuSaleAttrList/${spuId}`);
  },
  //   保存sku或更新sku
  addUpdate(skuInfo) {
    return request.post(`/admin/product/saveSkuInfo`, skuInfo);
  },
  //   用获取spu下所有sku的信息
  reqAllSkuInfo(spuId) {
    return request.get(`/admin/product/findBySpuId/${spuId}`);
  },
  //   获取指定页面的sku列表
  reqSkuByPage(page, limit) {
    return request.get(`/admin/product/list/${page}/${limit}`);
  },
  //   上架sku
  onSale(skuId) {
    return request.get(`/admin/product/onSale/${skuId}`);
  },
  //   下架sku
  cancelSale(skuId) {
    return request.get(`/admin/product/cancelSale/${skuId}`);
  },
  //   删除sku
  deleteSku(skuId) {
    return request.delete(`/admin/product/deleteSku/${skuId}`);
  },
  //   获取指定sku的详细信息
  reqSkuInfo(skuId) {
    return request.get(`/admin/product/getSkuById/${skuId}`);
  },
};
