<template>
  <div>
    <el-form ref="skuForm" label-width="80px">
      <el-form-item label="SPU名称">
        <span>{{ spuName }}</span>
      </el-form-item>
      <el-form-item label="SKU名称">
        <el-input placeholder="SKU名称" v-model="sku.skuName"></el-input>
      </el-form-item>
      <el-form-item label="价格(元)">
        <el-input
          placeholder="SKU价格"
          v-model="sku.price"
          type="number"
        ></el-input>
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input
          placeholder="SKU重量"
          v-model="sku.weight"
          type="number"
        ></el-input>
      </el-form-item>
      <el-form-item label="规格描述">
        <el-input
          type="textarea"
          rows="4"
          placeholder="SKU规格描述"
          v-model="sku.skuDesc"
        ></el-input>
      </el-form-item>
      <el-form-item label="平台属性">
        <el-form inline label-width="80px">
          <el-form-item
            :label="platAttr.attrName"
            v-for="platAttr in platForm"
            :key="platAttr.id"
          >
            <el-select v-model="platAttr.attrIdValueId" placeholder="请选择">
              <el-option
                :label="option.valueName"
                :value="`${platAttr.id}:${option.id}`"
                v-for="option in platAttr.attrValueList"
                :key="option.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-form inline label-width="80px">
          <el-form-item
            :label="sale.saleAttrName"
            v-for="sale in saleForm"
            :key="sale.id"
          >
            <el-select v-model="sale.saleAttrValueId" placeholder="请选择">
              <el-option
                :label="saleValue.saleAttrValueName"
                :value="saleValue.id"
                v-for="saleValue in sale.spuSaleAttrValueList"
                :key="saleValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片列表">
        <el-table
          :data="imgList"
          @selection-change="handleSelectionChange"
          border
        >
          <el-table-column type="selection" width="80" align="center">
          </el-table-column>
          <el-table-column label="图片">
            <template slot-scope="{ row }">
              <img :src="row.imgUrl" style="width: 100px; height: 100px" />
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="imgName"></el-table-column>
          <el-table-column label="操作" show-overflow-tooltip>
            <template slot-scope="{ row }">
              <el-tag type="success" v-if="row.isDefault === '1'">默认</el-tag>
              <el-button
                v-else
                type="primary"
                size="mini"
                @click="setDefaultImg(row)"
                >设为默认</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="back">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SkuForm",
  data() {
    return {
      platForm: {}, // spu平台属性表单
      saleForm: {}, //spu销售属性表单
      imgList: [], //spu图片列表
      selectedSpuImageList: [], // 所有选中的spu图片列表
      spuName: "", // spu名称
      // sku所有数据
      sku: {
        category3Id: null,
        spuId: null,
        tmId: null, // 品牌id

        skuDesc: "", //sku描述
        skuName: "", // sku名称
        price: null, // sku价格
        weight: null, // sku权重

        skuDefaultImg: "", // sku默认的图片
        skuAttrValueList: [], // sku平台属性
        skuSaleAttrValueList: [], // sku销售属性
        skuImageList: [], // 选中的sku图片
      },
    };
  },
  methods: {
    async init(skuInfo) {
      // 获取平台属性
      const { spu, category3Id } = skuInfo;
      // spuId、category3Id、spuName整理好并初始化
      this.spuName = spu.spuName;
      this.sku.category3Id = category3Id;
      this.sku.spuId = spu.id;
      this.sku.tmId = spu.tmId;
      // 获取spu平台属性列表
      const reqAttr = this.$API.attrs.reqAttrs(skuInfo);
      // 获取spu销售属性列表
      const reqSaleAttr = this.$API.sku.reqSaleAttrList(spu.id);
      // 获取spu图片列表
      const reqImg = this.$API.spu.reqSpuImgList(spu.id);
      try {
        const res = await Promise.all([reqAttr, reqSaleAttr, reqImg]);
        // 过滤出数据
        const finalRes = [];
        res.forEach((item, index) => {
          if (item.code === 200) {
            if (index === 2) {
              // 给每个图片对象添加isDefault属性
              const mapImg = item.data.map((element) => {
                element.isDefault = "0";
                return element;
              });
              finalRes.push(mapImg);
            } else {
              finalRes.push(item.data);
            }
          }
        });
        // 直接解构出数据
        [this.platForm, this.saleForm, this.imgList] = finalRes;
      } catch (error) {
        this.$message.error(error);
      }
    },
    // 选择图片时的回调
    handleSelectionChange(val) {
      this.selectedSpuImageList = val;
    },
    // 设置默认图片
    setDefaultImg(img) {
      this.imgList.forEach((item) => (item.isDefault = "0"));
      img.isDefault = "1";
      this.sku.skuDefaultImg = img.imgUrl;
    },
    // 重置参数
    resetData() {
      this.platForm = {}; // spu平台属性表单
      this.saleForm = {}; //spu销售属性表单
      this.imgList = []; //spu图片列表
      this.selectedSpuImageList = []; // 所有选中的spu图片列表
      this.spuName = ""; // spu名称
      // sku所有数据
      this.sku = {
        category3Id: null,
        spuId: null,
        tmId: null, // 品牌id

        skuDesc: "", //sku描述
        skuName: "", // sku名称
        price: null, // sku价格
        weight: null, // sku权重

        skuDefaultImg: "", // sku默认的图片
        skuAttrValueList: [], // sku平台属性
        skuSaleAttrValueList: [], // sku销售属性
        skuImageList: [], // 选中的sku图片
      };
    },
    // 保存当前收集的spu信息
    async save() {
      const { sku, platForm, selectedSpuImageList, saleForm } = this;
      // 整理平台属性参数
      platForm.forEach((item) => {
        if (item.attrIdValueId) {
          const [attrId, valueId] = item.attrIdValueId.split(":");
          sku.skuAttrValueList.push({
            attrId,
            valueId,
          });
        }
      });
      // 整理销售属性参数
      sku.skuSaleAttrValueList = saleForm.reduce((pre, item) => {
        if (item.saleAttrValueId) {
          pre.push({ saleAttrValueId: item.saleAttrValueId });
        }
        return pre;
      }, []);
      // 整理图片属性参数
      sku.skuImageList = selectedSpuImageList.map((item) => ({
        imgName: item.imgName,
        imgUrl: item.imgUrl,
        spuImgId: item.id,
        isDefault: item.isDefault,
      }));
      try {
        const res = await this.$API.sku.addUpdate(sku);
        if (res.code === 200) {
          // 通知父组件
          this.$emit("update:visible", false);
          this.$emit("success");
          // 清空参数
          this.resetData();
        }
      } catch (error) {
        this.$message.error(error);
      }
    },
    // 回到主页面
    back() {
      this.$emit("update:visible", false);
      this.$emit("skuBack");
      this.resetData();
    },
  },
};
</script>
