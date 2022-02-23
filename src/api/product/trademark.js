import request from '@/utils/request';

const trademarkBaseUrl = '/admin/product/baseTrademark';

export default {
    // 获取品牌列表
    getTrademarkPage(page,limit){
        if(page&&limit) return request.get(`${trademarkBaseUrl}/${page}/${limit}`);        
        return request.get(`${trademarkBaseUrl}/getTrademarkList`);
    },
    // 增加或修改品牌
    addOrUpdate(trademarkInfo,flag){
        if(flag) return request.post(`${trademarkBaseUrl}/save`,trademarkInfo);
        else return request.put(`${trademarkBaseUrl}/update`,trademarkInfo);
    },
    // 删除品牌
    deleteTrademark(id){
        return request.delete(`${trademarkBaseUrl}/remove/${id}`);
    }
};