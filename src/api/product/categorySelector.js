import request from "@/utils/request";

export default {
  // 获取一级分类列表
  reqCate1List() {
    return request.get(`/admin/product/getCategory1`);
  },
  // 获取二级分类列表
  reqCate2List(category1Id) {
    return request.get(`/admin/product/getCategory2/${category1Id}`);
  },
  // 获取三级分类列表
  reqCate3List(category2Id) {
    return request.get(`/admin/product/getCategory3/${category2Id}`);
  },
  // 删除分类
  deleteCategory({ id, level }) {
    if (level === 1) {
      return request.delete(`/admin/product/removeCategory1/${id}`);
    } else if (level === 2) {
      return request.delete(`/admin/product/removeCategory2/${id}`);
    } else {
      return request.delete(`/admin/product/removeCategory3/${id}`);
    }
  },
  // 添加分类
  add(category) {
    if (category.level === 1) {
      return request.post(`/admin/product/saveCategory2`, {
        category1Id: category.id,
        name: category.name,
      });
    } else if (category.level === 2) {
      return request.post(`/admin/product/saveCategory3`, {
        category2Id: category.id,
        name: category.name,
      });
    } else {
      return request.post(`/admin/product/saveCategory`, {
        name: category.name,
      });
    }
  },
  // 修改分类
  update(category) {
    if (category.level === 1) {
      return request.put(`/admin/product/updateeCategory1`, {
        id: category.id,
        name: category.inputValue,
      });
    } else if (category.level === 2) {
      return request.put(`/admin/product/updateeCategory2`, {
        category1Id: category.category1Id,
        id: category.id,
        name: category.inputValue,
      });
    } else {
      return request.put(`/admin/product/updateeCategory3`, {
        category2Id: category.category2Id,
        id: category.id,
        name: category.inputValue,
      });
    }
  },
};
