<template>
  <div>
    <el-form ref="form" :model="spu" label-width="80px">
      <el-form-item label="SPU名称">
        <el-input v-model="spu.spuName" placeholder="请输入SPU名称"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select v-model="spu.tmId" placeholder="请选择品牌">
          <el-option
            v-for="trademark in trademarkList"
            :label="trademark.tmName"
            :value="trademark.id"
            :key="trademark.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          v-model="spu.description"
          rows="4"
          placeholder="SPU描述"
        ></el-input>
      </el-form-item>
      <!-- SPU图片上传区 -->
      <el-form-item label="SPU图片">
        <el-upload
          :file-list="spuImgList"
          :action="`${$BASE_API}/admin/product/fileUpload`"
          list-type="picture-card"
          :on-success="handleUploaded"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <!-- 图片放大器 -->
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select
          v-model="attrNameId"
          :placeholder="
            surplusSaleAttrs.length === 0
              ? '没有辣!'
              : `剩余${surplusSaleAttrs.length}项未选择`
          "
        >
          <el-option
            :label="saleAttrs.name"
            :value="`${saleAttrs.name}:${saleAttrs.id}`"
            v-for="saleAttrs in surplusSaleAttrs"
            :key="saleAttrs.id"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="attrNameId === ''"
          @click="addToTable"
          >添加销售属性</el-button
        >
      </el-form-item>
      <!-- 属性名称展示列表 -->
      <el-form-item>
        <el-table style="width: 100%" border :data="spu.spuSaleAttrList">
          <el-table-column label="序号" type="index" width="80" align="center">
          </el-table-column>
          <el-table-column label="属性名" width="160" prop="saleAttrName">
          </el-table-column>
          <el-table-column label="属性值名称列表" prop="spuSaleAttrList">
            <template slot-scope="{ row, $index }">
              <el-tag
                :key="saleValue.id"
                v-for="(saleValue, index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index, 1)"
              >
                {{ saleValue.saleAttrValueName }}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="row.inputVisible"
                :ref="$index"
                v-model="row.saleAttrValueName"
                size="small"
                @keyup.enter.native="handleInputConfirm(row, $index)"
                @blur="handleInputConfirm(row, $index)"
              >
              </el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput(row, $index)"
                >+ 添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ $index }">
              <HitButton
                type="danger"
                size="mini"
                icon="el-icon-delete"
                @click="spu.spuSaleAttrList.splice($index, 1)"
                title="删除"
              ></HitButton>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <!-- 保存按钮 -->
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { spu } from "@/api";
export default {
  name: "SpuForm",
  data() {
    return {
      //   图片上传控件
      //   控制图片放大器
      dialogVisible: false,
      dialogImageUrl: "",
      //   添加或修改spu
      spu: {
        category3Id: 0,
        spuName: "",
        description: "",
        tmId: "",
        spuImageList: [], // 上传的spu图片
        spuSaleAttrList: [], // spu属性
      },
      // 展示的spu的图片
      spuImgList: [],
      // spu的全部销售属性
      spuSale: [],
      trademarkList: [], // 品牌属性列表
      attrNameId: "", // 销售属性的名称和id
    };
  },
  computed: {
    // 计算剩余未选择的销售属性
    surplusSaleAttrs() {
      // 过滤出未选择的销售属性
      return this.spuSale.filter((item) =>
        // 将一个销售属性和spu内已经有的销售属性比较
        // 如果一个spuSale.name不和spu里的saleName重名则返回true保留下俩，若重名则返回false除去
        this.spu.spuSaleAttrList.every(
          (element) => element.saleAttrName !== item.name
        )
      );
    },
  },
  methods: {
    // 重置数据
    resetData() {
      this.dialogImageUrl = ""; // 大图的url
      this.dialogVisible = false; // 标识大图dilaog是否显示

      this.spuId = ""; // SPU ID
      this.spuInfo = {
        // SPU详情信息对象
        category3Id: null, // 3级分类ID
        spuName: "", // spu名称
        description: "", // spu描述
        tmId: null, // spu的品牌id
        spuSaleAttrList: [], // spu的销售属性列表
        spuImageList: [], // spu图片列表
      };
      this.spuSale = [];
      this.spuImgList = [];
      this.trademarkList = [];
      this.attrNameId = "";
    },
    // 取消按钮
    cancel() {
      this.$emit("update:visible", false);
      this.$emit("cancel");
      this.resetData();
    },
    // 发送请求
    async save() {
      // 整理参数
      // 1、整理图片
      let saveImg = [];
      this.spuImgList.forEach((item) => {
        saveImg.push({
          imgName: item.name,
          imgUrl: item.url,
        });
      });
      this.spu.spuImageList = saveImg;
      // 整理tag参数
      let { spuSaleAttrList } = this.spu;
      this.spu.spuSaleAttrList = spuSaleAttrList.filter((item) => {
        delete item.inputVisible;
        delete item.saleAttrValueName;
        return item.spuSaleAttrValueList.length > 0;
      });
      // 发送请求
      try {
        console.log("要发送的数据", this.spu);
        const res = await this.$API.spu.save(this.spu);
        if (res.code === 200) {
          this.$message.success("保存成功");
          // 通知父组件
          this.$emit("update:visible", false); // 回到列表页面
          this.$emit("success");
          // 重置数据
          this.resetData();
        }
      } catch (error) {
        this.$message.error(error);
      }
    },
    //   图片上传成功回调
    handleUploaded(res, file, fileList) {
      this.spuImgList.push({
        name: file.name,
        url: res.data,
      });
    },
    //   图片删除回调
    handleRemove(file, fileList) {
      this.spuImgList = fileList;
    },
    //   图片预览回调
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.imgUrl;
      this.dialogVisible = true;
    },
    // 控制tag输入框回调
    handleInputConfirm(tag, index) {
      tag.inputVisible = false;
      // 将收集到的参数保存
      const { saleAttrValueName, baseSaleAttrId } = tag;
      // 检查是否有重复tag名称
      const isRepeat = tag.spuSaleAttrValueList.some(
        (item) => item.saleAttrValueName === saleAttrValueName
      );
      if (isRepeat) {
        this.$message.error("该属性值已存在");
        tag.saleAttrValueName = "";
        this.$nextTick(() => this.$refs[index].focus());
        return;
      }
      // 有东西时保存
      if (saleAttrValueName && baseSaleAttrId) {
        // 除去两端空格 将数据保存进数组
        if (saleAttrValueName.trim()) {
          tag.spuSaleAttrValueList.push({
            saleAttrValueName,
            baseSaleAttrId,
          });
        } else {
          this.$message.error("属性值不能为空");
        }
      }
      tag.saleAttrValueName = "";
    },
    // tag添加按钮回调
    showInput(tag, index) {
      console.log(tag);
      // 让控制input显示的按钮挂载在tag对象上
      if (!tag.hasOwnProperty("inputVisible")) {
        this.$set(tag, "inputVisible", true);
      } else {
        tag.inputVisible = true;
      }
      // 让输入框自动获取焦点
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },
    // 将选择的销售属性值加入展示表格
    addToTable() {
      const [saleAttrName, baseSaleAttrId] = this.attrNameId.split(":");
      const spuSaleAttr = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [], // 用于保存销售属性值的数组
      };
      // 加入属性数组中
      this.spu.spuSaleAttrList.push(spuSaleAttr);
      // 清空attrNameId
      this.attrNameId = "";
    },

    // spu添加初始化
    async initUpdateSpu(spuId) {
      this.spuId = spuId;
      // 获取spu信息
      const resInfo = await this.$API.spu.reqSpuInfo(spuId);
      if (resInfo.code === 200) {
        this.spu = resInfo.data;
      }
      // 获取spu图片列表
      const resImg = await this.$API.spu.reqSpuImgList(spuId);
      if (resImg.code === 200) {
        const spuImgList = resImg.data;
        // 先修改再赋值，保证是响应式数据
        spuImgList.forEach((element) => {
          element.name = element.imgName;
          element.url = element.imgUrl;
        });
        this.spuImgList = spuImgList;
      }
      // 获取品牌列表
      this.getTrademarkList();
      // 获取销售属性列表
      const saleAttrs = await this.$API.spu.reqSpuSaleBase();
      if (saleAttrs.code === 200) {
        this.spuSale = saleAttrs.data;
      }
    },
    async initAddSpu(category3Id) {
      this.spu.category3Id = category3Id;
      // 获取品牌列表
      this.getTrademarkList();
      // 获取销售属性列表
      const saleAttrs = await this.$API.spu.reqSpuSaleBase();
      if (saleAttrs.code === 200) {
        this.spuSale = saleAttrs.data;
      }
    },
    //   获取品牌列表
    async getTrademarkList() {
      try {
        const res = await this.$API.trademark.getTrademarkPage();
        if (res.code === 200) {
          this.trademarkList = res.data;
        }
      } catch (error) {
        this.$message.error("获取品牌列表失败", error);
      }
    },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
