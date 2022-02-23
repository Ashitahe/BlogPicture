import request from "@/utils/request";

export default {
  //   获取商品属性值
  reqAttrs({ category1Id, category2Id, category3Id }) {
    return request.get(
      `/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`
    );
  },
  //   添加商品属性值
  addAttrInfo(AttrInfo) {
    return request.post(`/admin/product/saveAttrInfo`, AttrInfo);
  },
  //   删除商品属性
  deleteAttr(attrId) {
    return request.delete(`/admin/product/deleteAttr/${attrId}`);
  },
};
